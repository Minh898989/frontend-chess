import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import Chess from "chess.js";
import axios from "axios";
import "../styles/GameScreen.css";

function GameScreen() {
  const { mode } = useParams();
  const isAI = mode !== "2players";
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userid;

  const [game, setGame] = useState(new Chess());
  const [capturedPieces, setCapturedPieces] = useState({ w: [], b: [] });
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [boardWidth, setBoardWidth] = useState(() =>
    window.innerWidth < 768 ? 410 : 600
  );

  const boardContainerRef = useRef(null);

  const pieceValue = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 1000 };

  const getTotalCaptured = useCallback(
    () => capturedPieces.w.length + capturedPieces.b.length,
    [capturedPieces]
  );

  const getMinutesPlayed = useCallback(
    () => Math.floor((15 * 60 - timeLeft) / 60),
    [timeLeft]
  );

  const updateLocalStats = useCallback(
    async (didPlayerWin, minutesPlayed = 0, capturedCount = 0) => {
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
    },
    [userId]
  );

  const evaluateBoard = (gameInstance) => {
    return gameInstance.board().reduce((score, row) => {
      return score + row.reduce((acc, piece) => {
        if (!piece) return acc;
        const value = pieceValue[piece.type] || 0;
        return acc + (piece.color === "w" ? value : -value);
      }, 0);
    }, 0);
  };

  const minimax = (gameInstance, depth, isMaximizing, alpha, beta) => {
    if (depth === 0 || gameInstance.game_over()) return evaluateBoard(gameInstance);

    const moves = gameInstance.moves({ verbose: true });
    let bestEval = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
      gameInstance.move(move);
      const evalScore = minimax(gameInstance, depth - 1, !isMaximizing, alpha, beta);
      gameInstance.undo();

      if (isMaximizing) {
        bestEval = Math.max(bestEval, evalScore);
        alpha = Math.max(alpha, evalScore);
      } else {
        bestEval = Math.min(bestEval, evalScore);
        beta = Math.min(beta, evalScore);
      }

      if (beta <= alpha) break;
    }

    return bestEval;
  };

  const evaluateMove = (gameInstance, move) => {
    let score = 0;
    if (move.captured) score += pieceValue[move.captured] || 0;
    gameInstance.move(move);
    if (gameInstance.in_check()) score += 0.5;
    gameInstance.undo();
    return score;
  };

  const makeAIMove = (currentGame) => {
    if (currentGame.game_over()) return;

    const moves = currentGame.moves({ verbose: true });
    if (moves.length === 0) return;

    let bestMove;

    if (mode === "easy") {
      bestMove = moves[Math.floor(Math.random() * moves.length)];
    } else if (mode === "medium") {
      bestMove = moves.reduce((best, move) => {
        const score = evaluateMove(currentGame, move);
        return score > best.score ? { move, score } : best;
      }, { move: null, score: -Infinity }).move;
    } else if (mode === "hard") {
      bestMove = moves.reduce((best, move) => {
        currentGame.move(move);
        const score = minimax(currentGame, 2, false, -Infinity, Infinity);
        currentGame.undo();
        return score > best.score ? { move, score } : best;
      }, { move: null, score: -Infinity }).move;
    }

    if (bestMove) {
      const result = currentGame.move(bestMove);
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
    }
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

  const renderCapturedPieces = (color) => {
    const icons = { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕" };
    return capturedPieces[color].map((type, idx) => (
      <span key={idx} className="captured-piece">
        {color === "w" ? icons[type] : icons[type].toLowerCase()}
      </span>
    ));
  };

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

  useEffect(() => {
    const handleResize = () => {
      if (boardContainerRef.current) {
        const containerSize = boardContainerRef.current.offsetWidth;
        setBoardWidth(window.innerWidth < 768 ? Math.min(containerSize, 410) : Math.min(containerSize, 600));
      }
    };

    const debounceResize = () => {
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(handleResize, 150);
    };

    handleResize();
    window.addEventListener("resize", debounceResize);
    return () => window.removeEventListener("resize", debounceResize);
  }, []);

  return (
    <div className="game-screen">
      <h1>{getModeName()}</h1>

      <div className="captured-pieces">
        <div>{renderCapturedPieces("w")}</div>
        <div>{renderCapturedPieces("b")}</div>
      </div>

      <div className="board-wrapper" ref={boardContainerRef}>
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={boardWidth}
          arePiecesDraggable={!game.game_over()}
        />
      </div>

      <div className={getTimerClass()}>
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
