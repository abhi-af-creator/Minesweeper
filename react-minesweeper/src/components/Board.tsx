import { useEffect, useState } from "react";
import Cell from "./Cell";
import { createBoard, revealCell, toggleFlag } from "../utils/gamelogic";
import type { CellType, Difficulty, DifficultyConfig } from "../utils/types";
import "./Board.css";

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: { rows: 5, cols: 5, mines: 3 },
  medium: { rows: 10, cols: 10, mines: 20 },
  hard: { rows: 20, cols: 20, mines: 80 },
};

function Board() {
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

  // Timer & game state
  const [seconds, setSeconds] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Best times for each difficulty (persisted separately)
  const [bestTimes, setBestTimes] = useState<Record<Difficulty, number | null>>(
    () => {
      const stored = localStorage.getItem("bestTimes");
      return stored
        ? JSON.parse(stored)
        : { easy: null, medium: null, hard: null };
    }
  );

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

      {/* Header: Timer, Best Time, Reset */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
          alignItems: "center",
        }}
      >
        <div>
          ⏱ Time: <strong>{seconds}s</strong>
        </div>

        <div>
          🏆 Best ({difficulty}): <strong>{currentBestTime !== null ? `${currentBestTime}s` : "--"}</strong>
        </div>

        <button onClick={resetGame}>Reset</button>
      </div>

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

                if (cell.isMine) {
                  setExploringCell({ row: r, col: c });
                  setIsExploding(true);
                  setGameOver(true);
                  setTimeout(() => {
                    alert("💥 Game Over!");
                  }, 300);
                  return;
                }

                const updatedBoard = revealCell(board, r, c);
                setBoard(updatedBoard);

                if (checkWin(updatedBoard)) {
                  setGameOver(true);

                  const newBestTimes = { ...bestTimes };
                  if (
                    newBestTimes[difficulty] === null ||
                    seconds < newBestTimes[difficulty]!
                  ) {
                    newBestTimes[difficulty] = seconds;
                    localStorage.setItem("bestTimes", JSON.stringify(newBestTimes));
                    setBestTimes(newBestTimes);
                  }

                  alert(`🎉 You Win in ${seconds} seconds!`);
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
    </div>
  );
}

export default Board;
