/* ════════════════════════════════════════════════════
   JUMANA MELHEM — SOLAR SYSTEM PORTFOLIO
   script.js  (v2)
   ════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────
   1. STARFIELD
   Enhanced: 3 star size tiers, colour-tinted, twinkling,
   with rare "shooting star" streaks.
   ────────────────────────────────────────────────── */
(function initStarfield() {
  const canvas = document.getElementById('stars');
  const ctx    = canvas.getContext('2d');

  const STAR_COUNT    = 320;
  const SHOOT_INTERVAL = 5000; // ms between shooting stars
  let stars = [];
  let width, height;
  let shootingStar = null;
  let lastShoot    = Date.now();

  /* Colour palette for stars — mostly white/blue-white, a few warm */
  const COLORS = [
    [200, 210, 255], // blue-white  (most common)
    [220, 220, 255], // white-blue
    [255, 245, 230], // warm white  (rare)
    [180, 200, 255], // pale violet
  ];

  function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
    spawnStars();
  }

  function spawnStars() {
    stars = Array.from({ length: STAR_COUNT }, () => {
      const colorIdx = Math.random() < 0.12 ? 2 : (Math.random() < 0.4 ? 1 : 0);
      return {
        x:         Math.random() * width,
        y:         Math.random() * height,
        r:         Math.random() * 1.3 + 0.2,        // 0.2–1.5 px
        baseAlpha: Math.random() * 0.55 + 0.18,      // 0.18–0.73
        phase:     Math.random() * Math.PI * 2,
        speed:     Math.random() * 0.006 + 0.001,    // twinkle speed
        color:     COLORS[colorIdx],
      };
    });
  }

  /* Launch a new shooting star from random top edge */
  function launchShootingStar() {
    const angle  = (Math.random() * 30 + 20) * (Math.PI / 180); // 20-50° downward
    const speed  = Math.random() * 6 + 5;
    shootingStar = {
      x:       Math.random() * width,
      y:       -20,
      vx:      Math.cos(angle) * speed,
      vy:      Math.sin(angle) * speed,
      alpha:   1,
      length:  Math.random() * 80 + 60,
      decay:   Math.random() * 0.015 + 0.012,
    };
  }

  let tick = 0;
  function draw() {
    ctx.clearRect(0, 0, width, height);
    tick += 0.016;

    /* ── Draw regular stars ── */
    for (const s of stars) {
      const alpha = s.baseAlpha + Math.sin(tick * s.speed * 60 + s.phase) * 0.18;
      const [r, g, b] = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0, alpha)})`;
      ctx.fill();
    }

    /* ── Shooting star ── */
    const now = Date.now();
    if (!shootingStar && now - lastShoot > SHOOT_INTERVAL) {
      launchShootingStar();
      lastShoot = now;
    }
    if (shootingStar) {
      const ss = shootingStar;
      ctx.save();
      const grad = ctx.createLinearGradient(
        ss.x - ss.vx * (ss.length / ss.speed),
        ss.y - ss.vy * (ss.length / ss.speed),
        ss.x, ss.y
      );
      grad.addColorStop(0, `rgba(255,255,255,0)`);
      grad.addColorStop(1, `rgba(255,255,255,${ss.alpha * 0.9})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(ss.x - ss.vx * (ss.length / (ss.speed || 1)), ss.y - ss.vy * (ss.length / (ss.speed || 1)));
      ctx.lineTo(ss.x, ss.y);
      ctx.stroke();
      ctx.restore();

      ss.x     += ss.vx;
      ss.y     += ss.vy;
      ss.alpha -= ss.decay;

      if (ss.alpha <= 0 || ss.x > width + 100 || ss.y > height + 100) {
        shootingStar = null;
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();


/* ──────────────────────────────────────────────────
   2. PANEL OPEN / CLOSE
   Targets .planet-container (matches the updated HTML).
   ────────────────────────────────────────────────── */
(function initPanels() {
  const solarSystem = document.getElementById('solar-system');
  const overlay     = document.getElementById('panels-overlay');
  const closeBtn    = document.getElementById('close-btn');
  const planets     = document.querySelectorAll('.planet-container'); // ← updated selector

  let activePanelEl = null;

  /**
   * openPanel(panelId)
   * Fades out the solar system and fades in the panel.
   */
  function openPanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    // Hide the solar system with a fade + slight scale-down
    solarSystem.classList.add('hidden');

    // Show the overlay background
    overlay.removeAttribute('aria-hidden');
    overlay.classList.add('visible');

    // Activate panel in DOM (display: flex) but keep opacity: 0 first
    panel.classList.add('active');

    // Double rAF ensures the browser paints display:flex before
    // we add 'visible', so the CSS opacity transition actually fires.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.classList.add('visible');
      });
    });

    activePanelEl = panel;
    overlay.scrollTop = 0;

    // Move focus to the back button for keyboard users
    closeBtn.focus();
  }

  /**
   * closePanel()
   * Fades the panel out and restores the solar system.
   */
  function closePanel() {
    if (!activePanelEl) return;

    // Start panel fade-out
    activePanelEl.classList.remove('visible');

    // Restore solar system
    solarSystem.classList.remove('hidden');

    // After transition ends, fully remove the panel from layout
    const panel = activePanelEl;
    activePanelEl = null;

    panel.addEventListener('transitionend', function handler() {
      panel.removeEventListener('transitionend', handler);
      panel.classList.remove('active');
    });

    // Fade out overlay background
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
  }

  // Click on a planet
  planets.forEach(planet => {
    planet.addEventListener('click', () => {
      const panelId = planet.dataset.panel;
      if (panelId) openPanel(panelId);
    });
  });

  // Back button
  closeBtn.addEventListener('click', closePanel);

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && activePanelEl) closePanel();
  });

  // Click on overlay backdrop (outside the panel)
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closePanel();
  });

})();


/* ──────────────────────────────────────────────────
   3. MOBILE DETECTION
   Adds/removes .is-mobile on <body> for optional JS hooks.
   ────────────────────────────────────────────────── */
(function detectMobile() {
  function check() {
    document.body.classList.toggle('is-mobile', window.innerWidth <= 700);
  }
  window.addEventListener('resize', check);
  check();
})();
