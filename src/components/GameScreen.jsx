import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import Chess from "chess.js";
import io from "socket.io-client";
import "../styles/ChessGame.css"; // Import file CSS riêng

const socket = io(); // Kết nối socket

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [inputRoomId, setInputRoomId] = useState("");
  const [boardSize, setBoardSize] = useState(550); // Kích thước bàn cờ

  // Xác định kích thước bàn cờ theo thiết bị
  useEffect(() => {
    const updateBoardSize = () => {
      const width = window.innerWidth;
      setBoardSize(width < 768 ? 390 : 550);
    };

    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);
    return () => window.removeEventListener("resize", updateBoardSize);
  }, []);

  // Xử lý socket khi tham gia hoặc tạo phòng
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

  // Xử lý nước đi
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
    <div className="chess-container">
      {/* Modal tạo/tham gia phòng */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Chơi với người khác</h2>
            <button className="button create" onClick={handleCreateRoom}>
              Tạo phòng mới
            </button>
            <input
              type="text"
              placeholder="Nhập mã phòng để tham gia"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              className="input-room"
            />
            <button className="button join" onClick={handleJoinRoom}>
              Tham gia phòng
            </button>
          </div>
        </div>
      )}

      {/* Bàn cờ */}
      {roomId && (
        <>
          <h2 className="room-id">Phòng: {roomId}</h2>
          <div className="chessboard-wrapper">
            <Chessboard
              position={game.fen()}
              onPieceDrop={makeMove}
              boardWidth={boardSize}
            />
          </div>
        </>
      )}
    </div>
  );
}
