import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import Chess from "chess.js";
import io from "socket.io-client";
import "../styles/TwoPlayer.css";

const socket = io();

export default function TwoPlayer() {
  const [game, setGame] = useState(new Chess());
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [inputRoomId, setInputRoomId] = useState("");
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    socket.emit(isCreator ? "createRoom" : "joinRoom", roomId);

    socket.on("startGame", ({ firstTurn }) => {
      const myColor = isCreator ? "white" : "black";
      setIsMyTurn(firstTurn === myColor);
      setGameStarted(true);
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
  };

  const handleJoinRoom = () => {
    if (inputRoomId.trim()) {
      setRoomId(inputRoomId.trim());
      setIsCreator(false);
    }
  };

  if (!roomId) {
    return (
      <div className="chess-game-container">
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
    );
  }

  return (
    <div className="chess-game-container">
      <h2 className="chess-room-id">Phòng: {roomId}</h2>
      {gameStarted ? (
        <div className="chess-board-wrapper">
          <Chessboard position={game.fen()} onPieceDrop={makeMove} />
        </div>
      ) : (
        <p>Đang chờ người chơi khác tham gia...</p>
      )}
    </div>
  );
}
