(() => {
  const canvas = document.getElementById("dodger-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const restartBtn = document.getElementById("restart");

  const bestKey = "pixel-party-dodger-best";
  let player;
  let meteors;
  let score;
  let gameOver;
  let speed;
  let spawnTimer;
  let lastTime;
  let animation;

  function reset() {
    player = {
      x: canvas.width / 2 - 20,
      y: canvas.height - 40,
      w: 40,
      h: 18,
      vx: 0
    };
    meteors = [];
    score = 0;
    gameOver = false;
    speed = 1.2;
    spawnTimer = 0;
    lastTime = 0;
    scoreEl.textContent = "0";
  }

  function spawnMeteor() {
    const radius = 10 + Math.random() * 18;
    meteors.push({
      x: radius + Math.random() * (canvas.width - radius * 2),
      y: -radius,
      r: radius,
      vy: speed + Math.random() * 1.1
    });
  }

  function drawBackground() {
    ctx.fillStyle = "#040b06";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 45; i += 1) {
      const x = (i * 73) % canvas.width;
      const y = (i * 131 + Math.floor(score)) % canvas.height;
      ctx.fillStyle = "rgba(113,255,154,0.22)";
      ctx.fillRect(x, y, 2, 2);
    }
  }

  function drawPlayer() {
    ctx.fillStyle = "#71ff9a";
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = "#baffca";
    ctx.fillRect(player.x + 9, player.y - 6, 22, 6);
  }

  function drawMeteors() {
    meteors.forEach((m) => {
      ctx.beginPath();
      ctx.fillStyle = "#ff4f74";
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = "#ffd7de";
      ctx.arc(m.x - m.r * 0.25, m.y - m.r * 0.3, m.r * 0.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function intersects(m) {
    const closestX = Math.max(player.x, Math.min(m.x, player.x + player.w));
    const closestY = Math.max(player.y, Math.min(m.y, player.y + player.h));
    const dx = m.x - closestX;
    const dy = m.y - closestY;
    return dx * dx + dy * dy < m.r * m.r;
  }

  function update(delta) {
    if (gameOver) return;

    player.x += player.vx * delta * 0.55;
    player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

    spawnTimer += delta;
    if (spawnTimer > Math.max(300, 860 - score * 1.8)) {
      spawnMeteor();
      spawnTimer = 0;
    }

    meteors.forEach((m) => {
      m.y += m.vy * delta * 0.042;
    });

    meteors = meteors.filter((m) => m.y - m.r < canvas.height + 40);

    if (meteors.some(intersects)) {
      gameOver = true;
      const best = Number(localStorage.getItem(bestKey) || 0);
      if (score > best) {
        localStorage.setItem(bestKey, String(Math.floor(score)));
        bestEl.textContent = String(Math.floor(score));
      }
    }

    score += delta * 0.013;
    speed = Math.min(3.4, 1.2 + score * 0.01);
    scoreEl.textContent = String(Math.floor(score));
  }

  function drawGameOver() {
    if (!gameOver) return;
    ctx.fillStyle = "rgba(0, 0, 0, 0.56)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#d8ffe4";
    ctx.font = "34px VT323";
    ctx.fillText("GAME OVER", 135, 250);
    ctx.font = "22px VT323";
    ctx.fillText("Press Restart", 152, 284);
  }

  function frame(timestamp = 0) {
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    update(delta || 0);
    drawBackground();
    drawMeteors();
    drawPlayer();
    drawGameOver();

    animation = requestAnimationFrame(frame);
  }

  function setDirection(key, down) {
    if (key === "ArrowLeft" || key.toLowerCase() === "a") {
      player.vx = down ? -1 : player.vx === -1 ? 0 : player.vx;
    }
    if (key === "ArrowRight" || key.toLowerCase() === "d") {
      player.vx = down ? 1 : player.vx === 1 ? 0 : player.vx;
    }
  }

  window.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(event.key)) {
      event.preventDefault();
    }
    setDirection(event.key, true);
  });

  window.addEventListener("keyup", (event) => {
    setDirection(event.key, false);
  });

  restartBtn.addEventListener("click", () => {
    reset();
  });

  const best = Number(localStorage.getItem(bestKey) || 0);
  bestEl.textContent = String(best);
  reset();
  if (animation) cancelAnimationFrame(animation);
  animation = requestAnimationFrame(frame);
})();
