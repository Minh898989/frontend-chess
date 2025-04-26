export const evaluateBoard = (game) => {
    const values = {
      p: 1, n: 3, b: 3, r: 5, q: 9, k: 100,
    };
    let evalScore = 0;
    const board = game.board();
  
    board.forEach((row) => {
      row.forEach((piece) => {
        if (piece) {
          const value = values[piece.type];
          evalScore += piece.color === "w" ? value : -value;
        }
      });
    });
  
    return evalScore;
  };
  
  export const minimax = (depth, game, alpha, beta, isMaximizing) => {
    if (depth === 0 || game.game_over()) {
      return evaluateBoard(game);
    }
  
    const moves = game.moves();
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        game.move(move);
        const evalScore = minimax(depth - 1, game, alpha, beta, false);
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
        const evalScore = minimax(depth - 1, game, alpha, beta, true);
        game.undo();
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };
  
  export const getBestMove = (game, level) => {
    const moves = game.moves();
    if (level === "easy") {
      return moves[Math.floor(Math.random() * moves.length)];
    }
  
    const depth = level === "medium" ? 2 : 3;
    let bestMove = null;
    let bestValue = -Infinity;
  
    for (const move of moves) {
      game.move(move);
      const boardValue = minimax(depth - 1, game, -Infinity, Infinity, false);
      game.undo();
  
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }
  
    return bestMove;
  };
  