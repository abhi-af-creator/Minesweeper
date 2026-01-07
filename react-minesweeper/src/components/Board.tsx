import { useEffect, useState } from "react";
import Cell from "./Cell";
import { createBoard, revealCell, toggleFlag } from "../utils/gamelogic";
import type { CellType } from "../utils/types";

const ROWS = 8;
const COLS = 8;
const MINES = 10;

function Board() {
  // Game board
  const [board, setBoard] = useState<CellType[][]>(() =>
    createBoard(ROWS, COLS, MINES)
  );

  // Timer & game state
  const [seconds, setSeconds] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Best time (persisted)
  const [bestTime, setBestTime] = useState<number | null>(() => {
    const stored = localStorage.getItem("bestTime");
    return stored ? Number(stored) : null;
  });

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver]);

  /* ---------------- RESET ---------------- */
  const resetGame = () => {
    setBoard(createBoard(ROWS, COLS, MINES));
    setSeconds(0);
    setGameOver(false);
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

  /* ---------------- RENDER ---------------- */
  return (
    <div>
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
          🏆 Best:{" "}
          <strong>{bestTime !== null ? `${bestTime}s` : "--"}</strong>
        </div>

        <button onClick={resetGame}>Reset</button>
      </div>

      {/* Game Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 40px)`,
          gap: "2px",
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <Cell
              key={`${cell.row}-${cell.col}`}
              isRevealed={cell.isRevealed}
              isFlagged={cell.isFlagged}
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
                  setGameOver(true);
                  alert("💥 Game Over!");
                  return;
                }

                const updatedBoard = revealCell(board, r, c);
                setBoard(updatedBoard);

                if (checkWin(updatedBoard)) {
                  setGameOver(true);

                  if (bestTime === null || seconds < bestTime) {
                    localStorage.setItem("bestTime", seconds.toString());
                    setBestTime(seconds);
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
  );
}

export default Board;
