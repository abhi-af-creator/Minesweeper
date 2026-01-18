const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'scores.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize Database Tables
function initializeDatabase() {
  db.run(
    `CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
      score INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Scores table ready');
      }
    }
  );
}

// Route: Save a Score
app.post('/api/scores', (req, res) => {
  const { username, difficulty, score } = req.body;

  if (!username || !difficulty || score === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validDifficulties = ['easy', 'medium', 'hard'];
  if (!validDifficulties.includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty level' });
  }

  db.run(
    `INSERT INTO scores (username, difficulty, score) VALUES (?, ?, ?)`,
    [username, difficulty, score],
    function (err) {
      if (err) {
        console.error('Error inserting score:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Score saved successfully' });
    }
  );
});

// Route: Get Top 5 Scores for a Difficulty
app.get('/api/scores/:difficulty', (req, res) => {
  const { difficulty } = req.params;

  const validDifficulties = ['easy', 'medium', 'hard'];
  if (!validDifficulties.includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty level' });
  }

  db.all(
    `SELECT username, score, created_at FROM scores 
     WHERE difficulty = ? 
     ORDER BY score ASC 
     LIMIT 5`,
    [difficulty],
    (err, rows) => {
      if (err) {
        console.error('Error fetching scores:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows || []);
    }
  );
});

// Route: Get All Scores for All Difficulties
app.get('/api/scores', (req, res) => {
  db.all(
    `SELECT username, difficulty, score, created_at FROM scores 
     ORDER BY difficulty, score ASC`,
    (err, rows) => {
      if (err) {
        console.error('Error fetching scores:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // Organize by difficulty
      const scores = {
        easy: [],
        medium: [],
        hard: []
      };

      rows.forEach((row) => {
        if (scores[row.difficulty]) {
          scores[row.difficulty].push(row);
        }
      });

      // Keep only top 5 for each difficulty
      Object.keys(scores).forEach((difficulty) => {
        scores[difficulty] = scores[difficulty].slice(0, 5);
      });

      res.json(scores);
    }
  );
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Minesweeper backend running on http://localhost:${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
