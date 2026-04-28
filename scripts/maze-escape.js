(() => {
  const canvas = document.getElementById("maze-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const movesEl = document.getElementById("moves");
  const statusEl = document.getElementById("status");
  const restartBtn = document.getElementById("restart");

  const cols = 12;
  const rows = 12;
  const size = canvas.width / cols;
  let maze = [];
  let player = { x: 0, y: 0 };
  let goal = { x: cols - 1, y: rows - 1 };
  let moves = 0;
  let won = false;

  function buildMaze() {
    maze = Array.from({ length: rows }, () => Array(cols).fill(1));
    const stack = [{ x: 0, y: 0 }];
    maze[0][0] = 0;

    while (stack.length) {
      const current = stack[stack.length - 1];
      const options = [
        { x: current.x + 2, y: current.y },
        { x: current.x - 2, y: current.y },
        { x: current.x, y: current.y + 2 },
        { x: current.x, y: current.y - 2 }
      ].filter((n) => n.x >= 0 && n.y >= 0 && n.x < cols && n.y < rows && maze[n.y][n.x] === 1);

      if (!options.length) {
        stack.pop();
        continue;
      }

      const next = options[Math.floor(Math.random() * options.length)];
      maze[next.y][next.x] = 0;
      maze[(current.y + next.y) / 2][(current.x + next.x) / 2] = 0;
      stack.push(next);
    }

    maze[rows - 1][cols - 1] = 0;
  }

  function draw() {
    ctx.fillStyle = "#050b07";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (maze[y][x] === 1) {
          ctx.fillStyle = "#1a2f20";
          ctx.fillRect(x * size, y * size, size, size);
        } else {
          ctx.fillStyle = "#0b1610";
          ctx.fillRect(x * size, y * size, size, size);
        }
      }
    }

    ctx.fillStyle = "#ff4f74";
    ctx.fillRect(goal.x * size + 8, goal.y * size + 8, size - 16, size - 16);

    ctx.fillStyle = "#71ff9a";
    ctx.fillRect(player.x * size + 8, player.y * size + 8, size - 16, size - 16);
  }

  function reset() {
    buildMaze();
    player = { x: 0, y: 0 };
    goal = { x: cols - 1, y: rows - 1 };
    moves = 0;
    won = false;
    movesEl.textContent = "0";
    statusEl.textContent = "Live";
    draw();
  }

  function move(dx, dy) {
    if (won) return;
    const nx = player.x + dx;
    const ny = player.y + dy;
    if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return;
    if (maze[ny][nx] === 1) return;

    player.x = nx;
    player.y = ny;
    moves += 1;
    movesEl.textContent = String(moves);

    if (player.x === goal.x && player.y === goal.y) {
      won = true;
      statusEl.textContent = "Escaped";
    }

    draw();
  }

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
      event.preventDefault();
    }
    if (key === "arrowup" || key === "w") move(0, -1);
    if (key === "arrowdown" || key === "s") move(0, 1);
    if (key === "arrowleft" || key === "a") move(-1, 0);
    if (key === "arrowright" || key === "d") move(1, 0);
  });

  restartBtn.addEventListener("click", reset);
  reset();
})();