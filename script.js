const questionPage = document.getElementById("question-page");
const celebrationPage = document.getElementById("celebration-page");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const replayBtn = document.getElementById("replay-btn");
const fireworksCanvas = document.getElementById("fireworks");
const heartContainer = document.getElementById("heart-container");

const moveNoButton = () => {
  const cta = document.querySelector(".cta");
  const ctaRect = cta.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const maxX = ctaRect.width - btnRect.width;
  const maxY = ctaRect.height + 40;

  const randomX = Math.max(0, Math.random() * maxX);
  const randomY = Math.max(0, Math.random() * maxY);

  noBtn.classList.add("is-floating");
  noBtn.style.left = `${randomX}px`;
  noBtn.style.top = `${randomY}px`;
};

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("pointerenter", moveNoButton);
noBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  moveNoButton();
});
noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton();
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
