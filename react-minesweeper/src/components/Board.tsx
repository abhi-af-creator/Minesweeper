import { useEffect, useState } from "react";
import Cell from "./Cell";
import { createBoard, revealCell, toggleFlag } from "../utils/gamelogic";
import type { CellType, Difficulty, DifficultyConfig } from "../utils/types";
import "./Board.css";

const API_URL = "http://localhost:5000/api";

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: { rows: 5, cols: 5, mines: 3 },
  medium: { rows: 10, cols: 10, mines: 20 },
  hard: { rows: 20, cols: 20, mines: 80 },
};

interface BoardProps {
  username: string;
}

function Board({ username }: BoardProps) {
  // Game state
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [board, setBoard] = useState<CellType[][]>(() =>
    createBoard(
      DIFFICULTY_CONFIG.easy.rows,
      DIFFICULTY_CONFIG.easy.cols,
      DIFFICULTY_CONFIG.easy.mines
    )
  );
  const [exploringCell, setExploringCell] = useState<{ row: number; col: number } | null>(null);
  const [isExploding, setIsExploding] = useState(false);
  const [isFirstClick, setIsFirstClick] = useState(true);

  // Timer & game state
  const [seconds, setSeconds] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Best times for each difficulty (persisted separately)
  const [bestTimes, setBestTimes] = useState<Record<Difficulty, number | null>>(
    () => {
      const stored = localStorage.getItem("bestTimes");
      return stored
        ? JSON.parse(stored)
        : { easy: null, medium: null, hard: null };
    }
  );

  // All scores for each difficulty (from database)
  const [allScores, setAllScores] = useState<Record<Difficulty, Array<{ username: string; score: number }>>>(
    () => {
      return { easy: [], medium: [], hard: [] };
    }
  );

  // Load scores from database on mount and when difficulty changes
  useEffect(() => {
    fetchLeaderboard();
  }, [difficulty]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/scores/${difficulty}`);
      const data = await response.json();
      setAllScores((prev) => ({
        ...prev,
        [difficulty]: data,
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const saveScore = async (score: number) => {
    try {
      await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          difficulty,
          score,
        }),
      });
      // Refresh leaderboard after saving
      fetchLeaderboard();
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver]);

  /* ---------------- RESET GAME (same difficulty) ---------------- */
  const resetGame = () => {
    const config = DIFFICULTY_CONFIG[difficulty];
    setBoard(createBoard(config.rows, config.cols, config.mines));
    setSeconds(0);
    setGameOver(false);
    setExploringCell(null);
    setIsExploding(false);
    setIsWon(false);
    setIsLost(false);
    setIsFirstClick(true);
  };

  /* ---------------- CHANGE DIFFICULTY ---------------- */
  const changeDifficulty = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    const config = DIFFICULTY_CONFIG[newDifficulty];
    setBoard(createBoard(config.rows, config.cols, config.mines));
    setSeconds(0);
    setGameOver(false);
    setExploringCell(null);
    setIsExploding(false);
    setIsWon(false);
    setIsLost(false);
    setIsFirstClick(true);
  };

  /* ---------------- WIN CHECK ---------------- */
  const checkWin = (currentBoard: CellType[][]) => {
    for (const row of currentBoard) {
      for (const cell of row) {
        if (!cell.isMine && !cell.isRevealed) {
          return false;
        }
      }
    }
    return true;
  };

  const config = DIFFICULTY_CONFIG[difficulty];
  const currentBestTime = bestTimes[difficulty];

  /* ---------------- RENDER ---------------- */
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Difficulty Selection with Radio Buttons */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f0f0f0",
          borderRadius: "5px",
          textAlign: "center",
        }}
      >
        <strong>Difficulty Level:</strong>
        <div style={{ marginTop: "10px", display: "flex", gap: "20px", justifyContent: "center" }}>
          {(["easy", "medium", "hard"] as const).map((level) => (
            <label key={level} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="radio"
                name="difficulty"
                value={level}
                checked={difficulty === level}
                onChange={() => changeDifficulty(level)}
                style={{ marginRight: "5px", cursor: "pointer" }}
              />
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Header: Timer, Best Time */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          marginBottom: "10px",
          alignItems: "center",
          padding: "10px 15px",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: "8px",
          color: "#ffffff",
          fontSize: "16px",
        }}
      >
        <div>
          ⏱ Time: <strong>{seconds}s</strong>
        </div>

        <div>
          🏆 Best ({difficulty}): <strong>{currentBestTime !== null ? `${currentBestTime}s` : "--"}</strong>
        </div>
      </div>

      {/* Game Grid with Reset Button */}
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        {/* Game Grid with Minefield Background */}
        <div className={`board-wrapper ${isExploding ? "exploding" : ""}`}>
          <div
            className="game-grid"
            style={{
              gridTemplateColumns: `repeat(${config.cols}, 40px)`,
            }}
          >
            {board.map((row, r) =>
            row.map((cell, c) => (
              <Cell
                key={`${cell.row}-${cell.col}`}
                isRevealed={cell.isRevealed}
                isFlagged={cell.isFlagged}
                isExploding={isExploding && exploringCell?.row === r && exploringCell?.col === c}
                value={
                  cell.isMine
                    ? "💣"
                    : cell.adjacentMines > 0
                    ? cell.adjacentMines.toString()
                    : ""
                }
                onClick={() => {
                  if (gameOver || cell.isFlagged || cell.isRevealed) return;

                  let currentBoard = board;

                  // If it's the first click and it's a mine, regenerate the board
                  if (isFirstClick && cell.isMine) {
                    const config = DIFFICULTY_CONFIG[difficulty];
                    let newBoard = createBoard(config.rows, config.cols, config.mines);
                    
                    // Keep regenerating until the first clicked cell is not a mine
                    while (newBoard[r][c].isMine) {
                      newBoard = createBoard(config.rows, config.cols, config.mines);
                    }
                    
                    setBoard(newBoard);
                    currentBoard = newBoard;
                  }

                  setIsFirstClick(false);

                  if (currentBoard[r][c].isMine) {
                    setExploringCell({ row: r, col: c });
                    setIsExploding(true);
                    setGameOver(true);
                    setIsLost(true);
                    return;
                  }

                  const updatedBoard = revealCell(currentBoard, r, c);
                  setBoard(updatedBoard);

                  if (checkWin(updatedBoard)) {
                    setGameOver(true);
                    setIsWon(true);

                    const newBestTimes = { ...bestTimes };
                    if (
                      newBestTimes[difficulty] === null ||
                      seconds < newBestTimes[difficulty]!
                    ) {
                      newBestTimes[difficulty] = seconds;
                      localStorage.setItem("bestTimes", JSON.stringify(newBestTimes));
                      setBestTimes(newBestTimes);
                    }

                    // Save score to database
                    saveScore(seconds);
                  }
                }}
                onRightClick={() => {
                  if (gameOver) return;
                  setBoard(toggleFlag(board, r, c));
                }}
              />
            ))
          )}
          </div>
        </div>

        {/* Reset Button on the Side */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button 
            onClick={resetGame}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#45a049"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4CAF50"}
          >
            Reset
          </button>
          
          <button 
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0b7dda"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2196F3"}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {/* Win Modal */}
      {isWon && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "40px 60px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h1 style={{ margin: 0, fontSize: "48px", color: "#4CAF50" }}>You have Won</h1>
            <p style={{ fontSize: "20px", color: "#333", marginTop: "10px" }}>Time: {seconds}s</p>
            <button
              onClick={resetGame}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#45a049"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4CAF50"}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Lose Modal */}
      {isLost && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "40px 60px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h1 style={{ margin: 0, fontSize: "48px", color: "#f44336" }}>Lost this time. Give it a go again</h1>
            <button
              onClick={resetGame}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#45a049"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4CAF50"}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
              maxHeight: "80vh",
              overflowY: "auto",
              maxWidth: "600px",
            }}
          >
            <h1 style={{ margin: "0 0 20px 0", fontSize: "36px", color: "#333" }}>Leaderboard</h1>
            
            {(["easy", "medium", "hard"] as const).map((level) => (
              <div key={level} style={{ marginBottom: "30px", textAlign: "left" }}>
                <h2 style={{ fontSize: "24px", color: "#2196F3", borderBottom: "2px solid #2196F3", paddingBottom: "10px" }}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </h2>
                {allScores[level] && allScores[level].length > 0 ? (
                  <ol style={{ paddingLeft: "20px", fontSize: "16px", color: "#333" }}>
                    {allScores[level].map((item: any, index) => (
                      <li key={index} style={{ marginBottom: "8px" }}>
                        <span style={{ fontWeight: "bold" }}>{item.username}</span> - <span style={{ color: "#4CAF50", fontWeight: "bold" }}>{item.score}s</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p style={{ color: "#666", fontStyle: "italic" }}>No scores yet</p>
                )}
              </div>
            ))}

            <button
              onClick={() => setShowLeaderboard(false)}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0b7dda"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2196F3"}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Board;
