export type CellType = {
    row: number;
    col: number;
    isMine: boolean;
    adjacentMines: number;
    isRevealed: boolean;
    isFlagged: boolean;
};