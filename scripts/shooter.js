(() => {
  const canvas = document.getElementById("shooter-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const restartBtn = document.getElementById("restart");

  let player;
  let bullets;
  let enemies;
  let keys;
  let score;
  let lives;
  let spawn;
  let gameOver;

  function reset() {
    player = { x: canvas.width / 2 - 20, y: canvas.height - 40, w: 40, h: 18, speed: 7 };
    bullets = [];
    enemies = [];
    keys = { left: false, right: false };
    score = 0;
    lives = 3;
    spawn = 0;
    gameOver = false;
    scoreEl.textContent = "0";
    livesEl.textContent = "3";
  }

  function drawPlayer() {
    ctx.fillStyle = "#71ff9a";
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillRect(player.x + 14, player.y - 8, 12, 8);
  }

  function drawBullets() {
    ctx.fillStyle = "#ffe066";
    bullets.forEach((b) => ctx.fillRect(b.x, b.y, 4, 12));
  }

  function drawEnemies() {
    enemies.forEach((e) => {
      ctx.fillStyle = "#ff4f74";
      ctx.fillRect(e.x, e.y, e.w, e.h);
    });
  }

  function update() {
    if (gameOver) return;

    if (keys.left) player.x -= player.speed;
    if (keys.right) player.x += player.speed;
    player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

    bullets.forEach((b) => {
      b.y -= 9;
    });
    bullets = bullets.filter((b) => b.y > -20);

    spawn += 1;
    const spawnRate = Math.max(25, 75 - Math.floor(score / 30));
    if (spawn >= spawnRate) {
      spawn = 0;
      enemies.push({ x: Math.random() * (canvas.width - 32), y: -24, w: 32, h: 22, v: 1.8 + score * 0.005 });
    }

    enemies.forEach((e) => {
      e.y += e.v;
    });

    enemies.forEach((e) => {
      bullets.forEach((b) => {
        if (b.x < e.x + e.w && b.x + 4 > e.x && b.y < e.y + e.h && b.y + 12 > e.y) {
          e.hit = true;
          b.hit = true;
          score += 10;
          scoreEl.textContent = String(score);
        }
      });
      if (e.y + e.h >= player.y && e.x < player.x + player.w && e.x + e.w > player.x) {
        e.hit = true;
        lives -= 1;
      }
      if (e.y > canvas.height + 20) {
        e.hit = true;
        lives -= 1;
      }
    });

    bullets = bullets.filter((b) => !b.hit);
    enemies = enemies.filter((e) => !e.hit);

    lives = Math.max(0, lives);
    livesEl.textContent = String(lives);
    if (lives === 0) gameOver = true;
  }

  function draw() {
    ctx.fillStyle = "#050b07";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawEnemies();
    if (gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.58)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#d8ffe4";
      ctx.font = "42px VT323";
      ctx.fillText("GAME OVER", 315, 270);
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function fire() {
    if (gameOver) return;
    bullets.push({ x: player.x + player.w / 2 - 2, y: player.y - 10 });
  }

  window.addEventListener("keydown", (event) => {
    const key = event.key;
    if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D", " "].includes(key)) {
      event.preventDefault();
    }
    if (key === "ArrowLeft" || key.toLowerCase() === "a") keys.left = true;
    if (key === "ArrowRight" || key.toLowerCase() === "d") keys.right = true;
    if (key === " ") fire();
  });

  window.addEventListener("keyup", (event) => {
    const key = event.key;
    if (key === "ArrowLeft" || key.toLowerCase() === "a") keys.left = false;
    if (key === "ArrowRight" || key.toLowerCase() === "d") keys.right = false;
  });

  restartBtn.addEventListener("click", reset);
  reset();
  loop();
})();
