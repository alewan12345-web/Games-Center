(() => {
  const canvas = document.getElementById("pong-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const youEl = document.getElementById("score-you");
  const botEl = document.getElementById("score-bot");
  const restartBtn = document.getElementById("restart");

  let you = 0;
  let bot = 0;
  let keys = { up: false, down: false };

  const left = { x: 20, y: 170, w: 12, h: 80, v: 0 };
  const right = { x: canvas.width - 32, y: 170, w: 12, h: 80 };
  const ball = { x: canvas.width / 2, y: canvas.height / 2, vx: 2.8, vy: 2, r: 8 };

  function resetBall(direction = 1) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = (2.2 + Math.random() * 1.1) * direction;
    ball.vy = (Math.random() * 2.2 - 1.1) || 1.1;
  }

  function draw() {
    ctx.fillStyle = "#050b07";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(113,255,154,0.35)";
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#71ff9a";
    ctx.fillRect(left.x, left.y, left.w, left.h);
    ctx.fillRect(right.x, right.y, right.w, right.h);

    ctx.beginPath();
    ctx.fillStyle = "#ff4f74";
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function collide(p) {
    return (
      ball.x + ball.r > p.x &&
      ball.x - ball.r < p.x + p.w &&
      ball.y + ball.r > p.y &&
      ball.y - ball.r < p.y + p.h
    );
  }

  function update() {
    left.v = 0;
    if (keys.up) left.v = -6;
    if (keys.down) left.v = 6;
    left.y += left.v;
    left.y = Math.max(0, Math.min(canvas.height - left.h, left.y));

    const rightCenter = right.y + right.h / 2;
    if (ball.y < rightCenter - 8) right.y -= 3.3;
    if (ball.y > rightCenter + 8) right.y += 3.3;
    right.y = Math.max(0, Math.min(canvas.height - right.h, right.y));

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y - ball.r <= 0 || ball.y + ball.r >= canvas.height) ball.vy *= -1;

    if (collide(left) && ball.vx < 0) {
      ball.vx *= -1;
      ball.vy += left.v * 0.14;
    }
    if (collide(right) && ball.vx > 0) {
      ball.vx *= -1;
      ball.vy += (ball.y - (right.y + right.h / 2)) * 0.012;
    }

    if (ball.x < -20) {
      bot += 1;
      botEl.textContent = String(bot);
      resetBall(1);
    }
    if (ball.x > canvas.width + 20) {
      you += 1;
      youEl.textContent = String(you);
      resetBall(-1);
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function reset() {
    you = 0;
    bot = 0;
    youEl.textContent = "0";
    botEl.textContent = "0";
    left.y = 170;
    right.y = 170;
    resetBall(Math.random() > 0.5 ? 1 : -1);
  }

  window.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "w", "s", "W", "S"].includes(event.key)) event.preventDefault();
    if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") keys.up = true;
    if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") keys.down = true;
  });

  window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") keys.up = false;
    if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") keys.down = false;
  });

  restartBtn.addEventListener("click", reset);
  reset();
  loop();
})();
