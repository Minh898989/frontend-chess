import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import Chess from "chess.js";
import axios from "axios";
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

  const getTotalCaptured = useCallback(() => capturedPieces.w.length + capturedPieces.b.length, [capturedPieces]);
  const getMinutesPlayed = useCallback(() => Math.floor((15 * 60 - timeLeft) / 60), [timeLeft]);

  const updateLocalStats = useCallback(async (didPlayerWin, minutesPlayed = 0, capturedCount = 0) => {
    if (!userId) return;
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

  const evaluateMove = (gameInstance, move) => {
    const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    let score = 0;
    if (move.captured) {
      score += pieceValues[move.captured.toLowerCase()] || 0;
    }

    gameInstance.move(move);
    if (gameInstance.in_check()) score += 0.5;

    const opponentMoves = gameInstance.moves({ verbose: true });
    const ourColor = move.color === "w" ? "b" : "w";

    for (const opMove of opponentMoves) {
      if (opMove.captured && opMove.to === move.to && opMove.color === ourColor) {
        score -= pieceValues[move.piece.toLowerCase()] || 0.5;
      }
    }

    gameInstance.undo();
    return score;
  };

  const makeAIMove = (currentGame) => {
    if (currentGame.game_over()) return;

    const possibleMoves = currentGame.moves({ verbose: true });
    if (possibleMoves.length === 0) return;

    let selectedMove;
    const scoredMoves = [];

    for (const move of possibleMoves) {
      const score = evaluateMove(currentGame, move);
      scoredMoves.push({ move, score });
    }

    if (mode === "easy") {
      const safeMoves = scoredMoves.filter(m => m.score >= 0);
      selectedMove = (safeMoves.length ? safeMoves : scoredMoves)[Math.floor(Math.random() * (safeMoves.length || scoredMoves.length))].move;
    } else if (mode === "medium") {
      scoredMoves.sort((a, b) => b.score - a.score);
      selectedMove = scoredMoves[0].move;
    } else {
      scoredMoves.sort((a, b) => b.score - a.score);
      selectedMove = scoredMoves[0].move;
    }

    const result = currentGame.move(selectedMove);

    if (result?.captured) {
      const opponent = result.color === "w" ? "b" : "w";
      setCapturedPieces((prev) => ({
        ...prev,
        [opponent]: [...prev[opponent], result.captured],
      }));
    }

    const newGame = new Chess(currentGame.fen());
    setGame(newGame);

    if (newGame.game_over()) handleGameOver(newGame);
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
    if (isAI && game.turn() === "b" && !isGameOver) {
      setTimeout(() => makeAIMove(game), 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAI, game, isGameOver]);

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
  }, [isGameOver, getMinutesPlayed, getTotalCaptured, updateLocalStats]);

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
