(function () {
  const body = document.body;
  if (!body) return;

  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.position = "fixed";
  layer.style.inset = "0";
  layer.style.pointerEvents = "none";
  layer.style.zIndex = "1";
  body.appendChild(layer);

  for (let i = 0; i < 26; i += 1) {
    const pixel = document.createElement("span");
    const size = 2 + Math.random() * 5;
    pixel.style.position = "absolute";
    pixel.style.width = `${size}px`;
    pixel.style.height = `${size}px`;
    pixel.style.background = "rgba(113,255,154,0.7)";
    pixel.style.left = `${Math.random() * 100}%`;
    pixel.style.top = `${Math.random() * 100}%`;
    pixel.style.boxShadow = "0 0 10px rgba(113,255,154,0.55)";
    pixel.style.animation = `twinkle ${1.8 + Math.random() * 3.2}s infinite alternate`;
    layer.appendChild(pixel);
  }

  const style = document.createElement("style");
  style.textContent = `
    @keyframes twinkle {
      from { opacity: 0.18; transform: translateY(0); }
      to { opacity: 1; transform: translateY(-5px); }
    }
  `;
  document.head.appendChild(style);
})();
