(() => {
  const board = document.getElementById("memory-board");
  if (!board) return;
  const movesEl = document.getElementById("moves");
  const pairsEl = document.getElementById("pairs");
  const restartBtn = document.getElementById("restart");

  const symbols = ["A", "B", "C", "D", "E", "F", "G", "H"];
  let deck = [];
  let first = null;
  let lock = false;
  let moves = 0;
  let pairs = 0;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function updateHud() {
    movesEl.textContent = String(moves);
    pairsEl.textContent = `${pairs}/8`;
  }

  function render() {
    board.innerHTML = "";
    deck.forEach((card, index) => {
      const el = document.createElement("button");
      el.className = "memory-card";
      if (card.flipped || card.matched) el.classList.add("is-flipped");
      if (card.matched) el.classList.add("is-matched");
      el.textContent = card.flipped || card.matched ? card.value : "?";
      el.addEventListener("click", () => flip(index));
      board.appendChild(el);
    });
    updateHud();
  }

  function reset() {
    deck = shuffle([...symbols, ...symbols]).map((v) => ({ value: v, flipped: false, matched: false }));
    first = null;
    lock = false;
    moves = 0;
    pairs = 0;
    render();
  }

  function flip(index) {
    if (lock) return;
    const card = deck[index];
    if (card.flipped || card.matched) return;

    card.flipped = true;
    if (first === null) {
      first = index;
      render();
      return;
    }

    moves += 1;
    const firstCard = deck[first];
    if (firstCard.value === card.value) {
      firstCard.matched = true;
      card.matched = true;
      first = null;
      pairs += 1;
      render();
      return;
    }

    lock = true;
    render();
    setTimeout(() => {
      firstCard.flipped = false;
      card.flipped = false;
      first = null;
      lock = false;
      render();
    }, 700);
  }

  restartBtn.addEventListener("click", reset);
  reset();
})();