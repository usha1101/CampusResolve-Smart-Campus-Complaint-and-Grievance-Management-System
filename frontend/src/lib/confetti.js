/**
 * Lightweight Zero-Dependency Canvas Confetti
 * Used to celebrate successful grievance resolutions and student feedback submissions.
 */
export function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const colors = ["#4f46e5", "#7c3aed", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];
  const particles = [];
  const particleCount = 75;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: width / 2,
      y: height * 0.4,
      r: Math.random() * 5 + 3,
      d: Math.random() * particleCount,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 14,
      gravity: 0.35,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }

  let animationFrame;
  let startTime = Date.now();

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const elapsed = Date.now() - startTime;

    let activeParticles = 0;
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.009;

      if (p.opacity > 0) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 1.5);
        ctx.restore();
      }
    });

    if (activeParticles > 0 && elapsed < 3500) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrame);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  animate();
}
