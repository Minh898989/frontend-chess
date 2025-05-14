// ChessApp.jsx
import { useState } from "react";
import ChessGame from "./ChessGame";

export default function ChessApp() {
  const [roomId, setRoomId] = useState("");
  const [isCreator, setIsCreator] = useState(null);
  const [showGame, setShowGame] = useState(false);
  const [inputRoomId, setInputRoomId] = useState("");

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8); // mã ngẫu nhiên
    setRoomId(newRoomId);
    setIsCreator(true);
    setShowGame(true);
  };

  const handleJoinRoom = () => {
    if (inputRoomId.trim()) {
      setRoomId(inputRoomId.trim());
      setIsCreator(false);
      setShowGame(true);
    }
  };

  if (showGame) {
    return <ChessGame roomId={roomId} isCreator={isCreator} />;
  }

  return (
    <div className="modal">
      <h2>Chơi 2 người</h2>
      <button onClick={handleCreateRoom}>Tạo phòng</button>
      <div style={{ marginTop: "20px" }}>
        <input
          placeholder="Nhập mã phòng..."
          value={inputRoomId}
          onChange={(e) => setInputRoomId(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Tham gia phòng</button>
      </div>
    </div>
  );
}
