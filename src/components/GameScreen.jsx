import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import Chess from "chess.js";
import axios from "axios";
import Stockfish from "stockfish";
import "../styles/GameScreen.css";

function GameScreen() {
  const { mode } = useParams();
  const [game, setGame] = useState(new Chess());
  const [capturedPieces, setCapturedPieces] = useState({ w: [], b: [] });
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const isAI = mode !== "2players";
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userid;

  const stockfish = useRef(null);

  const getTotalCaptured = useCallback(() => {
    return capturedPieces.w.length + capturedPieces.b.length;
  }, [capturedPieces]);

  const getMinutesPlayed = useCallback(() => {
    const totalSeconds = 15 * 60 - timeLeft;
    return Math.floor(totalSeconds / 60);
  }, [timeLeft]);

  const updateLocalStats = useCallback(async (didPlayerWin, minutesPlayed = 0, capturedCount = 0) => {
    if (!userId) {
      console.warn("Không tìm thấy userId, không gửi thống kê.");
      return;
    }

    try {
      await axios.post("https://backend-chess-fjr7.onrender.com/api/stats/update", {
        userid: userId,
        didWin: didPlayerWin,
        minutesPlayed,
        capturedCount,
      });
    } catch (error) {
      console.error("Lỗi cập nhật thống kê:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (isAI) {
      stockfish.current = Stockfish();
      stockfish.current.onmessage = (event) => {
        const line = typeof event === "object" ? event.data : event;
        if (line.startsWith("bestmove")) {
          const move = line.split(" ")[1];
          if (move) {
            const result = game.move({
              from: move.substring(0, 2),
              to: move.substring(2, 4),
              promotion: "q"
            });

            if (result?.captured) {
              const opponent = result.color === "w" ? "b" : "w";
              setCapturedPieces((prev) => ({
                ...prev,
                [opponent]: [...prev[opponent], result.captured],
              }));
            }

            const newGame = new Chess(game.fen());
            setGame(newGame);

            if (newGame.game_over()) {
              handleGameOver(newGame);
            }
          }
        }
      };
    }

    return () => {
      if (stockfish.current) stockfish.current.terminate();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAI, game]);

  const makeAIMove = (currentGame) => {
    if (!stockfish.current || currentGame.game_over()) return;

    const fen = currentGame.fen();
    stockfish.current.postMessage("ucinewgame");
    stockfish.current.postMessage(`position fen ${fen}`);

    const depth = mode === "easy" ? 5 : mode === "medium" ? 10 : 15;
    stockfish.current.postMessage(`go depth ${depth}`);
  };

  const onDrop = (sourceSquare, targetSquare) => {
    if (isGameOver) return false;

    const move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (!move) return false;

    if (move.captured) {
      const opponent = move.color === "w" ? "b" : "w";
      setCapturedPieces((prev) => ({
        ...prev,
        [opponent]: [...prev[opponent], move.captured],
      }));
    }

    const newGame = new Chess(game.fen());
    setGame(newGame);

    if (newGame.game_over()) {
      handleGameOver(newGame);
    } else if (isAI && newGame.turn() === "b") {
      setTimeout(() => makeAIMove(newGame), 300);
    }

    return true;
  };

  const handleGameOver = (finalGame) => {
    setIsGameOver(true);
    let winMsg = "Hòa";
    let didPlayerWin = false;

    if (finalGame.in_checkmate()) {
      const turn = finalGame.turn();
      if (turn === "w") {
        winMsg = isAI ? "Máy thắng" : "Đen thắng";
      } else {
        winMsg = isAI ? "Bạn thắng" : "Trắng thắng";
        didPlayerWin = isAI;
      }
    }

    updateLocalStats(didPlayerWin, getMinutesPlayed(), getTotalCaptured());
    setWinner(winMsg);
  };

  const handleResign = (color) => {
    setIsGameOver(true);
    const isWhite = color === "w";
    const winMsg = isWhite ? (isAI ? "Máy thắng" : "Đen thắng") : (isAI ? "Bạn thắng" : "Trắng thắng");
    const didPlayerWin = !isWhite && isAI;

    updateLocalStats(didPlayerWin, getMinutesPlayed(), getTotalCaptured());
    setWinner(winMsg);
  };

  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          setWinner("⏱ Hết giờ - Hòa");
          updateLocalStats(false, getMinutesPlayed(), getTotalCaptured());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, getMinutesPlayed, getTotalCaptured, updateLocalStats,]);

  const renderCapturedPieces = (color) => {
    const icons = { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕" };
    return capturedPieces[color].map((type, idx) => (
      <span key={idx} className="captured-piece">
        {color === "w" ? icons[type] : icons[type].toLowerCase()}
      </span>
    ));
  };

  const getModeName = () => {
    switch (mode) {
      case "2players": return "👥 Chế độ 2 người";
      case "easy": return "🟢 Máy dễ";
      case "medium": return "🟡 Máy trung bình";
      case "hard": return "🔴 Máy khó";
      default: return "🎮 Cờ vua";
    }
  };

  return (
    <div className="game-screen">
      <h1>{getModeName()}</h1>

      <div className="captured-pieces">
        <div>{renderCapturedPieces("w")}</div>
        <div>{renderCapturedPieces("b")}</div>
      </div>

      <div className="board-wrapper">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={600}
          arePiecesDraggable={!game.game_over()}
        />
      </div>

      <div className="timer">
        <p>⏳ Thời gian còn lại: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</p>
      </div>

      {!isGameOver && (
        <div className="resign-button">
          <button onClick={() => handleResign(game.turn())}>Đầu hàng</button>
        </div>
      )}

      {winner && <p>🏆 {winner}</p>}
    </div>
  );
}

export default GameScreen;
