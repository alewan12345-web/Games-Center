(() => {
  const canvas = document.getElementById("snake-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const restartBtn = document.getElementById("restart");

  const cell = 20;
  const cells = canvas.width / cell;
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let snake = [{ x: 8, y: 8 }];
  let food = spawnFood();
  let score = 0;
  let speed = 120;
  let timer = null;
  let isGameOver = false;
  const bestKey = "pixel-party-snake-best";

  const bestScore = Number(localStorage.getItem(bestKey) || 0);
  bestEl.textContent = String(bestScore);

  function spawnFood() {
    while (true) {
      const item = {
        x: Math.floor(Math.random() * cells),
        y: Math.floor(Math.random() * cells)
      };
      const hit = snake.some((part) => part.x === item.x && part.y === item.y);
      if (!hit) return item;
    }
  }

  function setDirection(x, y) {
    if (x === -direction.x && y === -direction.y) return;
    nextDirection = { x, y };
  }

  function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#071109";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < cells; i += 1) {
      for (let j = 0; j < cells; j += 1) {
        if ((i + j) % 2 === 0) {
          ctx.fillStyle = "rgba(113,255,154,0.04)";
          ctx.fillRect(i * cell, j * cell, cell, cell);
        }
      }
    }

    ctx.fillStyle = "#71ff9a";
    snake.forEach((part, index) => {
      ctx.fillStyle = index === 0 ? "#b8ffc8" : "#49da74";
      ctx.fillRect(part.x * cell + 1, part.y * cell + 1, cell - 2, cell - 2);
    });

    ctx.fillStyle = "#ff4f74";
    ctx.fillRect(food.x * cell + 2, food.y * cell + 2, cell - 4, cell - 4);

    if (isGameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#d8ffe4";
      ctx.font = "28px VT323";
      ctx.fillText("GAME OVER", 125, 190);
      ctx.font = "20px VT323";
      ctx.fillText("Press Restart", 145, 220);
    }
  }

  function update() {
    if (isGameOver) return;

    direction = nextDirection;
    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };

    const hitWall = head.x < 0 || head.y < 0 || head.x >= cells || head.y >= cells;
    const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);
    if (hitWall || hitSelf) {
      isGameOver = true;
      drawBoard();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = String(score);
      food = spawnFood();
      if (score % 50 === 0) {
        speed = Math.max(70, speed - 8);
        startLoop();
      }
      const best = Number(localStorage.getItem(bestKey) || 0);
      if (score > best) {
        localStorage.setItem(bestKey, String(score));
        bestEl.textContent = String(score);
      }
    } else {
      snake.pop();
    }
    drawBoard();
  }

  function startLoop() {
    if (timer) clearInterval(timer);
    timer = setInterval(update, speed);
  }

  function resetGame() {
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    snake = [{ x: 8, y: 8 }];
    food = spawnFood();
    score = 0;
    speed = 120;
    isGameOver = false;
    scoreEl.textContent = "0";
    drawBoard();
    startLoop();
  }

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
      event.preventDefault();
    }
    if (key === "arrowup" || key === "w") setDirection(0, -1);
    if (key === "arrowdown" || key === "s") setDirection(0, 1);
    if (key === "arrowleft" || key === "a") setDirection(-1, 0);
    if (key === "arrowright" || key === "d") setDirection(1, 0);
  });

  restartBtn.addEventListener("click", resetGame);
  drawBoard();
  startLoop();
})();
