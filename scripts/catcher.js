(() => {
  const canvas = document.getElementById("catcher-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const restartBtn = document.getElementById("restart");

  let basket;
  let drops;
  let score;
  let lives;
  let spawn;
  let keys;
  let gameOver;

  function reset() {
    basket = { x: canvas.width / 2 - 45, y: canvas.height - 26, w: 90, h: 14, speed: 8 };
    drops = [];
    score = 0;
    lives = 3;
    spawn = 0;
    keys = { left: false, right: false };
    gameOver = false;
    scoreEl.textContent = "0";
    livesEl.textContent = "3";
  }

  function spawnDrop() {
    const good = Math.random() > 0.3;
    drops.push({
      x: 16 + Math.random() * (canvas.width - 32),
      y: -20,
      r: 10 + Math.random() * 6,
      good,
      vy: 1.8 + Math.random() * 1.4
    });
  }

  function update() {
    if (gameOver) return;
    if (keys.left) basket.x -= basket.speed;
    if (keys.right) basket.x += basket.speed;
    basket.x = Math.max(0, Math.min(canvas.width - basket.w, basket.x));

    spawn += 1;
    if (spawn > 34) {
      spawn = 0;
      spawnDrop();
    }

    drops.forEach((d) => { d.y += d.vy; });

    drops.forEach((d) => {
      const caught = d.y + d.r >= basket.y && d.x >= basket.x && d.x <= basket.x + basket.w;
      if (caught) {
        d.hit = true;
        if (d.good) score += 5;
        else lives -= 1;
      }
      if (d.y - d.r > canvas.height) {
        d.hit = true;
        if (d.good) lives -= 1;
      }
    });

    drops = drops.filter((d) => !d.hit);
    scoreEl.textContent = String(score);
    livesEl.textContent = String(Math.max(0, lives));
    if (lives <= 0) gameOver = true;
  }

  function draw() {
    ctx.fillStyle = "#050b07";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#71ff9a";
    ctx.fillRect(basket.x, basket.y, basket.w, basket.h);

    drops.forEach((d) => {
      ctx.beginPath();
      ctx.fillStyle = d.good ? "#60f387" : "#ff4f74";
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#d8ffe4";
      ctx.font = "42px VT323";
      ctx.fillText("GAME OVER", 290, 260);
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(event.key)) event.preventDefault();
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keys.left = true;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keys.right = true;
  });

  window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keys.left = false;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keys.right = false;
  });

  restartBtn.addEventListener("click", reset);
  reset();
  loop();
})();
