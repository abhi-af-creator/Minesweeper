# React Minesweeper 🎮

A classic **Minesweeper game** built using **React and TypeScript** as an academic and portfolio project.  
The game implements core Minesweeper mechanics such as recursive cell reveal, flagging, win/lose detection, and board regeneration.

---

## 🚀 Features

- Left-click to reveal a cell
- Right-click to place or remove a flag 🚩
- Recursive reveal of empty cells (flood fill algorithm)
- Random mine placement on every game start
- Win condition detection 🏆
- Game over detection 💥
- Restart game functionality 🔄

---

## 🛠️ Tech Stack

- **React**
- **TypeScript**
- **Vite**
- HTML5 / CSS3

---

## 🧠 Concepts Demonstrated

- Component-based UI design
- Immutable state management
- Recursive algorithms (flood fill)
- Event handling (click & right-click)
- Type-safe data models with TypeScript
- Clean separation of UI and game logic

---

## 📁 Project Structure

src/
├─ components/
│ ├─ Board.tsx
│ └─ Cell.tsx
├─ utils/
│ ├─ gameLogic.ts
│ └─ types.ts
├─ App.tsx
├─ main.tsx
└─ index.css