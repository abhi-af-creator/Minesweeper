import type { CellType } from "./types";

/**
 * Create a new minesweeper board
 */
export const createBoard = (
  rows: number,
  cols: number,
  mines: number
): CellType[][] => {
  const board: CellType[][] = [];

  // 1. Create empty board
  for (let r = 0; r < rows; r++) {
    const row: CellType[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        isMine: false,
        adjacentMines: 0,
        isRevealed: false,
        isFlagged: false,
      });
    }
    board.push(row);
  }

  // 2. Place mines randomly
  let placedMines = 0;
  while (placedMines < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    if (!board[r][c].isMine) {
      board[r][c].isMine = true;
      placedMines++;
    }
  }

  // 3. Calculate adjacent mine counts
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) continue;

      let count = 0;
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (
          nr >= 0 &&
          nr < rows &&
          nc >= 0 &&
          nc < cols &&
          board[nr][nc].isMine
        ) {
          count++;
        }
      }
      board[r][c].adjacentMines = count;
    }
  }

  return board;
};

/**
 * Reveal a cell (with recursive flood fill)
 */
export const revealCell = (
  board: CellType[][],
  row: number,
  col: number
): CellType[][] => {
  const newBoard = board.map((r) => r.map((c) => ({ ...c })));
  const cell = newBoard[row][col];

  if (cell.isRevealed || cell.isFlagged) return newBoard;

  cell.isRevealed = true;

  if (!cell.isMine && cell.adjacentMines === 0) {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1],
    ];

    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;

      if (
        nr >= 0 &&
        nr < newBoard.length &&
        nc >= 0 &&
        nc < newBoard[0].length
      ) {
        const neighbor = newBoard[nr][nc];
        if (!neighbor.isRevealed && !neighbor.isMine) {
          newBoard[nr][nc] = revealCell(newBoard, nr, nc)[nr][nc];
        }
      }
    }
  }

  return newBoard;
};

/**
 * Toggle flag on a cell
 */
export const toggleFlag = (
  board: CellType[][],
  row: number,
  col: number
): CellType[][] => {
  const newBoard = board.map((r) => r.map((c) => ({ ...c })));
  const cell = newBoard[row][col];

  if (!cell.isRevealed) {
    cell.isFlagged = !cell.isFlagged;
  }

  return newBoard;
};
