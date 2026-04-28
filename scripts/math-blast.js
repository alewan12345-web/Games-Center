(() => {
  const equationEl = document.getElementById("equation");
  if (!equationEl) return;
  const input = document.getElementById("answer-input");
  const scoreEl = document.getElementById("score");
  const timeEl = document.getElementById("time");
  const startBtn = document.getElementById("start");
  const restartBtn = document.getElementById("restart");

  let score = 0;
  let time = 60;
  let answer = 0;
  let streak = 0;
  let running = false;
  let timer;

  function makeEquation() {
    const a = 2 + Math.floor(Math.random() * 20);
    const b = 2 + Math.floor(Math.random() * 20);
    const ops = ["+", "-", "*"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    if (op === "+") answer = a + b;
    if (op === "-") answer = a - b;
    if (op === "*") answer = a * b;
    equationEl.textContent = `${a} ${op} ${b} = ?`;
  }

  function reset() {
    score = 0;
    time = 60;
    streak = 0;
    running = false;
    scoreEl.textContent = "0";
    timeEl.textContent = "60";
    equationEl.textContent = "Press Start";
    input.value = "";
    clearInterval(timer);
  }

  function start() {
    reset();
    running = true;
    makeEquation();
    input.focus();
    timer = setInterval(() => {
      time -= 1;
      timeEl.textContent = String(time);
      if (time <= 0) {
        running = false;
        clearInterval(timer);
        equationEl.textContent = "Time Up";
      }
    }, 1000);
  }

  function submit() {
    if (!running) return;
    const value = Number(input.value);
    if (Number.isNaN(value)) return;

    if (value === answer) {
      streak += 1;
      score += 8 + Math.min(12, streak);
    } else {
      streak = 0;
      score = Math.max(0, score - 4);
    }
    scoreEl.textContent = String(score);
    input.value = "";
    makeEquation();
  }

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  });

  startBtn.addEventListener("click", start);
  restartBtn.addEventListener("click", start);
  reset();
})();