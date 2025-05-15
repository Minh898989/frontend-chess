import React, { useEffect, useState, useRef } from 'react';
import Chess from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import "../styles/chess.css";

const API_BASE = 'https://backend-chess-fjr7.onrender.com';

const GameScreen = () => {
  const { roomCode } = useParams();
  const socketRef = useRef(null);
  const gameRef = useRef(new Chess());
  const startTimeRef = useRef(null);

  const [fen, setFen] = useState('start');
  const [playerColor, setPlayerColor] = useState(null);
  const [status, setStatus] = useState('⏳ Waiting for opponent...');
  const [room, setRoom] = useState(null);
  const [capturedWhite, setCapturedWhite] = useState([]);
  const [capturedBlack, setCapturedBlack] = useState([]);

  // Fetch room info once on load
  useEffect(() => {
    axios.get(`${API_BASE}/api/rooms/${roomCode}`)
      .then(res => setRoom(res.data.room))
      .catch(console.error);
  }, [roomCode]);

  // Setup socket connection
  useEffect(() => {
    const socket = io(API_BASE, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('joinRoom', roomCode);

    socket.on('startGame', ({ color }) => {
      setPlayerColor(color);
      setStatus('🎮 Game started');
      startTimeRef.current = Date.now();
      gameRef.current.reset();
      setFen(gameRef.current.fen());
      setCapturedWhite([]);
      setCapturedBlack([]);
    });

    socket.on('roomFull', () => {
      setStatus('❌ Room is full. Please try another room.');
      alert('Room is full. Cannot join this room.');
    });

    socket.on('move', ({ move }) => handleOpponentMove(move));

    socket.on('opponentResigned', ({ winner, loser }) => {
      if (winner && loser) {
        setStatus(`🏆 ${winner} thắng! Đối thủ (${loser}) đã đầu hàng.`);
      } else {
        setStatus('🏆 Opponent resigned. You win!');
      }
    });

    return () => {
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  const handleOpponentMove = (move) => {
    const game = new Chess(gameRef.current.fen());
    const result = game.move(move);
    if (result) {
      updateCapturedPieces(gameRef.current, game);
      gameRef.current = game;
      setFen(game.fen());

      if (game.game_over()) {
        setStatus('🏁 Game over');
      }
    }
  };

  const updateCapturedPieces = (prevGame, newGame) => {
    const prevPieces = prevGame.board().flat().filter(Boolean);
    const newPieces = newGame.board().flat().filter(Boolean);

    const countPieces = (pieces) =>
      pieces.reduce((acc, p) => {
        const key = p.color + p.type;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

    const prevCount = countPieces(prevPieces);
    const newCount = countPieces(newPieces);

    for (const key in prevCount) {
      const diff = (prevCount[key] || 0) - (newCount[key] || 0);
      if (diff > 0) {
        const color = key[0];
        const type = key[1];
        for (let i = 0; i < diff; i++) {
          if (color === 'w') setCapturedWhite(prev => [...prev, type]);
          else setCapturedBlack(prev => [...prev, type]);
        }
      }
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    if (!playerColor) return false;

    const game = new Chess(gameRef.current.fen());
    if (game.turn() !== playerColor[0] || game.game_over()) return false;

    const move = { from: sourceSquare, to: targetSquare, promotion: 'q' };
    const result = game.move(move);

    if (result) {
      updateCapturedPieces(gameRef.current, game);
      gameRef.current = game;
      setFen(game.fen());

      socketRef.current?.emit('move', { roomCode, move });

      if (game.game_over()) setStatus('🏁 Game over');
      return true;
    }

    return false;
  };

  const handleResign = async () => {
    if (!room) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserid = user.userid;
    if (!currentUserid) return;

    const { host_userid, guest_userid } = room;
    const winnerId = currentUserid === host_userid ? guest_userid : host_userid;
    const loserId = currentUserid;

    if (!winnerId || !loserId) {
      setStatus('❌ Cannot determine winner.');
      return;
    }

    const durationMinutes = Math.round((Date.now() - startTimeRef.current) / 60000);
    const winnerCaptured = winnerId === host_userid ? capturedWhite.length : capturedBlack.length;
    const loserCaptured = loserId === host_userid ? capturedWhite.length : capturedBlack.length;

    socketRef.current.emit('resign', { winner: winnerId, loser: loserId });

    try {
      await axios.post(`${API_BASE}/api/resign`, {
        winnerId,
        loserId,
        winnerCaptured,
        loserCaptured,
        startTime: new Date(startTimeRef.current).toISOString(),
        durationMinutes,
      });
      setStatus(`🏳️ Bạn đã đầu hàng. ${winnerId} thắng cuộc.`);
    } catch (err) {
      console.error(err);
      setStatus('❌ Gửi thống kê thất bại.');
    }
  };

  const pieceUnicode = {
    p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
    P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
  };

  const renderCaptured = (captured, color) => (
    <div className="captured-pieces">
      {captured.map((type, idx) => (
        <span key={idx} className={`captured-piece ${color}`}>
          {pieceUnicode[color === 'white' ? type.toUpperCase() : type.toLowerCase()]}
        </span>
      ))}
    </div>
  );

  return (
    <div className="game-container">
      <h2>♟️ Online Chess - Room {roomCode}</h2>

      {room && (
        <div className="player-panel">
          <div className="player-card host">
            <span>👑 <strong>{room.host_userid}</strong></span>
            {renderCaptured(playerColor === 'white' ? capturedBlack : capturedWhite, 'white')}
          </div>
          <div className="player-card guest">
            <span>🧑‍💼 <strong>{room.guest_userid || 'Waiting...'}</strong></span>
            {renderCaptured(playerColor === 'white' ? capturedWhite : capturedBlack, 'black')}
          </div>
        </div>
      )}

      <div className="status-bar">{status}</div>

      <div className="board-section">
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          boardOrientation={playerColor || 'white'}
          arePiecesDraggable={
            playerColor &&
            gameRef.current.turn() === playerColor[0] &&
            !gameRef.current.game_over()
          }
          boardWidth={Math.min(window.innerWidth * 0.9, 500)}
        />
      </div>

      <button className="btn-resign" onClick={handleResign}>🏳️ Resign</button>
    </div>
  );
};

export default GameScreen;
