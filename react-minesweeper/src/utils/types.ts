export type Difficulty = "easy" | "medium" | "hard";

export type DifficultyConfig = {
  rows: number;
  cols: number;
  mines: number;
};

export type CellType = {
    row: number;
    col: number;
    isMine: boolean;
    adjacentMines: number;
    isRevealed: boolean;
    isFlagged: boolean;
};