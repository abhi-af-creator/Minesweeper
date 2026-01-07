import { useState } from "react";
import Cell from "./Cell";
import { createBoard, revealCell, toggleFlag } from "../utils/gameLogic";
import type { CellType } from "../utils/types";

const ROWS = 8;
const COLS = 8;
const MINES = 10;

function Board() {
  const [board, setBoard] = useState<CellType[][]>(() =>
    createBoard(ROWS, COLS, MINES)
  );

  const checkWin = (board: CellType[][]) => {
    for (const row of board) {
      for (const cell of row) {
        if (!cell.isMine && !cell.isRevealed) {
          return false;
        }
      }
    }
    return true;
  };

  return (
    <div>
      <button
        onClick={() => setBoard(createBoard(ROWS, COLS, MINES))}
        style={{ marginBottom: "10px" }}
      >
        Restart
      </button>

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
                if (cell.isFlagged || cell.isRevealed) return;

                if (cell.isMine) {
                  alert("💥 Game Over!");
                  return;
                }

                const updated = revealCell(board, r, c);
                setBoard(updated);

                if (checkWin(updated)) {
                  alert("🎉 You Win!");
                }
              }}
              onRightClick={() => {
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
