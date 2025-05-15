import React from 'react';
import { useParams } from 'react-router-dom';


const Chess = () => {
  const { room_code } = useParams();

  return (
    <div className="game-screen">
      <h2>🎮 Chess Game Room</h2>
      <p>Room Code: <strong>{room_code}</strong></p>

      {/* Bạn có thể nhúng bàn cờ, socket lắng nghe nước đi ở đây */}
      <div className="game-board-placeholder">
        🧩 Chess board coming soon...
      </div>
    </div>
  );
};

export default Chess;
