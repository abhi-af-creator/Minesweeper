type CellProps = {
  value: string;
  onClick: () => void;
  onRightClick: () => void;
  isRevealed: boolean;
  isFlagged: boolean;
  isExploding?: boolean;
};

function Cell({
  value,
  onClick,
  onRightClick,
  isRevealed,
  isFlagged,
  isExploding = false,
}: CellProps) {
  return (
    <div
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onRightClick();
      }}
      className={isExploding ? "cell-exploding" : ""}
      style={{
        width: "40px",
        height: "40px",
        border: "1px solid #555",
        backgroundColor: isRevealed ? "#ddd" : "#999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {isRevealed ? value : isFlagged ? "🚩" : ""}
    </div>
  );
}

export default Cell;
