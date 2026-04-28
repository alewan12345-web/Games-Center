(() => {
  const canvas = document.getElementById("breakout-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const leftEl = document.getElementById("left");
  const restartBtn = document.getElementById("restart");

  const paddle = { x: 350, y: 485, w: 110, h: 14, v: 0 };
  const ball = { x: 400, y: 300, vx: 2.9, vy: -2.9, r: 8 };
  let bricks = [];
  let score = 0;
  let gameOver = false;
  let won = false;

  function makeBricks() {
    bricks = [];
    const rows = 6;
    const cols = 10;
    const bw = 70;
    const bh = 20;
    const gap = 6;
    const startX = 24;
    const startY = 42;
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        bricks.push({
          x: startX + x * (bw + gap),
          y: startY + y * (bh + gap),
          w: bw,
          h: bh,
          alive: true,
          color: y % 2 ? "#60f387" : "#71ff9a"
        });
      }
    }
    leftEl.textContent = String(rows * cols);
  }

  function draw() {
    ctx.fillStyle = "#050b07";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    bricks.forEach((b) => {
      if (!b.alive) return;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    ctx.fillStyle = "#b8ffc8";
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

    ctx.beginPath();
    ctx.fillStyle = "#ff4f74";
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();

    if (gameOver || won) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#d8ffe4";
      ctx.font = "42px VT323";
      ctx.fillText(won ? "YOU WIN" : "GAME OVER", 305, 255);
    }
  }

  function update() {
    if (gameOver || won) return;

    paddle.x += paddle.v;
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, paddle.x));

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x - ball.r <= 0 || ball.x + ball.r >= canvas.width) ball.vx *= -1;
    if (ball.y - ball.r <= 0) ball.vy *= -1;

    if (
      ball.y + ball.r >= paddle.y &&
      ball.y - ball.r <= paddle.y + paddle.h &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.w &&
      ball.vy > 0
    ) {
      const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      ball.vx = hit * 4.2;
      ball.vy = -Math.abs(ball.vy);
    }

    bricks.forEach((b) => {
      if (!b.alive) return;
      if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w && ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
        b.alive = false;
        ball.vy *= -1;
        score += 10;
        scoreEl.textContent = String(score);
      }
    });

    const left = bricks.filter((b) => b.alive).length;
    leftEl.textContent = String(left);
    if (left === 0) won = true;

    if (ball.y - ball.r > canvas.height) gameOver = true;
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function reset() {
    paddle.x = 350;
    paddle.v = 0;
    ball.x = 400;
    ball.y = 300;
    ball.vx = 2.9;
    ball.vy = -2.9;
    score = 0;
    scoreEl.textContent = "0";
    gameOver = false;
    won = false;
    makeBricks();
  }

  window.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(event.key)) event.preventDefault();
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") paddle.v = -8;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") paddle.v = 8;
  });

  window.addEventListener("keyup", (event) => {
    if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(event.key)) paddle.v = 0;
  });

  restartBtn.addEventListener("click", reset);
  reset();
  loop();
})();
