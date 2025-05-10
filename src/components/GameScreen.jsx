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
        win: didPlayerWin,
        minutes: minutesPlayed,
        captured: capturedCount,
      });
    } catch (error) {
      console.error("Lỗi cập nhật thống kê:", error);
    }
  }, [userId]);

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

  const makeAIMove = (currentGame) => {
    if (currentGame.game_over()) return;

    const possibleMoves = currentGame.moves();
    if (!possibleMoves.length) return;

    let move;
    if (mode === "easy") {
      move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    } else if (mode === "medium") {
      move = getBestMove(currentGame, 2);
    } else if (mode === "hard") {
      move = getBestMove(currentGame, 3);
    }

    if (move) {
      const result = currentGame.move(move);
      if (result?.captured) {
        const opponent = result.color === "w" ? "b" : "w";
        setCapturedPieces((prev) => ({
          ...prev,
          [opponent]: [...prev[opponent], result.captured],
        }));
      }

      const newGame = new Chess(currentGame.fen());
      setGame(newGame);

      if (newGame.game_over()) {
        handleGameOver(newGame);
      }
    }
  };

  const getBestMove = (game, depth) => {
    let bestMove = null;
    let bestValue = -Infinity;
    for (const move of game.moves()) {
      game.move(move);
      const value = minimax(game, depth - 1, -Infinity, Infinity, false);
      game.undo();
      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }
    return bestMove;
  };

  const minimax = (game, depth, alpha, beta, isMaximizing) => {
    if (depth === 0 || game.game_over()) return evaluateBoard(game.board());

    const moves = game.moves();
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        game.move(move);
        const evalScore = minimax(game, depth - 1, alpha, beta, false);
        game.undo();
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        game.move(move);
        const evalScore = minimax(game, depth - 1, alpha, beta, true);
        game.undo();
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  const evaluateBoard = (board) => {
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 1000 };
    let score = 0;
    for (const row of board) {
      for (const piece of row) {
        if (piece) {
          const value = values[piece.type];
          score += piece.color === "w" ? value : -value;
        }
      }
    }
    return score;
  };

  const handleGameOver = (finalGame) => {
    setIsGameOver(true);
    let winMsg = "Hòa";
    let didPlayerWin = false;

    if (finalGame.in_checkmate()) {
      const turn = finalGame.turn(); // người sắp đi tiếp
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

      {/* Debug (bỏ nếu không cần) */}
      <div className="debug-info" style={{ marginTop: 20 }}>
        <p><strong>🆔 User ID:</strong> {userId}</p>
        <p><strong>⏱ Phút đã chơi:</strong> {getMinutesPlayed()} phút</p>
        <p><strong>♟️ Quân đã ăn:</strong> {getTotalCaptured()} quân</p>
      </div>
    </div>
  );
}

export default GameScreen;
