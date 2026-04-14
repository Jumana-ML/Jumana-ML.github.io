/* ════════════════════════════════════════════════════
   JUMANA MELHEM — SOLAR SYSTEM PORTFOLIO
   script.js
   ════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────
   1.  STARFIELD — drawn on <canvas id="stars">
   Generates random stars of varying sizes/opacities,
   with a slow subtle twinkling via requestAnimationFrame.
   ────────────────────────────────────────────────── */
(function initStarfield() {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');

  // A star object: x, y, radius, base opacity, twinkle phase offset
  const STAR_COUNT = 260;
  let stars = [];
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    // Re-scatter stars so they always cover the full viewport
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.2,           // radius 0.2–1.6
      baseAlpha: Math.random() * 0.5 + 0.15,  // 0.15–0.65
      phase: Math.random() * Math.PI * 2,      // twinkle phase
      speed: Math.random() * 0.004 + 0.001,    // twinkle speed
    }));
  }

  let tick = 0;
  function draw() {
    ctx.clearRect(0, 0, width, height);
    tick += 0.016; // ~60fps increment

    for (const s of stars) {
      // Sinusoidal opacity twinkle
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


/* ──────────────────────────────────────────────────
   2.  PANEL OPEN / CLOSE LOGIC
   - Click a planet → hide solar system, show its panel.
   - Click #close-btn → hide panel, restore solar system.
   ────────────────────────────────────────────────── */
(function initPanels() {
  const solarSystem  = document.getElementById('solar-system');
  const overlay      = document.getElementById('panels-overlay');
  const closeBtn     = document.getElementById('close-btn');
  const allPanels    = document.querySelectorAll('.content-panel');
  const planets      = document.querySelectorAll('.planet');

  // Track which panel is currently open so we can clean up
  let activePanelEl = null;

  /**
   * openPanel(panelId)
   * Fades out the solar system and fades in the requested panel.
   */
  function openPanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    // 1. Hide solar system (CSS transition handles the fade + scale)
    solarSystem.classList.add('hidden');

    // 2. Show the overlay container
    overlay.removeAttribute('aria-hidden');
    overlay.classList.add('visible');

    // 3. Make the panel part of the layout (display:flex)
    //    but keep it invisible (opacity:0) for the incoming animation
    panel.classList.add('active');

    // 4. A very short rAF delay lets the browser paint display:flex
    //    before we add 'visible' so the CSS transition fires correctly.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.classList.add('visible');
      });
    });

    activePanelEl = panel;

    // Scroll the overlay to the top in case user scrolled inside before
    overlay.scrollTop = 0;

    // Move focus to the close button for keyboard accessibility
    closeBtn.focus();
  }

  /**
   * closePanel()
   * Fades out the current panel and restores the solar system.
   */
  function closePanel() {
    if (!activePanelEl) return;

    // 1. Start fading the panel out
    activePanelEl.classList.remove('visible');

    // 2. Restore the solar system (fade + scale in)
    solarSystem.classList.remove('hidden');

    // 3. After the panel's CSS transition finishes, fully hide it
    const panel = activePanelEl;
    activePanelEl = null;

    panel.addEventListener('transitionend', function handler() {
      panel.removeEventListener('transitionend', handler);
      panel.classList.remove('active');
    });

    // 4. Fade out the overlay
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
  }

  // ── Event: click any planet ──
  planets.forEach(planet => {
    planet.addEventListener('click', () => {
      const panelId = planet.dataset.panel;
      openPanel(panelId);
    });
  });

  // ── Event: close button ──
  closeBtn.addEventListener('click', closePanel);

  // ── Event: Escape key closes the panel ──
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && activePanelEl) {
      closePanel();
    }
  });

  // ── Event: click overlay background (outside panel) to close ──
  overlay.addEventListener('click', e => {
    // Only close if click landed directly on the overlay, not a child
    if (e.target === overlay) closePanel();
  });

})();


/* ──────────────────────────────────────────────────
   3.  MOBILE LAYOUT HELPER
   On mobile we disable the orbit animations in CSS,
   but we also need to ensure counter-spin is gone.
   The CSS @media already handles this, but we add a
   class to <body> so JS can also respond if needed.
   ────────────────────────────────────────────────── */
(function detectMobile() {
  function check() {
    if (window.innerWidth <= 700) {
      document.body.classList.add('is-mobile');
    } else {
      document.body.classList.remove('is-mobile');
    }
  }
  window.addEventListener('resize', check);
  check();
})();
