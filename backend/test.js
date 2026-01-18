// Test script to verify the backend is working
const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('Testing Minesweeper Backend API...\n');

  // Test health check
  try {
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✓ Health check passed:', healthData);
  } catch (error) {
    console.error('✗ Health check failed:', error);
  }

  // Test saving a score
  try {
    console.log('\n2. Testing save score...');
    const saveResponse = await fetch(`${API_URL}/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Test Player',
        difficulty: 'easy',
        score: 45,
      }),
    });
    const saveData = await saveResponse.json();
    console.log('✓ Score saved:', saveData);
  } catch (error) {
    console.error('✗ Save score failed:', error);
  }

  // Test fetching scores
  try {
    console.log('\n3. Testing fetch scores for easy...');
    const scoresResponse = await fetch(`${API_URL}/scores/easy`);
    const scoresData = await scoresResponse.json();
    console.log('✓ Scores fetched:', scoresData);
  } catch (error) {
    console.error('✗ Fetch scores failed:', error);
  }
}

testAPI();
