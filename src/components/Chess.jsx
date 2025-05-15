import React, { useEffect, useState, useRef } from 'react';
import Chess from 'chess.js'; // v0.12.0
import { Chessboard } from 'react-chessboard';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import '../styles/chess.css';

const API_BASE = 'https://backend-chess-fjr7.onrender.com';

const GameScreen = () => {
  const { roomCode } = useParams();
  const socketRef = useRef(null);
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState('start');
  const [playerColor, setPlayerColor] = useState(null);
  const [status, setStatus] = useState('⏳ Waiting for opponent...');
  const [room, setRoom] = useState(null);
  const [capturedWhite, setCapturedWhite] = useState([]);
  const [capturedBlack, setCapturedBlack] = useState([]);
  const startTimeRef = useRef(null);

  // Cập nhật tham chiếu game mới nhất
  const gameRef = useRef(game);
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // Lấy thông tin phòng
  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/rooms/${roomCode}`);
        setRoom(res.data.room);
      } catch (err) {
        console.error('Error fetching room:', err);
      }
    };
    fetchRoomInfo();
  }, [roomCode]);

  // Kết nối socket
  useEffect(() => {
    const socket = io(API_BASE, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('joinRoom', roomCode);

    socket.on('startGame', ({ color }) => {
      setPlayerColor(color);
      setStatus('🎮 Game started');
      startTimeRef.current = Date.now();
    });

    socket.on('roomFull', () => {
      setStatus('❌ Room is full. Please try another room.');
      alert('Room is full. Cannot join this room.');
    });

    socket.on('move', ({ move, fen }) => {
      const newGame = new Chess(fen);
      updateCapturedPieces(gameRef.current, newGame);
      setGame(newGame);
      setFen(fen);
    });

    socket.on('opponentResigned', (data) => {
      if (typeof data === 'object' && data.winner && data.loser) {
        setStatus(`🏆 ${data.winner} thắng! Đối thủ (${data.loser}) đã đầu hàng.`);
      } else {
        const username = typeof data === 'string' ? data : 'Unknown';
        setStatus(`🏆 Opponent (${username}) resigned. You win!`);
      }
    });

    return () => socket.disconnect();
  }, [roomCode]);

  const updateCapturedPieces = (prevGame, newGame) => {
    const prev = prevGame.board().flat().filter(Boolean);
    const next = newGame.board().flat().filter(Boolean);

    const count = (arr) => arr.reduce((acc, p) => {
      const key = p.color + p.type;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const prevCount = count(prev);
    const newCount = count(next);

    for (const key in prevCount) {
      const diff = prevCount[key] - (newCount[key] || 0);
      if (diff > 0) {
        const color = key[0];
        const type = key[1];
        for (let i = 0; i < diff; i++) {
          if (color === 'w') setCapturedWhite((prev) => [...prev, type]);
          else setCapturedBlack((prev) => [...prev, type]);
        }
      }
    }
  };

  const onDrop = (source, target) => {
    if (!playerColor) return false;
    const newGame = new Chess(game.fen());

    if (newGame.turn() !== playerColor[0] || newGame.game_over()) return false;

    const move = { from: source, to: target, promotion: 'q' };
    const result = newGame.move(move);

    if (result) {
      updateCapturedPieces(game, newGame);
      setGame(newGame);
      setFen(newGame.fen());

      socketRef.current?.emit('move', { roomCode, move, fen: newGame.fen() });

      if (newGame.game_over()) setStatus('🏁 Game over');

      return true;
    }
    return false;
  };

  const handleResign = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserid = user.userid;
    if (!room || !currentUserid) return;

    const hostId = room.host_userid;
    const guestId = room.guest_userid;
    const loserId = currentUserid;
    const winnerId = currentUserid === hostId ? guestId : hostId;

    if (!winnerId || !loserId) {
      setStatus('❌ Cannot determine winner.');
      return;
    }

    
    const winnerCaptured = winnerId === hostId ? capturedWhite.length : capturedBlack.length;
    const loserCaptured = loserId === hostId ? capturedWhite.length : capturedBlack.length;

    socketRef.current.emit('resign', { winner: winnerId, loser: loserId });

    try {
      await axios.post(`${API_BASE}/api/resign`, {
        winnerId,
        loserId,
        winnerCaptured,
        loserCaptured,
        startTime: new Date(startTimeRef.current).toISOString(),
      });
      setStatus(`🏳️ Bạn đã đầu hàng. ${winnerId} thắng cuộc.`);
    } catch (err) {
      console.error('Error reporting resign:', err);
      setStatus('❌ Gửi thống kê thất bại.');
    }
  };

  const pieceUnicode = {
    p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
    P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
  };

  const renderCaptured = (captured, color) => (
    <div className="captured-pieces">
      {captured.map((type, i) => (
        <span key={i} className={`captured-piece ${color}`}>
          {pieceUnicode[color === 'white' ? type.toUpperCase() : type.toLowerCase()]}
        </span>
      ))}
    </div>
  );

  return (
    <div className="game-container">
      <h2 className="game-title">♟️ Online Chess - Room {roomCode}</h2>

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

      <div className="status-bar"><span>{status}</span></div>

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
