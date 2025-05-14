import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import Chess from "chess.js";
import io from "socket.io-client";
import "../styles/ChessGame.css";

const socket = io();

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
      const myColor = isCreator ? "white" : "black";
      setIsMyTurn(firstTurn === myColor);
    });

    socket.on("opponentMove", (move) => {
      const updatedGame = new Chess(game.fen());
      updatedGame.move(move);
      setGame(updatedGame);
      setIsMyTurn(true);
    });

    return () => {
      socket.off("startGame");
      socket.off("opponentMove");
    };
  }, [roomId, isCreator, game]);

  const makeMove = (from, to) => {
    if (!isMyTurn) return false;

    const updatedGame = new Chess(game.fen());
    const move = updatedGame.move({ from, to, promotion: "q" });

    if (move) {
      setGame(updatedGame);
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
    <div className="chess-game-container">
      {showModal && (
        <div className="chess-modal-overlay">
          <div className="chess-modal-content">
            <h2>Chơi với người khác</h2>
            <button className="chess-btn chess-btn-create" onClick={handleCreateRoom}>
              Tạo phòng mới
            </button>
            <input
              type="text"
              placeholder="Nhập mã phòng để tham gia"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              className="chess-input-room"
            />
            <button className="chess-btn chess-btn-join" onClick={handleJoinRoom}>
              Tham gia phòng
            </button>
          </div>
        </div>
      )}

      {!showModal && roomId && (
        <>
          <h2 className="chess-room-id">Phòng: {roomId}</h2>
          <div className="chess-board-wrapper">
            <Chessboard position={game.fen()} onPieceDrop={makeMove} />
          </div>
        </>
      )}
    </div>
  );
}
