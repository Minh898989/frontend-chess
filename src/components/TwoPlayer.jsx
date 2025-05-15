import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000'); // đổi nếu deploy backend

function App() {
  const [hostUserId, setHostUserId] = useState('');
  const [guestUserId, setGuestUserId] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [log, setLog] = useState([]);

  useEffect(() => {
    socket.on('roomUpdated', (updatedRoom) => {
      setLog((prev) => [...prev, `📢 Room updated: ${JSON.stringify(updatedRoom)}`]);
      setRoomData(updatedRoom);
    });

    return () => {
      socket.off('roomUpdated');
    };
  }, []);

  const createRoom = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/rooms/create', {
        host_userid: hostUserId,
      });
      const room = res.data.room;
      setRoomCode(room.room_code);
      setRoomData(room);
      socket.emit('joinRoom', room.room_code);
      setLog((prev) => [...prev, `✅ Room created: ${room.room_code}`]);
    } catch (err) {
      console.error(err);
      setLog((prev) => [...prev, `❌ Create error: ${err.message}`]);
    }
  };

  const joinRoom = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/rooms/join', {
        guest_userid: guestUserId,
        room_code: roomCode,
      });
      const room = res.data.room;
      setRoomData(room);
      socket.emit('joinRoom', roomCode);
      setLog((prev) => [...prev, `👤 Joined room: ${roomCode}`]);
    } catch (err) {
      console.error(err);
      setLog((prev) => [...prev, `❌ Join error: ${err.response?.data?.error || err.message}`]);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>🎮 Test Tạo/Tham Gia Phòng</h1>

      <div>
        <h3>Tạo phòng</h3>
        <input
          placeholder="Host User ID"
          value={hostUserId}
          onChange={(e) => setHostUserId(e.target.value)}
        />
        <button onClick={createRoom}>Tạo phòng</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Tham gia phòng</h3>
        <input
          placeholder="Guest User ID"
          value={guestUserId}
          onChange={(e) => setGuestUserId(e.target.value)}
        />
        <input
          placeholder="Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button onClick={joinRoom}>Tham gia</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Thông tin phòng:</h3>
        <pre>{JSON.stringify(roomData, null, 2)}</pre>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Log:</h3>
        <ul>
          {log.map((entry, idx) => (
            <li key={idx}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
