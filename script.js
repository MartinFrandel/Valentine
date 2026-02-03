const questionPage = document.getElementById("question-page");
const celebrationPage = document.getElementById("celebration-page");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const replayBtn = document.getElementById("replay-btn");
const fireworksCanvas = document.getElementById("fireworks");
const heartContainer = document.getElementById("heart-container");

const padding = 10;
const safetyMargin = 20;
const pointerRadiusBase = 40;
const maxAttempts = 200;

let panicLevel = 0;
let initialized = false;
let currentX = 0;
let currentY = 0;

// ---------------- HELPERS ----------------

const overlap = (a, b) =>
  !(
    a.x + a.w <= b.x ||
    a.x >= b.x + b.w ||
    a.y + a.h <= b.y ||
    a.y >= b.y + b.h
  );

const nearPointer = (px, py, rect, r) =>
  !(
    px + r < rect.x ||
    px - r > rect.x + rect.w ||
    py + r < rect.y ||
    py - r > rect.y + rect.h
  );

// ---------------- CORE ----------------

function initAbsolutePosition() {
  if (initialized) return;

  const cta = document.querySelector(".cta");
  const ctaRect = cta.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();

  // Convert current visual position into cta-relative coords
  currentX = noRect.left - ctaRect.left;
  currentY = noRect.top - ctaRect.top;

  noBtn.style.position = "absolute";
  noBtn.style.left = "0";
  noBtn.style.top = "0";
  noBtn.style.transform = `translate(${currentX}px, ${currentY}px)`;

  initialized = true;
}

function moveNoButton(event) {
  initAbsolutePosition();

  const cta = document.querySelector(".cta");
  const ctaRect = cta.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();

  const noW = noRect.width;
  const noH = noRect.height;

  const yesZone = {
    x: yesRect.left - ctaRect.left - safetyMargin,
    y: yesRect.top - ctaRect.top - safetyMargin,
    w: yesRect.width + safetyMargin * 2,
    h: yesRect.height + safetyMargin * 2,
  };

  let px = null,
    py = null;

  if (event) {
    const p = event.touches ? event.touches[0] : event;
    px = p.clientX - ctaRect.left;
    py = p.clientY - ctaRect.top;
  }

  const maxX = ctaRect.width - noW - padding * 2;
  const maxY = ctaRect.height - noH - padding * 2;

  let x, y;
  let valid = false;
  // Cap the pointer radius to prevent it from becoming too large on small screens
  const pointerRadius = Math.min(pointerRadiusBase, 120);

  for (let i = 0; i < maxAttempts; i++) {
    x = padding + Math.random() * Math.max(0, maxX);
    y = padding + Math.random() * Math.max(0, maxY);

    const area = { x, y, w: noW, h: noH };

    if (overlap(area, yesZone)) continue;
    if (px !== null && nearPointer(px, py, area, pointerRadius)) continue;

    valid = true;
    break;
  }

  if (!valid) return;

  panicLevel++;

  const duration = Math.max(0.12, 0.35 - panicLevel * 0.03);
  noBtn.style.transitionDuration = `${duration}s`;

  currentX = x;
  currentY = y;
  noBtn.style.transform = `translate(${currentX}px, ${currentY}px)`;
}

// ---------------- EVENTS ----------------

// Any attempt to interact triggers panic 😈
noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("focus", moveNoButton);
noBtn.addEventListener("touchstart", (event) => {
  event.preventDefault();
  moveNoButton(event);
}, { passive: false });
noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  moveNoButton(event);
});
noBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  moveNoButton(event);
});

yesBtn.addEventListener("click", () => {
  questionPage.classList.add("hidden");
  celebrationPage.classList.remove("hidden");
  celebrationPage.setAttribute("aria-hidden", "false");
  startCelebration();
});

replayBtn.addEventListener("click", () => {
  celebrationPage.classList.add("hidden");
  questionPage.classList.remove("hidden");
  celebrationPage.setAttribute("aria-hidden", "true");
  stopCelebration();
});

let heartInterval;
let animationFrame;

const startCelebration = () => {
  createHeart();
  heartInterval = setInterval(createHeart, 500);
  initFireworks();
};

const stopCelebration = () => {
  clearInterval(heartInterval);
  cancelAnimationFrame(animationFrame);
  heartContainer.innerHTML = "";
};

const createHeart = () => {
  const heart = document.createElement("div");
  heart.className = "heart";
  const size = Math.random() * 16 + 16;
  const left = Math.random() * 100;
  const duration = Math.random() * 3 + 4;
  const colors = ["#ff4f9a", "#ff7bb4", "#ff9ec7", "#7b45ff", "#ff8c69"];

  heart.style.width = `${size}px`;
  heart.style.height = `${size}px`;
  heart.style.left = `${left}vw`;
  heart.style.animationDuration = `${duration}s`;
  heart.style.background = colors[Math.floor(Math.random() * colors.length)];

  heartContainer.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, duration * 1000);
};

const initFireworks = () => {
  const ctx = fireworksCanvas.getContext("2d");
  const particles = [];

  const resize = () => {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
  };

  resize();
  window.addEventListener("resize", resize);

  const createBurst = () => {
    const x = Math.random() * fireworksCanvas.width;
    const y = Math.random() * fireworksCanvas.height * 0.6 + 60;
    const count = 40 + Math.floor(Math.random() * 40);
    const colors = ["#ff4f9a", "#ff9ec7", "#7b45ff", "#ffe066", "#ff8c69"];

    for (let i = 0; i < count; i += 1) {
      particles.push({
        x,
        y,
        radius: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 3 + 1,
        life: Math.random() * 60 + 60,
      });
    }
  };

  const update = () => {
    ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    particles.forEach((p, index) => {
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      p.speed *= 0.98;
      p.life -= 1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      if (p.life <= 0) {
        particles.splice(index, 1);
      }
    });

    if (Math.random() < 0.05) {
      createBurst();
    }

    animationFrame = requestAnimationFrame(update);
  };

  update();
};
