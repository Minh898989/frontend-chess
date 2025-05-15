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
  const gameRef = useRef(game); // giữ bản mới nhất
  const [fen, setFen] = useState('start');
  const [playerColor, setPlayerColor] = useState(null);
  const [status, setStatus] = useState('⏳ Waiting for opponent...');
  const [room, setRoom] = useState(null); 
  

  // Cập nhật ref game
  useEffect(() => {
    gameRef.current = game;
  }, [game]);
  
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
      console.log(`🎯 You are assigned: ${color}`);
      console.log(`🔧 Socket ID: ${socket.id}`);
      setPlayerColor(color);
      setStatus('🎮 Game started');
    });

    socket.on('roomFull', () => {
      setStatus('❌ Room is full. Please try another room.');
      alert('Room is full. Cannot join this room.');
    });

    socket.on('move', ({ move, fen }) => {
      console.log('📥 Received move from opponent:', move);
      const newGame = new Chess(fen);
      setGame(newGame);
      gameRef.current = newGame;
      setFen(fen);
    });

    socket.on('opponentResigned', (user) => {
      setStatus(`🏆 Opponent (${user}) resigned. You win!`);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomCode]);

  const onDrop = (sourceSquare, targetSquare) => {
    if (!playerColor) return false;

    const newGame = new Chess(game.fen());
    console.log(`🚫 Turn: ${newGame.turn()}, Player: ${playerColor}`);

    // Kiểm tra đúng lượt
    if (newGame.turn() !== playerColor[0] || newGame.game_over()) return false;

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    };

    const result = newGame.move(move);

    if (result) {
      setGame(newGame);
      setFen(newGame.fen());

      if (socketRef.current) {
        socketRef.current.emit('move', { roomCode, move, fen: newGame.fen() });
      }

      if (newGame.game_over()) {
        setStatus('🏁 Game over');
      }

      return true;
    }

    return false;
  };

  const handleResign = () => {
    if (socketRef.current && playerColor) {
      socketRef.current.emit('resign', {
        roomCode,
        user: playerColor,
      });
    }
    setStatus('🏳️ You resigned');
  };

  return (
    <div className="game-container">
  <h2 className="game-title">♟️ Online Chess - Room {roomCode}</h2>

  {room && (
    <div className="player-panel">
      <div className="player-card host">
        <span>👑 <strong>{room.host_userid}</strong></span>
        
      </div>
      <div className="player-card guest">
        <span>🧑‍💼 <strong>{room.guest_userid || 'Waiting...'}</strong></span>
        
      </div>
    </div>
  )}

  <div className="status-bar">
    <span>{status}</span>
  </div>

  <div className="board-section">
    <Chessboard
      position={fen}
      onPieceDrop={onDrop}
      boardOrientation={playerColor || 'white'}
      arePiecesDraggable={playerColor && gameRef.current.turn() === playerColor[0] && !gameRef.current.game_over()}
      boardWidth={Math.min(window.innerWidth * 0.9, 500)}
    />
  </div>

  <button className="btn-resign" onClick={handleResign}>🏳️ Resign</button>
</div>

  );
};

export default GameScreen;
