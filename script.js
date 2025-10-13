// script.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== Constants (speed stays the same across levels) =====
  const INITIAL_DX = 3;    // horizontal speed magnitude
  const INITIAL_DY = -3;   // vertical speed magnitude (negative = upward)
  const PADDLE_SPEED = 7;

  // ===== DOM Elements =====
  const introScreen = document.getElementById("introScreen");
  const howToScreen = document.getElementById("howToScreen");
  const scoreScreen = document.getElementById("scoreScreen");
  const gameScreen = document.getElementById("gameScreen");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const victoryScreen = document.getElementById("victoryScreen");
  const completeGameScreen = document.getElementById("completeGameScreen");
  const exitScreen = document.getElementById("exitScreen");

  const startGameBtn = document.getElementById("startGameBtn");
  const howToPlayBtn = document.getElementById("howToPlayBtn");
  const highScoreBtn = document.getElementById("highScoreBtn");
  const exitBtn = document.getElementById("exitBtn");
  const backToMenu1 = document.getElementById("backToMenu1");
  const backToMenu2 = document.getElementById("backToMenu2");
  const backToMenu3 = document.getElementById("backToMenu3");
  const backToMenu4 = document.getElementById("backToMenu4");
  const backToMenu5 = document.getElementById("backToMenu5");
  const reopenBtn = document.getElementById("reopenBtn");

  const clearScoresBtn = document.getElementById("clearScoresBtn");
  const highScoreList = document.getElementById("highScoreList");

  const gameCanvas = document.getElementById("gameCanvas");
  const ctx = gameCanvas.getContext("2d");

  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const pauseOverlay = document.getElementById("pauseOverlay");

  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const levelEl = document.getElementById("level");

  const finalScoreEl = document.getElementById("finalScore");
  const finalLevelEl = document.getElementById("finalLevel");

  const winScoreEl = document.getElementById("winScore");
  const nextLevelBtn = document.getElementById("nextLevelBtn");

  const totalWinScoreEl = document.getElementById("totalWinScore");
  const playAgainFullBtn = document.getElementById("playAgainFullBtn");
  const playAgainBtn = document.getElementById("playAgainBtn");

  // defensive checks (in case HTML ids mismatch)
  if (!ctx) {
    console.error("Canvas not found or context missing. Make sure #gameCanvas exists.");
    return;
  }

  // ===== Levels (5 levels with different shapes) =====
  const levels = [
    // Level 1: Full rectangle
    [
      [1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1]
    ],
    // Level 2: Pyramid
    [
      [0,0,1,1,1,0,0],
      [0,1,1,1,1,1,0],
      [1,1,1,1,1,1,1],
      [0,1,1,1,1,1,0],
      [0,0,1,1,1,0,0]
    ],
    // Level 3: Zig-zag
    [
      [1,0,1,0,1,0,1],
      [0,1,0,1,0,1,0],
      [1,0,1,0,1,0,1],
      [0,1,0,1,0,1,0],
      [1,0,1,0,1,0,1]
    ],
    // Level 4: U-shape
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

  // ===== Game variables =====
  let animationId = null;

  let canvasWidth = gameCanvas.width;   // 480
  let canvasHeight = gameCanvas.height; // 320

  let paddleHeight = 10;
  let paddleWidth = 80;
  let paddleX = (canvasWidth - paddleWidth) / 2;

  let ballRadius = 8;
  let x = canvasWidth / 2;
  let y = canvasHeight - 30;
  let dx = INITIAL_DX;
  let dy = INITIAL_DY;

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
  let currentLevel = 0;
  const TOTAL_LEVELS = levels.length;

  // High scores key
  const HIGHSCORE_KEY = "brickCrackHighScores";

  // ===== Helper: Show/Hide Screens =====
  function hideAllScreens() {
    const screens = document.querySelectorAll(".screen");
    screens.forEach(s => s.classList.remove("active"));
  }
  function showScreen(screenEl) {
    hideAllScreens();
    screenEl.classList.add("active");
  }

  // ===== Initialize bricks for current level =====
  function initBricks() {
    bricks = [];
    const level = levels[currentLevel];
    // level is an array of rows; row length determines columns
    brickRowCount = level.length;
    brickColumnCount = level[0].length;

    // compute dynamic offsets to center bricks in canvas
    const totalBricksWidth = brickColumnCount * brickWidth + (brickColumnCount - 1) * brickPadding;
    brickOffsetLeft = Math.max(10, Math.floor((canvasWidth - totalBricksWidth) / 2));

    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        const status = level[r][c] === 1 ? 1 : 0;
        bricks[c][r] = { x: 0, y: 0, status: status };
      }
    }
  }

  // ===== Drawing functions =====
  function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status === 1) {
          const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
          const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;

          // draw brick (with slight gradient)
          const grad = ctx.createLinearGradient(brickX, brickY, brickX + brickWidth, brickY + brickHeight);
          grad.addColorStop(0, "#ff6f61");
          grad.addColorStop(1, "#ff9a8b");
          ctx.fillStyle = grad;
          ctx.fillRect(brickX, brickY, brickWidth, brickHeight);

          ctx.strokeStyle = "rgba(255,255,255,0.15)";
          ctx.strokeRect(brickX, brickY, brickWidth, brickHeight);
        }
      }
    }
  }

  function drawPaddle() {
    ctx.fillStyle = "#00ffff";
    ctx.fillRect(paddleX, canvasHeight - paddleHeight - 10, paddleWidth, paddleHeight);
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd166";
    ctx.fill();
    ctx.closePath();
  }

  function updateHUD() {
    if (scoreEl) scoreEl.textContent = score;
    if (livesEl) livesEl.textContent = lives;
    if (levelEl) levelEl.textContent = (currentLevel + 1);
  }

  // ===== Collision detection with bricks =====
  function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const b = bricks[c][r];
        if (b && b.status === 1) {
          // check collision using bounding box
          if (
            x > b.x - ballRadius &&
            x < b.x + brickWidth + ballRadius &&
            y > b.y - ballRadius &&
            y < b.y + brickHeight + ballRadius
          ) {
            // determine collision side: invert dy if hit from top/bottom, else invert dx
            // Simple approach: invert dy (works well for bricks stacked)
            dy = -dy;
            b.status = 0;
            score += 10;
            updateHUD();

            // level cleared?
            if (isLevelCleared()) {
              // stop animation and show victory/next level
              cancelAnimationFrame(animationId);
              setTimeout(() => { // slight delay for visual effect
                if (currentLevel < TOTAL_LEVELS - 1) {
                  // show level complete / victory screen for level
                  if (winScoreEl) winScoreEl.textContent = score;
                  showScreen(victoryScreen);
                } else {
                  // completed all levels
                  showCompleteGame();
                }
              }, 250);
            }
            return; // avoid multi-collisions in one frame
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

  // ===== Game loop =====
  function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  }

  function draw() {
    // main loop
    clearCanvas();
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // Ball movement
    x += dx;
    y += dy;

    // Wall collisions
    if (x + dx > canvasWidth - ballRadius || x + dx < ballRadius) {
      dx = -dx;
    }
    if (y + dy < ballRadius) {
      dy = -dy;
    } else if (y + dy > canvasHeight - ballRadius - paddleHeight - 10) {
      // check paddle hit
      if (x > paddleX && x < paddleX + paddleWidth) {
        // calculate where the ball hit the paddle to give angle variety
        const hitPos = x - (paddleX + paddleWidth / 2);
        const normalized = hitPos / (paddleWidth / 2); // -1 ... 1
        dx = INITIAL_DX * normalized; // vary horizontal component, keep magnitude similar
        dy = -Math.abs(dy); // reflect upward
      } else if (y + dy > canvasHeight - ballRadius) {
        // Ball fell below paddle
        lives--;
        updateHUD();
        if (lives <= 0) {
          // game over
          cancelAnimationFrame(animationId);
          showGameOver();
          return;
        } else {
          resetBallPaddle();
        }
      }
    }

    // Paddle movement via flags
    if (rightPressed && paddleX < canvasWidth - paddleWidth) {
      paddleX += PADDLE_SPEED;
    } else if (leftPressed && paddleX > 0) {
      paddleX -= PADDLE_SPEED;
    }

    animationId = requestAnimationFrame(draw);
  }

  // ===== Ball & Paddle reset (keep speed constants) =====
  function resetBallPaddle() {
    x = canvasWidth / 2;
    y = canvasHeight - 30;
    dx = INITIAL_DX;
    dy = INITIAL_DY;
    paddleX = (canvasWidth - paddleWidth) / 2;
  }

  // ===== Start / Reset / Next Level / Game Over handlers =====
  function startGame() {
    // cancel any running loop
    if (animationId) cancelAnimationFrame(animationId);

    score = 0;
    lives = 3;
    currentLevel = 0;
    resetBallPaddle();
    initBricks();
    updateHUD();
    showScreen(gameScreen);
    // small timeout to ensure canvas visible before starting loop
    setTimeout(() => {
      if (animationId) cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(draw);
    }, 80);
  }

  function resetGame() {
    if (animationId) cancelAnimationFrame(animationId);
    score = 0;
    lives = 3;
    currentLevel = 0;
    resetBallPaddle();
    initBricks();
    updateHUD();
    showScreen(gameScreen);
    animationId = requestAnimationFrame(draw);
  }

  function playAgain() {
    // Called from game over screens
    resetGame();
  }

  function nextLevel() {
    if (animationId) cancelAnimationFrame(animationId);
    currentLevel++;
    if (currentLevel >= TOTAL_LEVELS) {
      // completed full game
      showCompleteGame();
      return;
    }
    resetBallPaddle();
    initBricks();
    updateHUD();
    showScreen(gameScreen);
    // resume drawing
    animationId = requestAnimationFrame(draw);
  }

  function showGameOver() {
    if (finalScoreEl) finalScoreEl.textContent = score;
    if (finalLevelEl) finalLevelEl.textContent = currentLevel + 1;
    // save to high scores
    saveHighScore(score);
    showScreen(gameOverScreen);
  }

  function showCompleteGame() {
    // all levels done
    saveHighScore(score);
    if (totalWinScoreEl) totalWinScoreEl.textContent = score;
    showScreen(completeGameScreen);
  }

  // ===== High Score functions =====
  function loadHighScores() {
    const raw = localStorage.getItem(HIGHSCORE_KEY);
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
      return [];
    } catch (e) {
      console.error("Failed to parse high scores", e);
      return [];
    }
  }

  function saveHighScore(newScore) {
    const arr = loadHighScores();
    const entry = { score: newScore, date: new Date().toISOString() };
    arr.push(entry);
    // keep only top 10 by score desc
    arr.sort((a,b) => b.score - a.score);
    const top = arr.slice(0, 10);
    localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(top));
  }

  function renderHighScores() {
    const arr = loadHighScores();
    highScoreList.innerHTML = "";
    if (arr.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No records yet. Play and set a high score!";
      highScoreList.appendChild(li);
      return;
    }
    arr.forEach((e, idx) => {
      const li = document.createElement("li");
      const d = new Date(e.date);
      li.textContent = `${idx+1}. ${e.score} — ${d.toLocaleString()}`;
      highScoreList.appendChild(li);
    });
  }

  function clearHighScores() {
    localStorage.removeItem(HIGHSCORE_KEY);
    renderHighScores();
  }

  // ===== Game Over / Victory button hookups =====
  if (startGameBtn) startGameBtn.addEventListener("click", startGame);
  if (howToPlayBtn) howToPlayBtn.addEventListener("click", () => showScreen(howToScreen));
  if (highScoreBtn) highScoreBtn.addEventListener("click", () => { renderHighScores(); showScreen(scoreScreen); });
  if (exitBtn) exitBtn.addEventListener("click", () => showScreen(exitScreen));
  if (backToMenu1) backToMenu1.addEventListener("click", () => showScreen(introScreen));
  if (backToMenu2) backToMenu2.addEventListener("click", () => showScreen(introScreen));
  if (backToMenu3) backToMenu3.addEventListener("click", () => showScreen(introScreen));
  if (backToMenu4) backToMenu4.addEventListener("click", () => showScreen(introScreen));
  if (backToMenu5) backToMenu5.addEventListener("click", () => showScreen(introScreen));
  if (reopenBtn) reopenBtn.addEventListener("click", () => showScreen(introScreen));

  if (clearScoresBtn) clearScoresBtn.addEventListener("click", () => {
    if (confirm("Clear all high score records?")) clearHighScores();
  });

  if (playAgainFullBtn) playAgainFullBtn.addEventListener("click", startGame);
  if (playAgainBtn) playAgainBtn.addEventListener("click", playAgain);

  if (nextLevelBtn) nextLevelBtn.addEventListener("click", () => {
    // move to the next level (player chose Next Level)
    nextLevel();
  });

  // ===== Pause / Resume =====
  let isPaused = false;
  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      if (!isPaused) {
        isPaused = true;
        cancelAnimationFrame(animationId);
        if (pauseOverlay) pauseOverlay.classList.remove("hidden");
      } else {
        // resume
        isPaused = false;
        if (pauseOverlay) pauseOverlay.classList.add("hidden");
        animationId = requestAnimationFrame(draw);
      }
    });
  }

  if (pauseOverlay) {
    // resume & quit inside overlay are buttons inside overlay in HTML
    const resumeBtn = document.getElementById("resumeBtn");
    const quitToMenuBtn = document.getElementById("quitToMenuBtn");
    if (resumeBtn) resumeBtn.addEventListener("click", () => {
      isPaused = false;
      pauseOverlay.classList.add("hidden");
      animationId = requestAnimationFrame(draw);
    });
    if (quitToMenuBtn) quitToMenuBtn.addEventListener("click", () => {
      isPaused = false;
      pauseOverlay.classList.add("hidden");
      cancelAnimationFrame(animationId);
      showScreen(introScreen);
    });
  }

  // ===== Controls: Keyboard =====
  document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      leftPressed = true;
    } else if (e.key === " " || e.key === "Spacebar") {
      // space toggles pause
      if (pauseOverlay) {
        pauseBtn.click();
      }
    }
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      leftPressed = false;
    }
  });

  // ===== Controls: Mouse move over canvas =====
  gameCanvas.addEventListener("mousemove", (e) => {
    const rect = gameCanvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    if (relativeX > 0 && relativeX < canvasWidth) {
      paddleX = relativeX - paddleWidth / 2;
      // clamp
      if (paddleX < 0) paddleX = 0;
      if (paddleX > canvasWidth - paddleWidth) paddleX = canvasWidth - paddleWidth;
    }
  });

  // ===== Controls: Mobile touch buttons =====
  if (leftBtn) {
    leftBtn.addEventListener("touchstart", (e) => { e.preventDefault(); leftPressed = true; });
    leftBtn.addEventListener("touchend", (e) => { e.preventDefault(); leftPressed = false; });
    leftBtn.addEventListener("mousedown", () => leftPressed = true);
    leftBtn.addEventListener("mouseup", () => leftPressed = false);
    leftBtn.addEventListener("mouseleave", () => leftPressed = false);
  }
  if (rightBtn) {
    rightBtn.addEventListener("touchstart", (e) => { e.preventDefault(); rightPressed = true; });
    rightBtn.addEventListener("touchend", (e) => { e.preventDefault(); rightPressed = false; });
    rightBtn.addEventListener("mousedown", () => rightPressed = true);
    rightBtn.addEventListener("mouseup", () => rightPressed = false);
    rightBtn.addEventListener("mouseleave", () => rightPressed = false);
  }

  // ===== Responsive handling (optional) =====
  // If you want the canvas to resize to available width while maintaining internal coordinates,
  // you can add scaling. For now we keep internal coordinate system fixed (480x320).
  // If you later change canvas size, make sure to update canvasWidth/canvasHeight and re-init bricks.

  // ===== Initialize game state (but don't auto-start) =====
  function initAll() {
    // ensure constants used in HUD
    updateHUD();
    initBricks();
    renderHighScores();
    showScreen(introScreen);
  }

  initAll();

  // Expose some functions to global for debugging (optional)
  window.brickCrack = {
    startGame,
    resetGame,
    nextLevel,
    saveHighScore,
    loadHighScores
  };
});
