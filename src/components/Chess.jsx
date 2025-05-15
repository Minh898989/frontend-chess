import React, { useEffect, useState, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';


const API_BASE = 'https://backend-chess-fjr7.onrender.com';

const GameScreen = () => {
  const { roomCode } = useParams();
  const socketRef = useRef(null);
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const [playerColor, setPlayerColor] = useState('white');

  useEffect(() => {
    socketRef.current = io(API_BASE, { transports: ['websocket'] });

    // Join socket room
    socketRef.current.emit('joinRoom', roomCode);

    // Xác định màu quân cờ
    socketRef.current.on('playerColor', (color) => {
      setPlayerColor(color);
    });

    // Nhận nước đi từ đối thủ
    socketRef.current.on('opponentMove', (move) => {
      const newGame = new Chess(game.fen());
      newGame.move(move);
      setGame(newGame);
      setFen(newGame.fen());
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [game, roomCode]);

  const onDrop = (sourceSquare, targetSquare) => {
    const newGame = new Chess(game.fen());
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    };

    const result = newGame.move(move);
    if (result) {
      setGame(newGame);
      setFen(newGame.fen());
      socketRef.current.emit('move', { roomCode, move });
    }
  };

  return (
    <div className="game-screen">
      <h2>♟️ Online Chess - Room {roomCode}</h2>
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        boardOrientation={playerColor}
        arePiecesDraggable={game.turn() === playerColor[0]}
      />
    </div>
  );
};

export default GameScreen;
