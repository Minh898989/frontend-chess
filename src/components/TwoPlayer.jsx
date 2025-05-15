import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './styles/TwoPlayer.css';

const API_BASE = 'https://backend-chess-fjr7.onrender.com';
const socket = io(API_BASE);

const RoomManager = () => {
  const [roomCode, setRoomCode] = useState('');
  const [roomInfo, setRoomInfo] = useState(null);
  const [message, setMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const userid = user?.userid || '';

  const handleCreateRoom = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/rooms/create`, {
        host_userid: userid,
      });
      setRoomInfo(res.data.room);
      setRoomCode(res.data.room.room_code);
      setMessage('✅ Phòng đã tạo, chờ người chơi tham gia...');
      socket.emit('joinRoom', res.data.room.room_code);
    } catch (err) {
      setMessage('❌ Lỗi khi tạo phòng.');
    }
  };

  const handleJoinRoom = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/rooms/join`, {
        room_code: parseInt(roomCode),
        guest_userid: userid,
      });
      setRoomInfo(res.data.room);
      setMessage('✅ Tham gia phòng thành công. Bắt đầu chơi!');
      socket.emit('joinRoom', roomCode);
    } catch (err) {
      setMessage('❌ Không thể tham gia phòng. Kiểm tra mã phòng hoặc trạng thái.');
    }
  };

  useEffect(() => {
    if (!roomCode) return;
    socket.emit('joinRoom', roomCode);

    socket.on('roomUpdated', (updatedRoom) => {
      if (updatedRoom.room_code.toString() === roomCode.toString()) {
        setRoomInfo(updatedRoom);
        setMessage('👤 Người chơi đã tham gia. Bắt đầu chơi!');
      }
    });

    return () => socket.off('roomUpdated');
  }, [roomCode]);

  return (
    <div className="room-manager">
      <h2>🧩 Quản lý Phòng Chơi</h2>
      <p className="userid">👤 User: <strong>{userid}</strong></p>

      <div className="controls">
        <button onClick={handleCreateRoom}>➕ Tạo phòng</button>

        <input
          type="text"
          placeholder="Nhập mã phòng..."
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button onClick={handleJoinRoom}>🔑 Tham gia phòng</button>
      </div>

      {message && <div className="message">📢 {message}</div>}

      {roomInfo && (
        <div className="room-info">
          <p><strong>ID phòng:</strong> {roomInfo.id}</p>
          <p><strong>Mã phòng:</strong> {roomInfo.room_code}</p>
          <p><strong>Host:</strong> {roomInfo.host_userid}</p>
          <p><strong>Guest:</strong> {roomInfo.guest_userid || '⏳ Đang chờ...'}</p>
          <p><strong>Trạng thái:</strong> {roomInfo.status}</p>
        </div>
      )}
    </div>
  );
};

export default RoomManager;
