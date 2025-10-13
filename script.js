// ===== Get DOM Elements =====
const introScreen = document.getElementById("intro-screen");
const howScreen = document.getElementById("how-screen");
const gameScreen = document.getElementById("game-screen");
const pauseScreen = document.getElementById("pause-screen");
const gameoverScreen = document.getElementById("gameover-screen");
const victoryScreen = document.getElementById("victory-screen");

const startBtn = document.getElementById("start-btn");
const howBtn = document.getElementById("how-btn");
const backBtn = document.getElementById("back-btn");
const exitBtn = document.getElementById("exit-btn");

const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");
const menuBtn = document.getElementById("menu-btn");
const retryBtn = document.getElementById("retry-btn");
const menuBtn2 = document.getElementById("menu-btn2");
const menuBtn3 = document.getElementById("menu-btn3");
const nextLevelBtn = document.getElementById("next-level-btn");

const pauseBtn = document.getElementById("pause-btn");
const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const finalScoreEl = document.getElementById("final-score");
const winScoreEl = document.getElementById("win-score");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// ===== Multi-Level Definition =====
const levels = [
  // Level 1: Simple Rectangle
  [
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1]
  ],

  // Level 2: Pyramid Shape
  [
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0]
  ],

  // Level 3: Zig-Zag
  [
    [1,0,1,0,1,0,1],
    [0,1,0,1,0,1,0],
    [1,0,1,0,1,0,1],
    [0,1,0,1,0,1,0],
    [1,0,1,0,1,0,1]
  ],

  // Level 4: U-Shape
  [
    [1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1]
  ],

  // Level 5: Advanced Entrance
  [
    [1,1,1,1,1,1,1],
    [1,1,0,0,0,1,1],
    [1,1,0,0,0,1,1],
    [1,1,1,0,1,1,1],
    [0,0,1,0,1,0,0]
  ]
];

let currentLevel = 0; // Tracks current level

// ===== Game Variables =====
let paddleHeight = 10;
let paddleWidth = 80;
let paddleX = (canvas.width - paddleWidth) / 2;

let ballRadius = 8;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 3;
let dy = -3;

let rightPressed = false;
let leftPressed = false;

let score = 0;
let lives = 3;

let brickRowCount = 5;
let brickColumnCount = 7;
let brickWidth = 55;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;

let bricks = [];
let isPaused = false;
let animationId; // stores the current animation loop ID

// ===== Create Bricks =====
function initBricks() {
  bricks = [];
  const level = levels[currentLevel];
  brickRowCount = level.length;
  brickColumnCount = level[0].length;

  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = {
        x: 0,
        y: 0,
        status: level[r][c] // 1 = brick exists, 0 = empty
      };
    }
  }
}

// ===== Draw Bricks =====
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.fillStyle = "#ff6f61";
        ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(brickX, brickY, brickWidth, brickHeight);
      }
    }
  }
}

// ===== Draw Paddle =====
function drawPaddle() {
  ctx.fillStyle = "#00ffff";
  ctx.fillRect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
}

// ===== Draw Ball =====
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffff00";
  ctx.fill();
  ctx.closePath();
}

// ===== Draw Score =====
function drawScore() {
  scoreEl.textContent = score;
  document.getElementById("level").textContent = currentLevel + 1;
}

// ===== Draw Lives =====
function drawLives() {
  livesEl.textContent = lives;
}

// ===== Collision Detection =====
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score += 10;
          if (isLevelCleared()) {
  nextLevel();
}

          }
        }
      }
    }
  }
function isLevelCleared() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) return false;
    }
  }
  return true;
}
function nextLevel() {
  cancelAnimationFrame(animationId); // Stop any running animation
  currentLevel++;
  
  if (currentLevel >= levels.length) {
    winScoreEl.textContent = score;
    showScreen(victoryScreen);
  } else {
    resetBallPaddle(); // resets ball & paddle
    initBricks();      // load new level
    draw();            // start new loop
  }
}



// ===== Draw Everything =====
function draw() {
  if (isPaused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  collisionDetection();

  // Ball movement
  x += dx;
  y += dy;

  // Wall collision
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius - paddleHeight - 10) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
      lives--;
      if (lives <= 0) {
        showGameOverScreen();
        return; // stop animation
      } else {
        resetBallPaddle();
      }
    }
  }

  // Paddle movement
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  animationId = requestAnimationFrame(draw);
}


// ===== Reset Ball & Paddle =====
function resetBallPaddle() {
  x = canvas.width / 2;
  y = canvas.height - 30;
  // Keep original speed
  dx = 3;  // original horizontal speed
  dy = -3; // original vertical speed
  paddleX = (canvas.width - paddleWidth) / 2;
}


// ===== Key Handlers =====
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") {
    leftPressed = true;
  }
}
function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") {
    leftPressed = false;
  }
}

// ===== Mouse Movement =====
document.addEventListener("mousemove", mouseMoveHandler);
function mouseMoveHandler(e) {
  let relativeX = e.clientX - canvas.getBoundingClientRect().left;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

// ===== Mobile Buttons =====
leftBtn.addEventListener("touchstart", () => (leftPressed = true));
leftBtn.addEventListener("touchend", () => (leftPressed = false));
rightBtn.addEventListener("touchstart", () => (rightPressed = true));
rightBtn.addEventListener("touchend", () => (rightPressed = false));

// ===== Screen Handling =====
function showScreen(screen) {
  [introScreen, howScreen, gameScreen, pauseScreen, gameoverScreen, victoryScreen].forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

// ===== Buttons =====
startBtn.addEventListener("click", () => {
  showScreen(gameScreen);
  resetGame();
});

howBtn.addEventListener("click", () => showScreen(howScreen));
backBtn.addEventListener("click", () => showScreen(introScreen));
exitBtn.addEventListener("click", () => alert("Thanks for playing!"));

pauseBtn.addEventListener("click", () => {
  isPaused = true;
  showScreen(pauseScreen);
});

resumeBtn.addEventListener("click", () => {
  isPaused = false;
  showScreen(gameScreen);
  draw();
});

restartBtn.addEventListener("click", () => {
  resetGame();
  showScreen(gameScreen);
});

menuBtn.addEventListener("click", () => showScreen(introScreen));
retryBtn.addEventListener("click", () => {
  resetGame();
  showScreen(gameScreen);
});
menuBtn2.addEventListener("click", () => showScreen(introScreen));
menuBtn3.addEventListener("click", () => showScreen(introScreen));
nextLevelBtn.addEventListener("click", () => {
  // For now, just reset
  resetGame();
  showScreen(gameScreen);
});

// ===== Game Reset =====
function resetGame() {
  cancelAnimationFrame(animationId); // stop old loop
  score = 0;
  lives = 3;
  currentLevel = 0; // restart from first level
  resetBallPaddle();
  initBricks();
  isPaused = false;
  draw();            // start fresh loop
}



// ===== Show Game Over =====
function showGameOverScreen() {
  finalScoreEl.textContent = score;
  showScreen(gameoverScreen);
}

// ===== Show Victory =====
function showVictoryScreen() {
  winScoreEl.textContent = score;
  showScreen(victoryScreen);
}

// ===== Initialize =====
initBricks();
draw();
