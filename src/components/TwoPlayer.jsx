import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const API_BASE = 'https://backend-chess-fjr7.onrender.com';
const socket = io(API_BASE);

const ChessTest = () => {
  const [roomCode, setRoomCode] = useState('');
  const [myMove, setMyMove] = useState('');
  const [opponentMove, setOpponentMove] = useState('');
  const [userId] = useState(() => Math.floor(Math.random() * 10000));

  const handleCreateRoom = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/rooms/create`, {
        host_userid: userId,
      });
      setRoomCode(res.data.room.room_code);
      socket.emit('joinRoom', res.data.room.room_code);
    } catch (err) {
      console.error('❌ Create room failed:', err);
    }
  };

  const handleJoinRoom = async () => {
    try {
      await axios.post(`${API_BASE}/api/rooms/join`, {
        room_code: roomCode,
        guest_userid: userId,
      });
      socket.emit('joinRoom', roomCode);
    } catch (err) {
      console.error('❌ Join room failed:', err);
    }
  };

  const sendMove = () => {
    if (!roomCode || !myMove) return;
    socket.emit('move', { roomCode, move: myMove });
    setMyMove('');
  };

  useEffect(() => {
    socket.on('move', (move) => {
      setOpponentMove(move);
    });

    socket.on('opponentResigned', (user) => {
      alert(`Opponent ${user} resigned!`);
    });

    return () => {
      socket.off('move');
      socket.off('opponentResigned');
    };
  }, [roomCode]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">♟️ Chess Room</h1>
        <p className="text-sm text-center text-gray-500 mb-6">User ID: <span className="font-medium">{userId}</span></p>

        <div className="space-y-4">
          <button
            onClick={handleCreateRoom}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Room
          </button>

          <div className="flex gap-2">
            <input
              className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
            <button
              onClick={handleJoinRoom}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Join
            </button>
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your move"
              value={myMove}
              onChange={(e) => setMyMove(e.target.value)}
            />
            <button
              onClick={sendMove}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Send
            </button>
          </div>

          <div className="mt-4 text-center text-gray-700">
            <p className="font-medium">Opponent's last move:</p>
            <p className="text-lg text-red-500">{opponentMove || 'No move yet'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessTest;
