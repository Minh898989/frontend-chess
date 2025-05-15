import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/Room.css";

const API_BASE = 'https://backend-chess-fjr7.onrender.com';

const RoomManager = () => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userid = storedUser?.userid || '';
  const [roomCode, setRoomCode] = useState('');
  const [room, setRoom] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Dùng useRef để socket chỉ khởi tạo 1 lần
  const socketRef = useRef(null);

  useEffect(() => {
    // Khởi tạo socket chỉ một lần
    socketRef.current = io(API_BASE, { transports: ['websocket'] });

    // Lắng nghe sự kiện từ server
    socketRef.current.on('roomUpdated', (updatedRoom) => {
      console.log('🔄 Room updated via socket:', updatedRoom);
      setRoom(updatedRoom);
    });

    socketRef.current.on('startGame', (roomData) => {
      console.log('🎮 Game started! Navigating to game page...');
      navigate(`/chess/${roomData.room_code}`);
    });

    // Cleanup
    return () => {
      socketRef.current.disconnect();
    };
  }, [navigate]);

  const joinRoomSocket = (code) => {
    console.log(`🔌 Joining socket room: ${code}`);
    socketRef.current.emit('joinRoom', String(code));
  };

  const createRoom = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/rooms/create`, {
        host_userid: userid,
      });

      const createdRoom = res.data.room;
      setRoom(createdRoom);
      setRoomCode(createdRoom.room_code);
      setMessage(`✅ Room created. Share code: ${createdRoom.room_code}`);

      // Đảm bảo join sau khi state được cập nhật
      setTimeout(() => joinRoomSocket(createdRoom.room_code), 0);
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

      // Đảm bảo join sau khi state được cập nhật
      setTimeout(() => joinRoomSocket(roomCode), 0);
    } catch (err) {
      console.error(err);
      const errMsg = err?.response?.data?.error || '❌ Failed to join room';
      setMessage(errMsg);
    }
  };

  return (
    <div className="room-manager">
      <h2>♟️ Room Manager</h2>

      <div className="userid">
        Your ID: <strong>{userid}</strong>
      </div>

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
