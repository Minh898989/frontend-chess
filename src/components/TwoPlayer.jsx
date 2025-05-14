import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/rooms'; // Thay đổi nếu dùng server khác

const RoomTest = () => {
  const [hostUserId, setHostUserId] = useState('');
  const [guestUserId, setGuestUserId] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [createdRoom, setCreatedRoom] = useState(null);
  const [joinResult, setJoinResult] = useState(null);

  const createRoom = async () => {
    try {
      const res = await axios.post(`${API_BASE}/create`, { host_userid: hostUserId });
      setCreatedRoom(res.data.room);
      setRoomCode(res.data.room.room_code); // set code to use for join
    } catch (err) {
      console.error('Create Room Error:', err.response?.data || err.message);
    }
  };

  const joinRoom = async () => {
    try {
      const res = await axios.post(`${API_BASE}/join`, {
        room_code: roomCode,
        guest_userid: guestUserId,
      });
      setJoinResult(res.data.room);
    } catch (err) {
      console.error('Join Room Error:', err.response?.data || err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🎮 Room Test</h2>

      <div style={{ marginBottom: 20 }}>
        <h3>Create Room</h3>
        <input
          type="text"
          placeholder="Host User ID"
          value={hostUserId}
          onChange={(e) => setHostUserId(e.target.value)}
        />
        <button onClick={createRoom}>Create</button>
        {createdRoom && (
          <div>
            <p>✅ Room Created: {createdRoom.room_code}</p>
            <pre>{JSON.stringify(createdRoom, null, 2)}</pre>
          </div>
        )}
      </div>

      <div>
        <h3>Join Room</h3>
        <input
          type="text"
          placeholder="Guest User ID"
          value={guestUserId}
          onChange={(e) => setGuestUserId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button onClick={joinRoom}>Join</button>
        {joinResult && (
          <div>
            <p>✅ Joined Room:</p>
            <pre>{JSON.stringify(joinResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomTest;
