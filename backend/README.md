# Minesweeper Backend

SQLite-based backend for storing and retrieving Minesweeper high scores.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Save a Score
**POST** `/api/scores`

Body:
```json
{
  "username": "Player Name",
  "difficulty": "easy|medium|hard",
  "score": 45
}
```

### Get Top 5 Scores for a Difficulty
**GET** `/api/scores/:difficulty`

Example: `/api/scores/easy`

### Get All Top Scores
**GET** `/api/scores`

### Health Check
**GET** `/api/health`

## Database

- Uses SQLite3 stored in `scores.db`
- Table: `scores` with columns:
  - id (Primary Key)
  - username
  - difficulty (easy, medium, hard)
  - score
  - created_at (timestamp)
