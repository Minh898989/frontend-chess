import React, { useEffect, useState, useRef } from 'react';
import Chess from 'chess.js'; // ✅ Import đúng cho chess.js v0.12.0
import { Chessboard } from 'react-chessboard';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import '../styles/chess.css';

const API_BASE = 'https://backend-chess-fjr7.onrender.com';

const GameScreen = () => {
  const { roomCode } = useParams();
  const socketRef = useRef(null);
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState('start');
  const [playerColor, setPlayerColor] = useState('white');
  const [status, setStatus] = useState('⏳ Waiting for opponent...');

  useEffect(() => {
    const socket = io(API_BASE, { transports: ['websocket'] });
    socketRef.current = socket;

    // Tham gia phòng
    socket.emit('joinRoom', roomCode);

    // Nhận thông báo bắt đầu game
    socket.on('startGame', ({ color }) => {
      setPlayerColor(color);
      setStatus('🎮 Game started');
    });


    // Nhận nước đi từ đối thủ
    socket.on('move', (move) => {
      setGame((prevGame) => {
        const newGame = new Chess();
        newGame.load(prevGame.fen());
        newGame.move(move);
        setFen(newGame.fen());
        return newGame;
      });
    });

    // Nhận thông báo đối thủ đầu hàng
    socket.on('opponentResigned', (user) => {
      setStatus(`🏆 Opponent (${user}) resigned. You win!`);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomCode]);

  const onDrop = (sourceSquare, targetSquare) => {
    const newGame = new Chess();
    newGame.load(game.fen());

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // luôn phong hậu
    };

    const result = newGame.move(move);

    if (result) {
      setGame(newGame);
      setFen(newGame.fen());

      socketRef.current.emit('move', { roomCode, move });

      if (newGame.game_over()) {
        setStatus('🏁 Game over');
      }
    }
  };

  const handleResign = () => {
    socketRef.current.emit('resign', {
      roomCode,
      user: playerColor,
    });
    setStatus('🏳️ You resigned');
  };

 return (
  <div className="chess-wrapper">
    <h2 className="room-title">♟️ Online Chess - Room {roomCode}</h2>
    <div className="chess-status">
      <span><strong>You:</strong> {playerColor.toUpperCase()}</span>
      <span><strong>Status:</strong> {status}</span>
    </div>
    <div className="board-container">
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        boardOrientation={playerColor}
        arePiecesDraggable={game.turn() === playerColor[0] && !game.game_over()}
        boardWidth={Math.min(window.innerWidth * 0.9, 500)} 
        customDarkSquareStyle={{ backgroundColor: '#334155' }}
        customLightSquareStyle={{ backgroundColor: '#e2e8f0' }}
      />
    </div>
    <button className="resign-button" onClick={handleResign}>
      🏳️ Resign
    </button>
  </div>
);

};

export default GameScreen;
