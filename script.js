// Game configuration and state variables
const GOAL_CANS = 20;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let timerInterval; // Make sure this is accessible globally
let spawnInterval;          // Holds the interval for spawning items

let difficulty = 'normal'; // default
const DIFFICULTY_SETTINGS = {
  easy:    { timer: 60, canDisplay: 3500, obstacleLimit: 3, spawnRate: 1200 },
  normal:  { timer: 35, canDisplay: 2000, obstacleLimit: 2, spawnRate: 1000 },
  hard:    { timer: 20, canDisplay: 1200, obstacleLimit: 1, spawnRate: 700 }
};
let obstacleHits = 0;

const milestones = [
  { score: 5, message: "Nice start! 5 cans collected." },
  { score: 10, message: "Halfway there!" },
  { score: 15, message: "Just a few more to go!" },
 { score: GOAL_CANS, message: "🎉🚰 You reached the goal!" }
];

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell
function spawnItem() {
  const cells = document.querySelectorAll('.grid-cell');
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  const rand = Math.random();
  let cellContent = '';
  if (rand < 0.2) {
    // 20% chance: obstacle
    cellContent = `<div class="obstacle"></div>`;
  } else {
    // 30% chance: bad can, else good can
    const isBadCan = Math.random() < 0.3; // 30% chance of bad can

    randomCell.innerHTML = `
      <div class="water-can ${isBadCan ? 'bad' : ''}"></div>
    `;

    const waterCan = randomCell.querySelector('.water-can');
    let removeTimeout;

    if (waterCan) {
      // Remove the can after 2 seconds if not clicked
      removeTimeout = setTimeout(() => {
        randomCell.innerHTML = '';
      }, DIFFICULTY_SETTINGS[difficulty].canDisplay);

      waterCan.addEventListener('click', () => {
        if (!gameActive) return;

        clearTimeout(removeTimeout); // Prevent removal after click

        if (waterCan.classList.contains('bad')) {
          currentCans = Math.max(0, currentCans - 2);
          document.getElementById('achievements').textContent = "🚫 Dirty water! Lost 2 points!";
        } else {
          currentCans++;
          // Check for milestone
          const milestone = milestones.find(m => m.score === currentCans);
          if (milestone) {
            document.getElementById('achievements').textContent = milestone.message;
            if (currentCans === GOAL_CANS) {
              endGame();
            }
          }
        }

        document.getElementById('current-cans').textContent = currentCans;
        randomCell.innerHTML = '';
      });
    }
  }

  const obstacle = randomCell.querySelector('.obstacle');
  if (obstacle) {
    obstacle.addEventListener('click', () => {
      if (!gameActive) return;
      obstacleHits++;
      document.getElementById('achievements').textContent = "🪨 Oops! You hit an obstacle!";
      randomCell.innerHTML = '';
      if (obstacleHits >= DIFFICULTY_SETTINGS[difficulty].obstacleLimit) {
        document.getElementById('achievements').textContent = "💥 Game over! Too many obstacles!";
        endGame();
      }
    });
  }
}

function startTimer() {
  let timeLeft = DIFFICULTY_SETTINGS[difficulty].timer;
  document.getElementById('timer').textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame();
      document.getElementById('achievements').textContent =
        "⏰ Time’s up! You collected " + currentCans + " cans.";
    }
  }, 1000);
}

// Initializes and starts a new game
function startGame() {
  currentCans = 0;
  obstacleHits = 0;
  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('achievements').textContent = '';
  gameActive = true;
  createGrid();
  spawnInterval = setInterval(spawnItem, DIFFICULTY_SETTINGS[difficulty].spawnRate);
  startTimer();
}

function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);

  // Clear remaining cans from grid
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => (cell.innerHTML = ''));
}

function resetGame() {
  // Stop all intervals
  clearInterval(timerInterval);
  clearInterval(spawnInterval);

  // Reset game state
  currentCans = 0;
  document.getElementById('current-cans').textContent = '0';
  document.getElementById('timer').textContent = '30'; // Reset timer display
  document.getElementById('achievements').textContent = '';
  gameActive = false;

  // Clear the grid
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => (cell.innerHTML = ''));

  // Optionally, recreate the grid if needed
  // createGrid();

  // Do NOT call startGame() here
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);
// Attach the event listener after DOM is loaded
document.getElementById('reset-game').addEventListener('click', resetGame);
document.getElementById('easy-mode').addEventListener('click', () => setDifficulty('easy'));
document.getElementById('normal-mode').addEventListener('click', () => setDifficulty('normal'));
document.getElementById('hard-mode').addEventListener('click', () => setDifficulty('hard'));

function setDifficulty(mode) {
  difficulty = mode;
  document.getElementById('achievements').textContent = `Difficulty set to ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
  resetGame();
}

