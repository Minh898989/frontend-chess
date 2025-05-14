import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const API_BASE = 'https://backend-chess-fjr7.onrender.com';
const socket = io(API_BASE);

const ChessTest = () => {
  const [roomCode, setRoomCode] = useState('');
  const [myMove, setMyMove] = useState('');
  const [opponentMove, setOpponentMove] = useState('');
  const [userId] = useState(() => Math.floor(Math.random() * 10000)); // Không cần setUserId

  const handleCreateRoom = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/rooms/create`, {
        host_userid: userId,
      });
      setRoomCode(res.data.room.room_code);
      socket.emit('joinRoom', res.data.room.room_code);
      console.log('🟢 Created and joined room:', res.data.room.room_code);
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
      console.log('🟢 Joined existing room:', roomCode);
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
      console.log('♟️ Opponent moved:', move);
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
    <div style={{ padding: 20 }}>
      <h1>♟️ Chess Room Test</h1>
      <p>My user ID: {userId}</p>

      <div>
        <button onClick={handleCreateRoom}>Create Room</button>
        <input
          placeholder="Enter Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Enter your move"
          value={myMove}
          onChange={(e) => setMyMove(e.target.value)}
        />
        <button onClick={sendMove}>Send Move</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <p>Opponent's last move: {opponentMove}</p>
      </div>
    </div>
  );
};

export default ChessTest;
