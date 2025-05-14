import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export default function ChessGame({ roomId, isCreator, onRoomSelected }) {
  const [game, setGame] = useState(new Chess());
  const [isMyTurn, setIsMyTurn] = useState(isCreator);
  const [showModal, setShowModal] = useState(true);
  const [inputRoomId, setInputRoomId] = useState("");

  useEffect(() => {
    if (roomId) {
      socket.emit(isCreator ? "createRoom" : "joinRoom", roomId);
    }

    socket.on("startGame", () => {
      console.log("Game started");
    });

    socket.on("opponentMove", (move) => {
      game.move(move);
      setGame(new Chess(game.fen()));
      setIsMyTurn(true);
    });

    return () => socket.disconnect();
  }, [roomId]);

  const makeMove = (from, to) => {
    if (!isMyTurn) return false;
    const move = game.move({ from, to, promotion: "q" });
    if (move) {
      setGame(new Chess(game.fen()));
      socket.emit("move", { roomId, move });
      setIsMyTurn(false);
      return true;
    }
    return false;
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substr(2, 6);
    onRoomSelected(newRoomId, true);
    setShowModal(false);
  };

  const handleJoinRoom = () => {
    if (inputRoomId.trim()) {
      onRoomSelected(inputRoomId.trim(), false);
      setShowModal(false);
    }
  };

  return (
    <div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <h2 className="text-lg font-bold mb-4">Chơi với người khác</h2>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded w-full mb-3"
              onClick={handleCreateRoom}
            >
              Tạo phòng
            </button>
            <input
              type="text"
              placeholder="Nhập mã phòng..."
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              className="border px-3 py-2 w-full mb-3"
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
              onClick={handleJoinRoom}
            >
              Tham gia phòng
            </button>
          </div>
        </div>
      )}
      <h2 className="text-center text-xl font-semibold mb-4">Phòng: {roomId}</h2>
      <Chessboard position={game.fen()} onPieceDrop={makeMove} />
    </div>
  );
}
