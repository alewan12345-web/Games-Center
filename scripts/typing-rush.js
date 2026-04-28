(() => {
  const wordEl = document.getElementById("target-word");
  if (!wordEl) return;
  const input = document.getElementById("typing-input");
  const scoreEl = document.getElementById("score");
  const timeEl = document.getElementById("time");
  const startBtn = document.getElementById("start");
  const restartBtn = document.getElementById("restart");

  const words = ["pixel", "party", "arcade", "combo", "level", "spawn", "reactor", "wizard", "neon", "turbo", "boss", "glitch"];
  let score = 0;
  let time = 45;
  let current = "";
  let running = false;
  let timer;

  function nextWord() {
    current = words[Math.floor(Math.random() * words.length)];
    wordEl.textContent = current;
  }

  function reset() {
    score = 0;
    time = 45;
    running = false;
    scoreEl.textContent = "0";
    timeEl.textContent = "45";
    wordEl.textContent = "Press Start";
    input.value = "";
    clearInterval(timer);
  }

  function start() {
    reset();
    running = true;
    nextWord();
    input.focus();
    timer = setInterval(() => {
      time -= 1;
      timeEl.textContent = String(time);
      if (time <= 0) {
        running = false;
        clearInterval(timer);
        wordEl.textContent = "Time Up";
      }
    }, 1000);
  }

  input.addEventListener("input", () => {
    if (!running) return;
    if (input.value.trim().toLowerCase() === current) {
      score += 10;
      scoreEl.textContent = String(score);
      input.value = "";
      nextWord();
    }
  });

  startBtn.addEventListener("click", start);
  restartBtn.addEventListener("click", start);
  reset();
})();