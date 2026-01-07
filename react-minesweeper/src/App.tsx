import { useEffect, useState } from "react";
import Board from "./components/Board";

function App() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (!storedName) {
      const name = prompt("Enter your name:");
      if (name) {
        localStorage.setItem("username", name);
        setUsername(name);
      }
    } else {
      setUsername(storedName);
    }
  }, []);

  if (!username) return null;

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <h2>Minesweeper</h2>
        <div>
          <strong>{username}</strong>
        </div>
      </div>

      <Board />
    </div>
  );
}

export default App;