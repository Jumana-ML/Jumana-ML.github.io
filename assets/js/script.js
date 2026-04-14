/* ════════════════════════════════════════════════════
   JUMANA MELHEM — SOLAR SYSTEM PORTFOLIO
   script.js (FINAL - JAVASCRIPT-DRIVEN CLICK DETECTION)
   ════════════════════════════════════════════════════ */

// ── Starfield initialization ──
(function initStarfield() {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const STAR_COUNT = 260;
  let stars = [];
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      r: Math.random() * 1.4 + 0.2, baseAlpha: Math.random() * 0.5 + 0.15,
      phase: Math.random() * Math.PI * 2, speed: Math.random() * 0.004 + 0.001,
    }));
  }
  let tick = 0;
  function draw() {
    ctx.clearRect(0, 0, width, height);
    tick += 0.016;
    for (const s of stars) {
      const alpha = s.baseAlpha + Math.sin(tick * s.speed * 60 + s.phase) * 0.15;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 200, 255, ${Math.max(0, alpha)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// ── ⭐️ NEW & ROBUST Panel/Click Logic ──
(function initInteractiveSystem() {
  const solarSystem  = document.getElementById('solar-system');
  const overlay      = document.getElementById('panels-overlay');
  const closeBtn     = document.getElementById('close-btn');
  const planetContainers = document.querySelectorAll('.planet-container');

  if (!solarSystem || !overlay || !closeBtn || planetContainers.length === 0) {
    console.error("One or more essential elements are missing.");
    return;
  }

  let activePanelEl = null;

  // --- Panel Management Functions (open/close) ---
  function openPanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    solarSystem.classList.add('hidden');
    overlay.removeAttribute('aria-hidden');
    overlay.classList.add('visible');
    panel.classList.add('active');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { panel.classList.add('visible'); });
    });
    activePanelEl = panel;
    overlay.scrollTop = 0;
    closeBtn.focus();
  }

  function closePanel() {
    if (!activePanelEl) return;
    activePanelEl.classList.remove('visible');
    solarSystem.classList.remove('hidden');
    const panel = activePanelEl;
    activePanelEl = null;
    panel.addEventListener('transitionend', () => {
      panel.classList.remove('active');
    }, { once: true });
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
  }

  // --- Event Delegation and Hit Detection ---
  solarSystem.addEventListener('click', (event) => {
    // We only care about clicks on the solar system itself, not the panels
    if (solarSystem.classList.contains('hidden')) {
      return;
    }

    const clickX = event.clientX;
    const clickY = event.clientY;

    // Check if the click is within any planet's bounding box
    for (const container of planetContainers) {
      // getBoundingClientRect() gives the current position of the element on screen,
      // even while it's animating! This is the key.
      const rect = container.getBoundingClientRect();

      // Check if click coordinates are inside the element's rectangle
      if (
        clickX >= rect.left &&
        clickX <= rect.right &&
        clickY >= rect.top &&
        clickY <= rect.bottom
      ) {
        // We found a match!
        const panelId = container.dataset.panel;
        openPanel(panelId);
        
        // Stop checking other planets
        return;
      }
    }
  });


  // --- Standard Close Events ---
  closeBtn.addEventListener('click', closePanel);
  document.addEventListener('keydown', e => e.key === 'Escape' && activePanelEl && closePanel());
  overlay.addEventListener('click', e => e.target === overlay && closePanel());

})();


// ── Planet Sizing Logic (No changes) ──
(function sizePlanets() {
  const planetImages = document.querySelectorAll('.planet-image');
  planetImages.forEach(img => {
    const size = img.dataset.size || '50';
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
  });
})();

// ── Mobile layout helper (No changes) ──
(function detectMobile() {
  function check() {
    document.body.classList.toggle('is-mobile', window.innerWidth <= 700);
  }
  window.addEventListener('resize', check);
  check();
})();
