(() => {
  const canvas = document.getElementById("tetris-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const linesEl = document.getElementById("lines");
  const restartBtn = document.getElementById("restart");

  const COLS = 10;
  const ROWS = 20;
  const SIZE = 30;
  const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
  ];
  const COLORS = ["#71ff9a", "#60f387", "#8aff9f", "#45d774", "#ff9f66", "#ffe066", "#ff4f74"];

  let board = createBoard();
  let piece = null;
  let score = 0;
  let lines = 0;
  let gameOver = false;
  let dropCounter = 0;
  let dropInterval = 700;
  let lastTime = 0;
  let animationId = null;

  function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  function randomPiece() {
    const index = Math.floor(Math.random() * SHAPES.length);
    return {
      shape: SHAPES[index],
      color: COLORS[index],
      x: Math.floor(COLS / 2) - 1,
      y: 0
    };
  }

  function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SIZE, y * SIZE, SIZE - 1, SIZE - 1);
  }

  function draw() {
    ctx.fillStyle = "#050b07";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) drawCell(x, y, value);
      });
    });

    if (piece) {
      piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) drawCell(piece.x + x, piece.y + y, piece.color);
        });
      });
    }

    if (gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.56)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#d8ffe4";
      ctx.font = "34px VT323";
      ctx.fillText("GAME OVER", 70, 300);
    }
  }

  function collides(nextShape = piece.shape, offsetX = 0, offsetY = 0) {
    return nextShape.some((row, y) =>
      row.some((value, x) => {
        if (!value) return false;
        const nx = piece.x + x + offsetX;
        const ny = piece.y + y + offsetY;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        return ny >= 0 && board[ny][nx];
      })
    );
  }

  function mergePiece() {
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value && piece.y + y >= 0) {
          board[piece.y + y][piece.x + x] = piece.color;
        }
      });
    });
  }

  function clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y -= 1) {
      if (board[y].every(Boolean)) {
        board.splice(y, 1);
        board.unshift(Array(COLS).fill(0));
        cleared += 1;
        y += 1;
      }
    }
    if (cleared > 0) {
      lines += cleared;
      score += cleared * 100;
      dropInterval = Math.max(180, dropInterval - cleared * 20);
      linesEl.textContent = String(lines);
      scoreEl.textContent = String(score);
    }
  }

  function rotate(shape) {
    return shape[0].map((_, index) => shape.map((row) => row[index]).reverse());
  }

  function drop() {
    piece.y += 1;
    if (collides()) {
      piece.y -= 1;
      mergePiece();
      clearLines();
      piece = randomPiece();
      if (collides()) {
        gameOver = true;
      }
    }
    dropCounter = 0;
  }

  function update(time = 0) {
    const delta = time - lastTime;
    lastTime = time;
    dropCounter += delta;
    if (!gameOver && dropCounter > dropInterval) drop();
    draw();
    animationId = requestAnimationFrame(update);
  }

  function reset() {
    board = createBoard();
    piece = randomPiece();
    score = 0;
    lines = 0;
    gameOver = false;
    dropCounter = 0;
    dropInterval = 700;
    scoreEl.textContent = "0";
    linesEl.textContent = "0";
  }

  window.addEventListener("keydown", (event) => {
    if (!piece || gameOver) return;
    const key = event.key;
    if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].includes(key)) {
      event.preventDefault();
    }
    if (key === "ArrowLeft" && !collides(piece.shape, -1, 0)) piece.x -= 1;
    if (key === "ArrowRight" && !collides(piece.shape, 1, 0)) piece.x += 1;
    if (key === "ArrowDown") drop();
    if (key === "ArrowUp") {
      const next = rotate(piece.shape);
      if (!collides(next, 0, 0)) piece.shape = next;
    }
  });

  restartBtn.addEventListener("click", reset);
  reset();
  if (animationId) cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(update);
})();
