import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import "../styles/TwoPlayer.css"; // Nếu không cần, có thể xoá


const API_BASE = 'https://backend-chess-fjr7.onrender.com';
const socket = io(API_BASE, { transports: ['websocket'] }); // giúp tránh polling lỗi

const RoomManager = () => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userid = storedUser?.userid || '';

  const [roomCode, setRoomCode] = useState('');
  const [room, setRoom] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Lắng nghe khi trạng thái phòng được cập nhật từ server (qua socket)
    socket.on('roomUpdated', (updatedRoom) => {
      setRoom(updatedRoom);
      setMessage(`🔁 Room updated: ${updatedRoom.status}`);
    });

    return () => {
      socket.off('roomUpdated');
    };
  }, []);

  const createRoom = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/rooms/create`, {
        host_userid: userid,
      });

      const createdRoom = res.data.room;
      setRoom(createdRoom);
      setRoomCode(createdRoom.room_code);
      setMessage(`✅ Room created. Share code: ${createdRoom.room_code}`);
      socket.emit('joinRoom', String(createdRoom.room_code)); // Host tự join vào room socket
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to create room');
    }
  };

  const joinRoom = async () => {
    if (!roomCode || isNaN(roomCode)) {
      setMessage('⚠️ Invalid room code');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/rooms/join`, {
        room_code: parseInt(roomCode),
        guest_userid: userid,
      });

      const joinedRoom = res.data.room;
      setRoom(joinedRoom);
      setMessage(`✅ Joined room ${roomCode}`);
      socket.emit('joinRoom', String(roomCode));
    } catch (err) {
      console.error(err);
      const errMsg = err?.response?.data?.error || '❌ Failed to join room';
      setMessage(errMsg);
    }
  };

  return (
    <div className="room-manager">
      <h2>♟️ Room Manager</h2>

      <div className="userid">Your ID: <strong>{userid}</strong></div>

      <div className="controls">
        <button onClick={createRoom}>🆕 Create Room</button>

        <input
          type="text"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button onClick={joinRoom}>🔗 Join Room</button>
      </div>

      {message && <div className="message">{message}</div>}

      {room && (
        <div className="room-info">
          <h3>📋 Room Info</h3>
          <p><strong>Room ID:</strong> {room.id}</p>
          <p><strong>Room Code:</strong> {room.room_code}</p>
          <p><strong>Host:</strong> {room.host_userid}</p>
          <p><strong>Guest:</strong> {room.guest_userid || '🕓 Waiting...'}</p>
          <p><strong>Status:</strong> {room.status}</p>
        </div>
      )}
    </div>
  );
};

export default RoomManager;
