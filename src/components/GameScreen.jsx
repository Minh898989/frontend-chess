// Updated GameScreen component with improved UI/UX and responsive layout
import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const boardRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(() => (window.innerWidth < 768 ? 360 : 550));

  const isAI = mode !== "2players";
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userid;

  const pieceValue = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 1000 };

  const getTotalCaptured = useCallback(() => capturedPieces.w.length + capturedPieces.b.length, [capturedPieces]);
  const getMinutesPlayed = useCallback(() => Math.floor((15 * 60 - timeLeft) / 60), [timeLeft]);

  const updateLocalStats = useCallback(async (didWin, minutesPlayed, capturedCount) => {
    if (!userId) return;
    try {
      await axios.post("https://backend-chess-fjr7.onrender.com/api/stats/update", {
        userid: userId,
        didWin,
        minutesPlayed,
        capturedCount,
      });
    } catch (err) {
      console.error("Cập nhật thống kê thất bại:", err);
    }
  }, [userId]);

  const evaluateBoard = (gameInstance) => {
    let score = 0;
    for (let row of gameInstance.board()) {
      for (let piece of row) {
        if (piece) {
          const value = pieceValue[piece.type] || 0;
          score += piece.color === "w" ? value : -value;
        }
      }
    }
    return score;
  };

  const minimax = (gameInstance, depth, isMax, alpha, beta) => {
    if (depth === 0 || gameInstance.game_over()) return evaluateBoard(gameInstance);
    const moves = gameInstance.moves({ verbose: true });
    if (isMax) {
      let maxEval = -Infinity;
      for (let move of moves) {
        gameInstance.move(move);
        const evalScore = minimax(gameInstance, depth - 1, false, alpha, beta);
        gameInstance.undo();
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let move of moves) {
        gameInstance.move(move);
        const evalScore = minimax(gameInstance, depth - 1, true, alpha, beta);
        gameInstance.undo();
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  const evaluateMove = (gameInstance, move) => {
    let score = 0;
    if (move.captured) score += pieceValue[move.captured] || 0;
    gameInstance.move(move);
    if (gameInstance.in_check()) score += 0.5;
    gameInstance.undo();
    return score;
  };

  const makeAIMove = (gameInstance) => {
    const moves = gameInstance.moves({ verbose: true });
    if (moves.length === 0) return;

    let bestMove;
    if (mode === "easy") {
      bestMove = moves[Math.floor(Math.random() * moves.length)];
    } else if (mode === "medium") {
      bestMove = moves.reduce((best, move) => {
        return evaluateMove(gameInstance, move) > evaluateMove(gameInstance, best) ? move : best;
      }, moves[0]);
    } else {
      let bestScore = -Infinity;
      for (let move of moves) {
        gameInstance.move(move);
        const score = minimax(gameInstance, 2, false, -Infinity, Infinity);
        gameInstance.undo();
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }

    if (bestMove) {
      const result = gameInstance.move(bestMove);
      if (result?.captured) {
        const opp = result.color === "w" ? "b" : "w";
        setCapturedPieces(prev => ({ ...prev, [opp]: [...prev[opp], result.captured] }));
      }
      const newGame = new Chess(gameInstance.fen());
      setGame(newGame);
      if (newGame.game_over()) handleGameOver(newGame);
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    if (isGameOver) return false;
    const move = game.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (!move) return false;

    if (move.captured) {
      const opp = move.color === "w" ? "b" : "w";
      setCapturedPieces(prev => ({ ...prev, [opp]: [...prev[opp], move.captured] }));
    }

    const newGame = new Chess(game.fen());
    setGame(newGame);
    if (newGame.game_over()) handleGameOver(newGame);
    else if (isAI && newGame.turn() === "b") setTimeout(() => makeAIMove(newGame), 400);

    return true;
  };

  const handleGameOver = (gameInstance) => {
    setIsGameOver(true);
    const turn = gameInstance.turn();
    let resultText = "Hòa";
    let playerWon = false;

    if (gameInstance.in_checkmate()) {
      if (turn === "w") resultText = isAI ? "Máy thắng" : "Đen thắng";
      else {
        resultText = isAI ? "Bạn thắng" : "Trắng thắng";
        playerWon = isAI;
      }
    }

    updateLocalStats(playerWon, getMinutesPlayed(), getTotalCaptured());
    setWinner(resultText);
  };

  const handleResign = (color) => {
    const isWhite = color === "w";
    const resultText = isWhite ? (isAI ? "Máy thắng" : "Đen thắng") : (isAI ? "Bạn thắng" : "Trắng thắng");
    const playerWon = !isWhite && isAI;
    updateLocalStats(playerWon, getMinutesPlayed(), getTotalCaptured());
    setWinner(resultText);
    setIsGameOver(true);
  };

  useEffect(() => {
    if (isAI && game.turn() === "b" && !isGameOver) {
      setTimeout(() => makeAIMove(game), 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAI, game, isGameOver]);

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
    const handleResize = () => {
      if (boardRef.current) {
        const size = boardRef.current.offsetWidth;
        setBoardWidth(Math.min(size, window.innerWidth < 768 ? 360 : 550));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderCaptured = (color) => {
    const icons = { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕" };
    return capturedPieces[color].map((type, i) => (
      <span key={i} className="captured-piece">
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
        <div>{renderCaptured("w")}</div>
        <div>{renderCaptured("b")}</div>
      </div>

      <div className="board-wrapper" ref={boardRef}>
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={boardWidth}
          arePiecesDraggable={!game.game_over()}
        />
      </div>

      <div className="timer">
        <p>⏳ Còn lại: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</p>
      </div>

      {!isGameOver && (
        <div className="resign-button">
          <button onClick={() => handleResign(game.turn())}>Đầu hàng</button>
        </div>
      )}

      {winner && <p className="winner">🏆 {winner}</p>}
    </div>
  );
}

export default GameScreen;
