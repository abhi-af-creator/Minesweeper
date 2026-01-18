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
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", width: "100%", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          width: "100%",
          maxWidth: "1000px",
        }}
      >
        <div style={{ flex: 1 }}></div>
        <h2 style={{ margin: 0, flex: 1, textAlign: "center" }}>Minesweeper</h2>
        <div style={{ flex: 1, textAlign: "right" }}>
          <strong>{username}</strong>
        </div>
      </div>

      <Board username={username} />
    </div>
  );
}

export default App;