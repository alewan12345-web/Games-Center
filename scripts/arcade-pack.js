(() => {
  const root = document.getElementById("arcade-root");
  if (!root) return;

  const mode = root.dataset.mode || "tap";
  const title = root.dataset.title || "Arcade Game";
  const difficulty = root.dataset.difficulty || "normal";

  const scoreEl = document.getElementById("score");
  const timeEl = document.getElementById("time");
  const statusEl = document.getElementById("status");
  const startBtn = document.getElementById("start");
  const restartBtn = document.getElementById("restart");
  const canvas = document.getElementById("arcade-canvas");
  const panel = document.getElementById("arcade-panel");

  const state = {
    running: false,
    score: 0,
    time: 45,
    timer: null,
    animation: null
  };

  let cleanup = () => {};

  function setHud(score, time, status) {
    if (scoreEl) scoreEl.textContent = String(score);
    if (timeEl) timeEl.textContent = String(time);
    if (statusEl) statusEl.textContent = status;
  }

  function stopAll() {
    state.running = false;
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
    if (state.animation) cancelAnimationFrame(state.animation);
    state.animation = null;
    cleanup();
    cleanup = () => {};
  }

  function startClock(totalSeconds, onFinish) {
    state.time = totalSeconds;
    if (timeEl) timeEl.textContent = String(state.time);
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(() => {
      state.time -= 1;
      if (timeEl) timeEl.textContent = String(Math.max(0, state.time));
      if (state.time <= 0) {
        clearInterval(state.timer);
        state.timer = null;
        state.running = false;
        if (statusEl) statusEl.textContent = "Time Up";
        onFinish();
      }
    }, 1000);
  }

  function mountTapGame() {
    const ctx = canvas.getContext("2d");
    const targets = [];
    canvas.hidden = false;
    panel.hidden = true;
    canvas.width = 760;
    canvas.height = 500;

    const ttlBase = difficulty === "hard" ? 85 : difficulty === "easy" ? 155 : 120;
    const maxTargets = difficulty === "hard" ? 5 : 4;

    function spawnTarget() {
      const r = 14 + Math.random() * 16;
      targets.push({
        x: r + Math.random() * (canvas.width - 2 * r),
        y: r + Math.random() * (canvas.height - 2 * r),
        r,
        ttl: ttlBase + Math.random() * ttlBase
      });
    }

    function clickHandler(event) {
      if (!state.running) return;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
      for (let i = targets.length - 1; i >= 0; i -= 1) {
        const t = targets[i];
        const dx = x - t.x;
        const dy = y - t.y;
        if (dx * dx + dy * dy <= t.r * t.r) {
          targets.splice(i, 1);
          state.score += 10;
          setHud(state.score, state.time, "Live");
          break;
        }
      }
    }

    canvas.addEventListener("click", clickHandler);

    function loop() {
      ctx.fillStyle = "#050b07";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (state.running) {
        targets.forEach((t) => {
          t.ttl -= 1;
        });
        for (let i = targets.length - 1; i >= 0; i -= 1) {
          if (targets[i].ttl <= 0) targets.splice(i, 1);
        }
        while (targets.length < maxTargets) spawnTarget();
      }
      targets.forEach((t) => {
        ctx.beginPath();
        ctx.fillStyle = "#ff4f74";
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "#ffd7de";
        ctx.arc(t.x, t.y, t.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });
      if (!state.running && state.time <= 0) {
        ctx.fillStyle = "rgba(0,0,0,0.58)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#d8ffe4";
        ctx.font = "42px VT323";
        ctx.fillText("TIME UP", 320, 250);
      }
      state.animation = requestAnimationFrame(loop);
    }
    state.animation = requestAnimationFrame(loop);

    cleanup = () => canvas.removeEventListener("click", clickHandler);
    return () => {
      state.score = 0;
      setHud(0, 45, "Live");
      startClock(45, () => {});
      state.running = true;
    };
  }

  function mountLaneGame() {
    const ctx = canvas.getContext("2d");
    canvas.hidden = false;
    panel.hidden = true;
    canvas.width = 760;
    canvas.height = 500;
    const lanes = [130, 290, 450, 610];
    const player = { lane: 1, y: 430, w: 56, h: 40 };
    const blocks = [];
    let spawn = 0;

    function keydown(event) {
      const key = event.key.toLowerCase();
      if (["arrowleft", "arrowright", "a", "d"].includes(key)) event.preventDefault();
      if (!state.running) return;
      if ((key === "arrowleft" || key === "a") && player.lane > 0) player.lane -= 1;
      if ((key === "arrowright" || key === "d") && player.lane < lanes.length - 1) player.lane += 1;
    }
    window.addEventListener("keydown", keydown);

    function loop() {
      ctx.fillStyle = "#050b07";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(113,255,154,0.18)";
      for (let i = 1; i < lanes.length; i += 1) {
        ctx.beginPath();
        ctx.moveTo((lanes[i - 1] + lanes[i]) / 2, 0);
        ctx.lineTo((lanes[i - 1] + lanes[i]) / 2, canvas.height);
        ctx.stroke();
      }

      if (state.running) {
        spawn += 1;
        const threshold = difficulty === "hard" ? 22 : difficulty === "easy" ? 40 : 30;
        if (spawn >= threshold) {
          spawn = 0;
          const lane = Math.floor(Math.random() * lanes.length);
          blocks.push({ lane, y: -42, speed: difficulty === "hard" ? 5.8 : difficulty === "easy" ? 3.5 : 4.4 });
        }
        blocks.forEach((b) => {
          b.y += b.speed;
        });
        for (let i = blocks.length - 1; i >= 0; i -= 1) {
          const b = blocks[i];
          const px = lanes[player.lane];
          if (b.lane === player.lane && b.y + 36 >= player.y && b.y <= player.y + player.h) {
            state.running = false;
            setHud(state.score, state.time, "Crashed");
          }
          if (b.y > canvas.height + 50) {
            blocks.splice(i, 1);
            state.score += 5;
            setHud(state.score, state.time, state.running ? "Live" : "Crashed");
          }
          ctx.fillStyle = "#ff4f74";
          ctx.fillRect(lanes[b.lane], b.y, 56, 36);
        }
        if (state.running) state.score += 0.03;
      }

      ctx.fillStyle = "#71ff9a";
      ctx.fillRect(lanes[player.lane], player.y, player.w, player.h);
      state.animation = requestAnimationFrame(loop);
    }
    state.animation = requestAnimationFrame(loop);

    cleanup = () => window.removeEventListener("keydown", keydown);
    return () => {
      blocks.length = 0;
      player.lane = 1;
      state.score = 0;
      setHud(0, 60, "Live");
      startClock(60, () => {});
      state.running = true;
    };
  }

  function mountCatchGame() {
    const ctx = canvas.getContext("2d");
    canvas.hidden = false;
    panel.hidden = true;
    canvas.width = 760;
    canvas.height = 500;
    const basket = { x: 330, y: 460, w: 100, h: 16 };
    const keys = { left: false, right: false };
    const drops = [];
    let misses = 0;
    let spawn = 0;

    function keyDown(event) {
      const key = event.key.toLowerCase();
      if (["arrowleft", "arrowright", "a", "d"].includes(key)) event.preventDefault();
      if (key === "arrowleft" || key === "a") keys.left = true;
      if (key === "arrowright" || key === "d") keys.right = true;
    }
    function keyUp(event) {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") keys.left = false;
      if (key === "arrowright" || key === "d") keys.right = false;
    }
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    function loop() {
      ctx.fillStyle = "#050b07";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (state.running) {
        if (keys.left) basket.x -= 7;
        if (keys.right) basket.x += 7;
        basket.x = Math.max(0, Math.min(canvas.width - basket.w, basket.x));
        spawn += 1;
        const every = difficulty === "hard" ? 22 : difficulty === "easy" ? 36 : 28;
        if (spawn >= every) {
          spawn = 0;
          const good = Math.random() > 0.25;
          drops.push({
            x: 20 + Math.random() * (canvas.width - 40),
            y: -20,
            r: 10 + Math.random() * 8,
            good,
            vy: difficulty === "hard" ? 4.8 : difficulty === "easy" ? 2.8 : 3.8
          });
        }
        drops.forEach((d) => {
          d.y += d.vy;
        });
        for (let i = drops.length - 1; i >= 0; i -= 1) {
          const d = drops[i];
          const caught = d.y + d.r >= basket.y && d.x >= basket.x && d.x <= basket.x + basket.w;
          if (caught) {
            drops.splice(i, 1);
            state.score += d.good ? 6 : -5;
            setHud(Math.max(0, Math.floor(state.score)), state.time, "Live");
            continue;
          }
          if (d.y - d.r > canvas.height) {
            drops.splice(i, 1);
            if (d.good) misses += 1;
          }
        }
        if (misses >= 5) {
          state.running = false;
          setHud(Math.max(0, Math.floor(state.score)), state.time, "Missed Too Many");
        }
      }

      ctx.fillStyle = "#71ff9a";
      ctx.fillRect(basket.x, basket.y, basket.w, basket.h);
      drops.forEach((d) => {
        ctx.beginPath();
        ctx.fillStyle = d.good ? "#60f387" : "#ff4f74";
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
      state.animation = requestAnimationFrame(loop);
    }
    state.animation = requestAnimationFrame(loop);

    cleanup = () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
    return () => {
      drops.length = 0;
      misses = 0;
      basket.x = 330;
      state.score = 0;
      setHud(0, 60, "Live");
      startClock(60, () => {});
      state.running = true;
    };
  }

  function mountTypeGame() {
    canvas.hidden = true;
    panel.hidden = false;
    panel.innerHTML = `
      <p class="target-word" id="target-word">Press Start</p>
      <input id="answer-input" class="typing-input" type="text" autocomplete="off" placeholder="Type here..." />
    `;
    const wordEl = panel.querySelector("#target-word");
    const input = panel.querySelector("#answer-input");
    const words = ["pixel", "party", "arcade", "combo", "booster", "reactor", "portal", "mission", "rush", "score"];

    function nextWord() {
      wordEl.textContent = words[Math.floor(Math.random() * words.length)];
    }

    function onInput() {
      if (!state.running) return;
      if (input.value.trim().toLowerCase() === wordEl.textContent) {
        state.score += 10;
        setHud(state.score, state.time, "Live");
        input.value = "";
        nextWord();
      }
    }
    input.addEventListener("input", onInput);
    cleanup = () => input.removeEventListener("input", onInput);

    return () => {
      state.score = 0;
      setHud(0, 50, "Live");
      nextWord();
      input.value = "";
      input.focus();
      startClock(50, () => {
        wordEl.textContent = "Time Up";
      });
      state.running = true;
    };
  }

  function mountMathGame() {
    canvas.hidden = true;
    panel.hidden = false;
    panel.innerHTML = `
      <p class="target-word" id="target-word">Press Start</p>
      <input id="answer-input" class="typing-input" type="number" autocomplete="off" placeholder="Answer..." />
    `;
    const eqEl = panel.querySelector("#target-word");
    const input = panel.querySelector("#answer-input");
    let answer = 0;

    function nextEquation() {
      const a = 2 + Math.floor(Math.random() * 20);
      const b = 2 + Math.floor(Math.random() * 20);
      const ops = ["+", "-", "*"];
      const op = ops[Math.floor(Math.random() * ops.length)];
      if (op === "+") answer = a + b;
      if (op === "-") answer = a - b;
      if (op === "*") answer = a * b;
      eqEl.textContent = `${a} ${op} ${b} = ?`;
    }

    function onKey(event) {
      if (event.key !== "Enter" || !state.running) return;
      event.preventDefault();
      const value = Number(input.value);
      if (!Number.isNaN(value) && value === answer) {
        state.score += 9;
      } else {
        state.score = Math.max(0, state.score - 4);
      }
      setHud(state.score, state.time, "Live");
      input.value = "";
      nextEquation();
    }
    input.addEventListener("keydown", onKey);
    cleanup = () => input.removeEventListener("keydown", onKey);

    return () => {
      state.score = 0;
      setHud(0, 60, "Live");
      nextEquation();
      input.value = "";
      input.focus();
      startClock(60, () => {
        eqEl.textContent = "Time Up";
      });
      state.running = true;
    };
  }

  function mountGuessGame() {
    canvas.hidden = true;
    panel.hidden = false;
    panel.innerHTML = `
      <p class="target-word" id="target-word">Guess a number from 1 to 100</p>
      <input id="answer-input" class="typing-input" type="number" autocomplete="off" placeholder="Your guess..." />
      <p class="game-note" id="hint">Press Enter to submit</p>
    `;
    const input = panel.querySelector("#answer-input");
    const hint = panel.querySelector("#hint");
    let secret = 1;
    let attempts = 0;

    function newRound() {
      secret = 1 + Math.floor(Math.random() * 100);
      attempts = 0;
      hint.textContent = "Find the secret number";
    }

    function onKey(event) {
      if (event.key !== "Enter" || !state.running) return;
      event.preventDefault();
      const guess = Number(input.value);
      if (Number.isNaN(guess)) return;
      attempts += 1;
      if (guess === secret) {
        state.score += Math.max(5, 26 - attempts * 2);
        setHud(state.score, state.time, "Solved");
        newRound();
      } else if (guess < secret) {
        hint.textContent = "Too low";
      } else {
        hint.textContent = "Too high";
      }
      input.value = "";
    }
    input.addEventListener("keydown", onKey);
    cleanup = () => input.removeEventListener("keydown", onKey);

    return () => {
      state.score = 0;
      setHud(0, 75, "Live");
      newRound();
      input.value = "";
      input.focus();
      startClock(75, () => {
        hint.textContent = `Final Score: ${state.score}`;
      });
      state.running = true;
    };
  }

  function mountSequenceGame() {
    canvas.hidden = true;
    panel.hidden = false;
    panel.innerHTML = `
      <p class="target-word" id="target-word">Press Start</p>
      <div class="simon-grid compact" id="seq-grid"></div>
    `;
    const label = panel.querySelector("#target-word");
    const grid = panel.querySelector("#seq-grid");
    const buttons = [];
    const names = ["UP", "LEFT", "RIGHT", "DOWN"];
    let sequence = [];
    let index = 0;
    let busy = false;

    names.forEach((name, i) => {
      const b = document.createElement("button");
      b.className = "simon-pad";
      b.textContent = name;
      b.addEventListener("click", () => press(i));
      grid.appendChild(b);
      buttons.push(b);
    });

    function flash(i) {
      buttons[i].classList.add("active");
      setTimeout(() => buttons[i].classList.remove("active"), 240);
    }

    async function play() {
      busy = true;
      label.textContent = "Watch";
      for (const step of sequence) {
        flash(step);
        await new Promise((r) => setTimeout(r, 430));
      }
      busy = false;
      index = 0;
      label.textContent = "Repeat";
    }

    function advance() {
      sequence.push(Math.floor(Math.random() * 4));
      play();
    }

    function press(i) {
      if (!state.running || busy || !sequence.length) return;
      flash(i);
      if (sequence[index] !== i) {
        state.running = false;
        label.textContent = "Missed";
        setHud(state.score, state.time, "Missed");
        return;
      }
      index += 1;
      if (index >= sequence.length) {
        state.score += 10;
        setHud(state.score, state.time, "Live");
        setTimeout(advance, 400);
      }
    }

    cleanup = () => {};
    return () => {
      sequence = [];
      index = 0;
      state.score = 0;
      setHud(0, 65, "Live");
      startClock(65, () => {
        label.textContent = "Time Up";
      });
      state.running = true;
      advance();
    };
  }

  function mountMemoryGame() {
    canvas.hidden = true;
    panel.hidden = false;
    panel.innerHTML = `<div id="memory-board" class="memory-board mini"></div>`;
    const board = panel.querySelector("#memory-board");
    const symbols = ["A", "B", "C", "D", "E", "F"];
    let deck = [];
    let first = null;
    let lock = false;
    let pairs = 0;

    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function render() {
      board.innerHTML = "";
      deck.forEach((card, idx) => {
        const btn = document.createElement("button");
        btn.className = "memory-card";
        if (card.flipped || card.matched) btn.classList.add("is-flipped");
        if (card.matched) btn.classList.add("is-matched");
        btn.textContent = card.flipped || card.matched ? card.value : "?";
        btn.addEventListener("click", () => flip(idx));
        board.appendChild(btn);
      });
    }

    function flip(i) {
      if (!state.running || lock) return;
      const card = deck[i];
      if (card.flipped || card.matched) return;
      card.flipped = true;
      if (first === null) {
        first = i;
        render();
        return;
      }
      if (deck[first].value === card.value) {
        deck[first].matched = true;
        card.matched = true;
        pairs += 1;
        state.score += 12;
        setHud(state.score, state.time, "Live");
        first = null;
        if (pairs === symbols.length) {
          state.running = false;
          setHud(state.score, state.time, "Cleared");
        }
        render();
        return;
      }
      lock = true;
      render();
      setTimeout(() => {
        deck[first].flipped = false;
        card.flipped = false;
        first = null;
        lock = false;
        render();
      }, 650);
    }

    cleanup = () => {};
    return () => {
      deck = shuffle([...symbols, ...symbols]).map((v) => ({ value: v, flipped: false, matched: false }));
      first = null;
      lock = false;
      pairs = 0;
      state.score = 0;
      setHud(0, 70, "Live");
      startClock(70, () => {});
      state.running = true;
      render();
    };
  }

  const creators = {
    tap: mountTapGame,
    lane: mountLaneGame,
    catch: mountCatchGame,
    type: mountTypeGame,
    math: mountMathGame,
    guess: mountGuessGame,
    sequence: mountSequenceGame,
    memory: mountMemoryGame
  };

  function bind(modeKey) {
    stopAll();
    const factory = creators[modeKey] || creators.tap;
    const startGame = factory();
    setHud(0, 0, "Ready");
    function startNow() {
      stopAll();
      const newStart = factory();
      newStart();
    }
    startBtn.onclick = startNow;
    restartBtn.onclick = startNow;
    if (statusEl) statusEl.textContent = `${title} Ready`;
  }

  bind(mode);
})();
