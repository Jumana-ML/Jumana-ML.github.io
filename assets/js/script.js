/* ════════════════════════════════════════════════════
   JUMANA MELHEM — SOLAR SYSTEM PORTFOLIO
   script.js (REVISED)
   ════════════════════════════════════════════════════ */

// ── Starfield initialization (No changes) ──
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

// ── Panel open/close logic (Revised planet selector) ──
(function initPanels() {
  const solarSystem  = document.getElementById('solar-system');
  const overlay      = document.getElementById('panels-overlay');
  const closeBtn     = document.getElementById('close-btn');
  // ⭐️ REVISED: We now target the container, which is the clickable element.
  const planetContainers = document.querySelectorAll('.planet-container');

  if (!solarSystem || !overlay || !closeBtn || planetContainers.length === 0) return;

  let activePanelEl = null;

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
    panel.addEventListener('transitionend', function handler() {
      panel.removeEventListener('transitionend', handler);
      panel.classList.remove('active');
    }, { once: true });
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
  }

  planetContainers.forEach(container => {
    container.addEventListener('click', () => {
      openPanel(container.dataset.panel);
    });
  });

  closeBtn.addEventListener('click', closePanel);
  document.addEventListener('keydown', e => e.key === 'Escape' && activePanelEl && closePanel());
  overlay.addEventListener('click', e => e.target === overlay && closePanel());
})();


// ── ⭐️ NEW: Planet Sizing Logic ──
// This function reads the `data-size` attribute from the HTML
// and applies it to the planet image width and height.
(function sizePlanets() {
  const planetImages = document.querySelectorAll('.planet-image');
  planetImages.forEach(img => {
    const size = img.dataset.size || '50'; // Default to 50px if not set
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
