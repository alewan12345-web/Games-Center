(() => {
  const grid = document.getElementById("simon-grid");
  if (!grid) return;
  const roundEl = document.getElementById("round");
  const statusEl = document.getElementById("status");
  const startBtn = document.getElementById("start");
  const restartBtn = document.getElementById("restart");

  const colors = ["green", "pink", "yellow", "blue"];
  const pads = [];
  let sequence = [];
  let userIndex = 0;
  let busy = false;
  let round = 1;

  function createPads() {
    grid.innerHTML = "";
    colors.forEach((name, i) => {
      const btn = document.createElement("button");
      btn.className = `simon-pad ${name}`;
      btn.textContent = String(i + 1);
      btn.addEventListener("click", () => press(i));
      grid.appendChild(btn);
      pads.push(btn);
    });
  }

  function flash(i) {
    pads[i].classList.add("active");
    setTimeout(() => pads[i].classList.remove("active"), 300);
  }

  async function playSequence() {
    busy = true;
    statusEl.textContent = "Watch";
    for (const step of sequence) {
      flash(step);
      await new Promise((r) => setTimeout(r, 520));
    }
    busy = false;
    statusEl.textContent = "Repeat";
  }

  function nextRound() {
    userIndex = 0;
    sequence.push(Math.floor(Math.random() * 4));
    round = sequence.length;
    roundEl.textContent = String(round);
    playSequence();
  }

  function reset() {
    sequence = [];
    userIndex = 0;
    busy = false;
    round = 1;
    roundEl.textContent = "1";
    statusEl.textContent = "Press Start";
  }

  function press(i) {
    if (busy || !sequence.length) return;
    flash(i);
    if (i !== sequence[userIndex]) {
      statusEl.textContent = "Missed";
      busy = true;
      return;
    }

    userIndex += 1;
    if (userIndex === sequence.length) {
      statusEl.textContent = "Nice";
      setTimeout(nextRound, 500);
    }
  }

  startBtn.addEventListener("click", () => {
    if (busy && sequence.length) return;
    sequence = [];
    nextRound();
  });

  restartBtn.addEventListener("click", reset);
  createPads();
  reset();
})();