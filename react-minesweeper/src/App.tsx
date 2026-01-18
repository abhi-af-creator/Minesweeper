import { useEffect, useState, useRef } from "react";
import Board from "./components/Board";

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const promptShownRef = useRef(false);

  useEffect(() => {
    if (promptShownRef.current) return; // Prevent double prompt
    promptShownRef.current = true;
    
    const name = prompt("Enter your name:");
    if (name) {
      setUsername(name);
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