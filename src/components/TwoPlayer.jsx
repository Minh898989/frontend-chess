import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import "../styles/TwoPlayer.css";

// Cấu hình địa chỉ backend và khởi tạo socket
const API_BASE = 'https://backend-chess-fjr7.onrender.com';
const socket = io(API_BASE);

function RoomManager() {
  const [hostUserId, setHostUserId] = useState('');
  const [guestUserId, setGuestUserId] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomInfo, setRoomInfo] = useState(null);
  const [message, setMessage] = useState('');

  // Lấy userid từ localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData?.userid) {
      setHostUserId(userData.userid);
      setGuestUserId(userData.userid);
    }
  }, []);

  // Lắng nghe sự kiện socket khi có người tham gia phòng
  useEffect(() => {
    socket.on('room-joined', (data) => {
      setMessage(`🔔 ${data.guest_userid} đã tham gia phòng ${data.room_code}`);
      setRoomInfo(data.room);
    });

    return () => {
      socket.off('room-joined');
    };
  }, []);

  // Gọi API tạo phòng
  const createRoom = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/rooms/create`, {
        host_userid: hostUserId,
      });

      const room = res.data.room;
      setRoomInfo(room);
      setRoomCode(room.room_code);
      setMessage(`✅ Phòng được tạo với mã: ${room.room_code}`);
    } catch (err) {
      console.error(err);
      setMessage('❌ Lỗi tạo phòng');
    }
  };

  // Gọi API tham gia phòng và phát sự kiện socket
  const joinRoom = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/rooms/join`, {
        room_code: parseInt(roomCode),
        guest_userid: guestUserId,
      });

      const room = res.data.room;
      setRoomInfo(room);
      setMessage(`✅ Đã tham gia phòng ${room.room_code}`);

      // Phát socket để thông báo cho người khác
      socket.emit('join-room', {
        room_code: room.room_code,
        guest_userid: guestUserId,
        room: room,
      });
    } catch (err) {
      console.error(err);
      setMessage('❌ Lỗi tham gia phòng');
    }
  };

 return (
  <div className="room-container">
    <h2>♟️ Quản lý Phòng Cờ</h2>

    <div className="section">
      <h3>🔹 Tạo phòng mới</h3>
      <input
        type="text"
        placeholder="Host User ID"
        value={hostUserId}
        disabled
      />
      <button onClick={createRoom} style={{ marginLeft: 10 }}>Tạo phòng</button>
    </div>

    <div className="section">
      <h3>🔸 Tham gia phòng</h3>
      <input
        type="text"
        placeholder="Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <input
        type="text"
        placeholder="Guest User ID"
        value={guestUserId}
        disabled
        style={{ marginLeft: 10 }}
      />
      <button onClick={joinRoom} style={{ marginLeft: 10 }}>Tham gia</button>
    </div>

    {message && (
      <div className="message">{message}</div>
    )}

    {roomInfo && (
      <div>
        <h3>📄 Thông tin phòng</h3>
        <div className="room-info">
          {JSON.stringify(roomInfo, null, 2)}
        </div>
      </div>
    )}
  </div>
);

}

export default RoomManager;
