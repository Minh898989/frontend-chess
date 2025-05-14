import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import Chess from "chess.js";
import axios from "axios";
import "../styles/GameScreen.css";

function GameScreen() {
  const { mode } = useParams();
  const gameRef = useRef(new Chess());
  const [, setGame] = useState(gameRef.current);
  const [capturedPieces, setCapturedPieces] = useState({ w: [], b: [] });
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const boardContainerRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(window.innerWidth < 768 ? 410 : 600);

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

  const pieceValue = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 1000 };

  const evaluateBoard = (g) => {
    const board = g.board();
    let score = 0;
    board.forEach(row => {
      row.forEach(piece => {
        if (piece) {
          const value = pieceValue[piece.type] || 0;
          score += piece.color === "w" ? value : -value;
        }
      });
    });
    return score;
  };

  const minimax = (g, depth, isMaximizing, alpha, beta) => {
    if (depth === 0 || g.game_over()) return evaluateBoard(g);

    const moves = g.moves({ verbose: true });
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        g.move(move);
        const evalScore = minimax(g, depth - 1, false, alpha, beta);
        g.undo();
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        g.move(move);
        const evalScore = minimax(g, depth - 1, true, alpha, beta);
        g.undo();
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  const evaluateMove = (g, move) => {
    let score = 0;
    if (move.captured) score += pieceValue[move.captured] || 0;
    g.move(move);
    if (g.in_check()) score += 0.5;
    g.undo();
    return score;
  };

  const makeAIMove = (g) => {
    if (g.game_over()) return;

    const moves = g.moves({ verbose: true });
    if (moves.length === 0) return;

    let bestMove;

    if (mode === "easy") {
      bestMove = moves[Math.floor(Math.random() * moves.length)];
    } else if (mode === "medium") {
      let bestScore = -Infinity;
      for (const move of moves) {
        const score = evaluateMove(g, move);
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    } else if (mode === "hard") {
      let bestScore = -Infinity;
      for (const move of moves) {
        g.move(move);
        const score = minimax(g, 2, false, -Infinity, Infinity);
        g.undo();
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }

    if (bestMove) {
      const result = g.move(bestMove);
      if (result?.captured) {
        const opponent = result.color === "w" ? "b" : "w";
        setCapturedPieces(prev => ({
          ...prev,
          [opponent]: [...prev[opponent], result.captured],
        }));
      }

      setGame({ ...g });

      if (g.game_over()) handleGameOver(g);
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    if (isGameOver) return false;

    const move = gameRef.current.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (!move) return false;

    if (move.captured) {
      const opponent = move.color === "w" ? "b" : "w";
      setCapturedPieces(prev => ({
        ...prev,
        [opponent]: [...prev[opponent], move.captured],
      }));
    }

    setGame({ ...gameRef.current });

    if (gameRef.current.game_over()) {
      handleGameOver(gameRef.current);
    } else if (isAI && gameRef.current.turn() === "b") {
      setTimeout(() => makeAIMove(gameRef.current), 300);
    }

    return true;
  };

  const handleGameOver = (finalGame) => {
    setIsGameOver(true);
    let msg = "Hòa";
    let didPlayerWin = false;

    if (finalGame.in_checkmate()) {
      const turn = finalGame.turn();
      if (turn === "w") {
        msg = isAI ? "Máy thắng" : "Đen thắng";
      } else {
        msg = isAI ? "Bạn thắng" : "Trắng thắng";
        didPlayerWin = isAI;
      }
    }

    updateLocalStats(didPlayerWin, getMinutesPlayed(), getTotalCaptured());
    setWinner(msg);
  };

  const handleResign = (color) => {
    setIsGameOver(true);
    const isWhite = color === "w";
    const msg = isWhite ? (isAI ? "Máy thắng" : "Đen thắng") : (isAI ? "Bạn thắng" : "Trắng thắng");
    const didPlayerWin = !isWhite && isAI;

    updateLocalStats(didPlayerWin, getMinutesPlayed(), getTotalCaptured());
    setWinner(msg);
  };

  useEffect(() => {
    if (isAI && gameRef.current.turn() === "b" && !isGameOver) {
      setTimeout(() => makeAIMove(gameRef.current), 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAI, isGameOver]);

  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
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

  useEffect(() => {
    const updateWidth = () => {
      if (boardContainerRef.current) {
        const size = boardContainerRef.current.offsetWidth;
        const newWidth = window.innerWidth < 768 ? Math.min(size, 410) : Math.min(size, 600);
        setBoardWidth(newWidth);
      }
    };

    const debounced = () => {
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(updateWidth, 200);
    };

    updateWidth();
    window.addEventListener("resize", debounced);
    return () => window.removeEventListener("resize", debounced);
  }, []);

  const getTimerClass = () => {
    if (timeLeft <= 30) return "timer critical";
    if (timeLeft <= 60) return "timer warning";
    return "timer";
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

  const renderCapturedPieces = (color) => {
    const icons = { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕" };
    return capturedPieces[color].map((type, idx) => (
      <span key={idx} className="captured-piece">
        {color === "w" ? icons[type] : icons[type].toLowerCase()}
      </span>
    ));
  };

  return (
    <div className="game-screen">
      <h1>{getModeName()}</h1>

      <div className="captured-pieces">
        <div>{renderCapturedPieces("w")}</div>
        <div>{renderCapturedPieces("b")}</div>
      </div>

      <div className="board-wrapper" ref={boardContainerRef}>
        <Chessboard
          position={gameRef.current.fen()}
          onPieceDrop={onDrop}
          boardWidth={boardWidth}
          arePiecesDraggable={!gameRef.current.game_over()}
          animationDuration={150}
        />
      </div>

      <div className={getTimerClass()}>
        <p>⏳ Thời gian còn lại: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</p>
      </div>

      {!isGameOver && (
        <div className="resign-button">
          <button onClick={() => handleResign(gameRef.current.turn())}>Đầu hàng</button>
        </div>
      )}

      {winner && <p>🏆 {winner}</p>}
    </div>
  );
}

export default GameScreen;
