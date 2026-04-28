(() => {
  const boardEl = document.getElementById("board-2048");
  if (!boardEl) return;
  const scoreEl = document.getElementById("score");
  const statusEl = document.getElementById("status");
  const restartBtn = document.getElementById("restart");

  let board = Array.from({ length: 4 }, () => Array(4).fill(0));
  let score = 0;
  let gameOver = false;
  let won = false;

  function emptyCells() {
    const list = [];
    board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (!value) list.push({ x, y });
      });
    });
    return list;
  }

  function addRandomTile() {
    const cells = emptyCells();
    if (!cells.length) return;
    const randomCell = cells[Math.floor(Math.random() * cells.length)];
    board[randomCell.y][randomCell.x] = Math.random() < 0.9 ? 2 : 4;
  }

  function render() {
    boardEl.innerHTML = "";
    board.forEach((row) => {
      row.forEach((value) => {
        const tile = document.createElement("div");
        tile.className = `tile t${value || 0}`;
        tile.textContent = value || "";
        boardEl.appendChild(tile);
      });
    });
    scoreEl.textContent = String(score);
    if (won) statusEl.textContent = "Won";
    else if (gameOver) statusEl.textContent = "Over";
    else statusEl.textContent = "Live";
  }

  function compact(row) {
    const filtered = row.filter(Boolean);
    const merged = [];
    let gained = 0;
    for (let i = 0; i < filtered.length; i += 1) {
      if (filtered[i] === filtered[i + 1]) {
        const value = filtered[i] * 2;
        merged.push(value);
        gained += value;
        if (value === 2048) won = true;
        i += 1;
      } else {
        merged.push(filtered[i]);
      }
    }
    while (merged.length < 4) merged.push(0);
    return { row: merged, gained };
  }

  function rotateRight(matrix) {
    return matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());
  }

  function rotateLeft(matrix) {
    return matrix[0].map((_, i) => matrix.map((row) => row[row.length - 1 - i]));
  }

  function moveLeft() {
    let changed = false;
    const next = board.map((row) => {
      const { row: merged, gained } = compact(row);
      score += gained;
      if (row.join(",") !== merged.join(",")) changed = true;
      return merged;
    });
    board = next;
    return changed;
  }

  function move(direction) {
    if (gameOver || won) return;
    const prev = JSON.stringify(board);

    if (direction === "left") moveLeft();
    if (direction === "right") {
      board = board.map((row) => row.slice().reverse());
      moveLeft();
      board = board.map((row) => row.slice().reverse());
    }
    if (direction === "up") {
      board = rotateLeft(board);
      moveLeft();
      board = rotateRight(board);
    }
    if (direction === "down") {
      board = rotateRight(board);
      moveLeft();
      board = rotateLeft(board);
    }

    if (JSON.stringify(board) !== prev) addRandomTile();
    checkGameOver();
    render();
  }

  function hasMoves() {
    if (emptyCells().length) return true;
    for (let y = 0; y < 4; y += 1) {
      for (let x = 0; x < 4; x += 1) {
        const value = board[y][x];
        if (board[y][x + 1] === value || (board[y + 1] && board[y + 1][x] === value)) {
          return true;
        }
      }
    }
    return false;
  }

  function checkGameOver() {
    if (!hasMoves()) gameOver = true;
  }

  function reset() {
    board = Array.from({ length: 4 }, () => Array(4).fill(0));
    score = 0;
    gameOver = false;
    won = false;
    addRandomTile();
    addRandomTile();
    render();
  }

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
      event.preventDefault();
    }
    if (key === "arrowleft" || key === "a") move("left");
    if (key === "arrowright" || key === "d") move("right");
    if (key === "arrowup" || key === "w") move("up");
    if (key === "arrowdown" || key === "s") move("down");
  });

  restartBtn.addEventListener("click", reset);
  reset();
})();
