(() => {
  const canvas = document.getElementById("tap-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const timeEl = document.getElementById("time");
  const restartBtn = document.getElementById("restart");

  let score = 0;
  let time = 30;
  let targets = [];
  let running = true;
  let ticker;

  function spawnTarget() {
    const r = 16 + Math.random() * 20;
    targets.push({
      x: r + Math.random() * (canvas.width - 2 * r),
      y: r + Math.random() * (canvas.height - 2 * r),
      r,
      ttl: 110 + Math.random() * 110
    });
  }

  function reset() {
    score = 0;
    time = 30;
    targets = [];
    running = true;
    scoreEl.textContent = "0";
    timeEl.textContent = "30";
    for (let i = 0; i < 3; i += 1) spawnTarget();
    if (ticker) clearInterval(ticker);
    ticker = setInterval(() => {
      if (!running) return;
      time -= 1;
      timeEl.textContent = String(Math.max(0, time));
      if (time <= 0) {
        running = false;
        clearInterval(ticker);
      }
    }, 1000);
  }

  function update() {
    if (!running) return;
    targets.forEach((t) => { t.ttl -= 1; });
    targets = targets.filter((t) => t.ttl > 0);
    while (targets.length < 4) spawnTarget();
  }

  function draw() {
    ctx.fillStyle = "#050b07";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    targets.forEach((t) => {
      ctx.beginPath();
      ctx.fillStyle = "#ff4f74";
      ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = "#ffd7de";
      ctx.arc(t.x, t.y, t.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
    if (!running) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#d8ffe4";
      ctx.font = "42px VT323";
      ctx.fillText("TIME UP", 325, 240);
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  canvas.addEventListener("click", (event) => {
    if (!running) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    targets = targets.filter((t) => {
      const dx = x - t.x;
      const dy = y - t.y;
      const hit = dx * dx + dy * dy <= t.r * t.r;
      if (hit) {
        score += 10;
        scoreEl.textContent = String(score);
        return false;
      }
      return true;
    });
  });

  restartBtn.addEventListener("click", reset);
  reset();
  loop();
})();
