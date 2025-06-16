// Game configuration and state variables
const GOAL_CANS = 20;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let timerInterval; // Make sure this is accessible globally
let spawnInterval;          // Holds the interval for spawning items

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
      }, 2000);

      waterCan.addEventListener('click', () => {
        if (!gameActive) return;

        clearTimeout(removeTimeout); // Prevent removal after click

        if (waterCan.classList.contains('bad')) {
          currentCans = Math.max(0, currentCans - 2);
          document.getElementById('achievements').textContent = "🚫 Dirty water! Lost 2 points!";
        } else {
          currentCans++;
          if (currentCans === 10) {
            document.getElementById('achievements').textContent = "💧 10 cans! Keep going!";
          } else if (currentCans === 20) {
            document.getElementById('achievements').textContent = "🚰 You're almost there!";
          } else if (currentCans === GOAL_CANS) {
            document.getElementById('achievements').textContent = "🎉 You reached the goal!";
            endGame();
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
      document.getElementById('achievements').textContent = "🪨 Oops! You hit an obstacle!";
      randomCell.innerHTML = '';
    });
  }
}

function startTimer() {
   let timeLeft = 35; // 35 seconds countdown
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
  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('achievements').textContent = '';
  gameActive = true;
  createGrid(); // Set up the game grid
  spawnInterval = setInterval(spawnItem, 1000); // Spawn water cans every second
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

