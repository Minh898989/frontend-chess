import Chess from "chess.js";
import { Chessboard } from "react-chessboard";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io(); // Không cần localhost nếu đã triển khai trên cùng host

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [inputRoomId, setInputRoomId] = useState("");

  useEffect(() => {
    if (!roomId) return;

    socket.emit(isCreator ? "createRoom" : "joinRoom", roomId);

    socket.on("startGame", ({ firstTurn }) => {
      setIsMyTurn(firstTurn === (isCreator ? "white" : "black"));
    });

    socket.on("opponentMove", (move) => {
      game.move(move);
      setGame(new Chess(game.fen()));
      setIsMyTurn(true);
    });

    return () => socket.disconnect();
  }, [game, isCreator, roomId]);

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
    const newRoomId = Math.random().toString(36).substring(2, 8);
    setRoomId(newRoomId);
    setIsCreator(true);
    setShowModal(false);
  };

  const handleJoinRoom = () => {
    if (inputRoomId.trim()) {
      setRoomId(inputRoomId.trim());
      setIsCreator(false);
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
              Tạo phòng mới
            </button>
            <input
              type="text"
              placeholder="Nhập mã phòng để tham gia"
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

      {roomId && (
        <>
          <h2 className="text-center text-xl font-semibold mb-4">Phòng: {roomId}</h2>
          <Chessboard position={game.fen()} onPieceDrop={makeMove} />
        </>
      )}
    </div>
  );
}
