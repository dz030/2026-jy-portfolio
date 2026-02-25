/* ── Project card template renderer ────────────────────────────────────── *
 * Finds every [data-card] placeholder, clones the #project-card-template,  *
 * fills in the slots from data-* attributes, then swaps the placeholder.   *
 * Runs first so all later code sees real .project-card elements.            *
 * ────────────────────────────────────────────────────────────────────────── */
(function renderCards() {
  const tpl = document.getElementById('project-card-template');
  if (!tpl) return;

  document.querySelectorAll('[data-card]').forEach(placeholder => {
    const d = placeholder.dataset;
    const clone = tpl.content.cloneNode(true);
    const card  = clone.querySelector('[data-slot="link"]');

    // ── href ──────────────────────────────────────────────────────────────
    card.setAttribute('href', d.href || '#');

    // ── thumb colour class ────────────────────────────────────────────────
    const thumbInner = clone.querySelector('[data-slot="thumb-inner"]');
    if (d.thumbColor) thumbInner.classList.add(`project-card__thumb--${d.thumbColor}`);

    // ── thumbnail image (shown when data-thumb-img is provided) ───────────
    const thumbImg = clone.querySelector('[data-slot="thumb-img"]');
    if (d.thumbImg) {
      thumbImg.src = d.thumbImg;
      thumbImg.alt = d.thumbLabel || d.title || '';
      thumbImg.style.display = '';
    }

    // ── thumbnail video (shown when data-thumb-video is provided) ─────────
    const thumbVideo = clone.querySelector('[data-slot="thumb-video"]');
    if (d.thumbVideo) {
      thumbVideo.src = d.thumbVideo;
      thumbVideo.style.display = '';
    }

    // ── thumb label (fallback text, hidden when img/video fills the space) ─
    const thumbLabel = clone.querySelector('[data-slot="thumb-label"]');
    thumbLabel.textContent = d.thumbLabel || '';
    if (d.thumbImg || d.thumbVideo) thumbLabel.style.display = 'none';

    // ── badge (hidden when not provided) ──────────────────────────────────
    const badge = clone.querySelector('[data-slot="badge"]');
    if (d.badge) {
      badge.textContent = d.badge;
      if (d.badgeMod) badge.classList.add(`project-card__badge--${d.badgeMod}`);
    } else {
      badge.style.display = 'none';
    }

    // ── title ──────────────────────────────────────────────────────────────
    clone.querySelector('[data-slot="title"]').textContent = d.title || '';

    // ── subtitle / muted suffix (e.g. " (Paused)") ────────────────────────
    const subtitle = clone.querySelector('[data-slot="subtitle"]');
    if (d.subtitle) {
      subtitle.textContent = d.subtitle;
    } else {
      subtitle.style.display = 'none';
    }

    // ── description ────────────────────────────────────────────────────────
    // Use innerHTML so &amp; entities in data-desc render correctly
    const descEl = clone.querySelector('[data-slot="desc"]');
    descEl.innerHTML = d.desc || '';

    // ── swap placeholder → rendered card ──────────────────────────────────
    placeholder.replaceWith(clone);
  });
})();

/* ── Project prev/next nav (data sourced from index.html project cards) ── */
const navTarget = document.getElementById('project-nav');

if (navTarget) {
  fetch('/')
    .then(r => r.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // Read every project card from index.html in DOM order.
      // Supports both rendered .project-card elements (legacy) and
      // declarative [data-card] placeholders (current template system).
      const cardEls = doc.querySelectorAll('.project-card, [data-card]');
      const projects = [...cardEls].map(el => {
        // ── declarative [data-card] placeholder ──
        if (el.hasAttribute('data-card')) {
          const d = el.dataset;
          return {
            href:     d.href      || '#',
            title:    d.title     || '',
            thumb:    d.thumbColor || 'warm',
            label:    d.thumbLabel || d.title || '',
            thumbImg: d.thumbImg  || '',       // image src — used in nav button, never video
          };
        }
        // ── legacy rendered .project-card ──
        const href  = el.getAttribute('href');
        const title = el.querySelector('.project-card__title')?.textContent.trim() ?? '';
        const thumbInner = el.querySelector('[class*="project-card__thumb--"]');
        const thumbClass = thumbInner
          ? [...thumbInner.classList].find(c => c.startsWith('project-card__thumb--'))
          : '';
        const thumb = thumbClass ? thumbClass.replace('project-card__thumb--', '') : 'warm';
        const label = el.querySelector('.project-card__thumb-label')?.textContent.trim() ?? title;
        return { href, title, thumb, label };
      }).filter(p => p.href && p.href !== '#');

      const currentPath = window.location.pathname.replace(/\/$/, '');
      const idx = projects.findIndex(p => p.href.replace(/\/$/, '') === currentPath);
      if (idx === -1) return; // page not in index, skip

      // Wrap-around: last project loops back to first, first loops back to last
      const prev = idx > 0                  ? projects[idx - 1]          : projects[projects.length - 1];
      const next = idx < projects.length - 1 ? projects[idx + 1]          : projects[0];

      function thumbHTML(p) {
        if (p.thumbImg) {
          return `<div class="project-nav-thumb project-nav-thumb--img">
            <img src="${p.thumbImg}" alt="${p.label}" class="project-nav-thumb__img">
          </div>`;
        }
        return `<div class="project-nav-thumb project-detail__placeholder--${p.thumb}">
          <span class="project-nav-thumb__label">${p.label}</span>
        </div>`;
      }

      function prevHTML(p) {
        return `<a href="${p.href}" class="project-detail__project-nav-prev">
          <span class="project-detail__project-nav-label">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M11 6H1M5 2L1 6l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Previous
          </span>
          ${thumbHTML(p)}
          <span class="project-detail__project-nav-title">${p.title}</span>
        </a>`;
      }

      function nextHTML(p) {
        return `<a href="${p.href}" class="project-detail__project-nav-next">
          <span class="project-detail__project-nav-label">
            Next
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          ${thumbHTML(p)}
          <span class="project-detail__project-nav-title">${p.title}</span>
        </a>`;
      }

      navTarget.innerHTML = `<nav class="project-detail__project-nav">
        ${prev ? prevHTML(prev) : '<div class="project-detail__project-nav-prev project-detail__project-nav-prev--empty"></div>'}
        ${next ? nextHTML(next) : '<div class="project-detail__project-nav-next project-detail__project-nav-next--empty"></div>'}
      </nav>`;
    })
    .catch(() => { /* silently skip nav if fetch fails */ });
}

/* ── Hero gradient: smooth mouse follow ── */
const heroEl = document.getElementById('hero');

if (heroEl) {
  let tX = 50, tY = 50, cX = 50, cY = 50;

  // 1. Mouse logic (Keep exactly as you had it)
  document.addEventListener('mousemove', e => {
    const r = heroEl.getBoundingClientRect();
    if (e.clientY < r.bottom) {
      tX = ((e.clientX - r.left) / r.width)  * 100;
      tY = ((e.clientY - r.top)  / r.height) * 100;
    }
  });

  // 2. Mobile/Scroll logic (The new addition)
  // This shifts the "target" Y based on scroll height
  window.addEventListener('scroll', () => {
    // As you scroll down, tY increases, moving the circles down
    // 0.05 is the speed; increase it for more dramatic movement
    tY = 50 + (window.scrollY * 0.05); 
    
    // Optional: Make it sway side to side slightly as you scroll
    tX = 50 + (Math.sin(window.scrollY * 0.01) * 10); 
  });

  (function tick() {
    // 1. Boost the Scroll Impact
    // Changed 0.1 to 0.4 (4x stronger movement)
    let scrollEffectY = scrollY * 0.4; 
    
    // 2. Add a horizontal drift so it doesn't just go straight down
    let scrollEffectX = Math.sin(scrollY * 0.005) * 15;

    let targetX = tX + scrollEffectX;
    let targetY = tY + scrollEffectY; 

    // 3. Keep the easing (0.06) but you can bump to 0.1 if you want it 'snappier'
    cX += (targetX - cX) * 0.06;
    cY += (targetY - cY) * 0.06;

    heroEl.style.setProperty('--mx', cX.toFixed(2) + '%');
    heroEl.style.setProperty('--my', cY.toFixed(2) + '%');
    
    requestAnimationFrame(tick);
  })();
}

/* ── Custom cursor ── */
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

if (cursorDot && cursorRing) {
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  (function cursorLoop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(cursorLoop);
  })();

  document.querySelectorAll('a, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor__ring--hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor__ring--hover'));
  });
}

/* ── Scroll reveal ── */
const revealEls = document.querySelectorAll('.reveal');

if (revealEls.length > 0) {
  const revealObs = new IntersectionObserver(entries =>
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); })
  , { threshold: 0.08 });

  revealEls.forEach(el => revealObs.observe(el));
}

/* ── Active nav link ── */
document.querySelectorAll('.nav__link').forEach(link => {
  if (link.getAttribute('href') === window.location.pathname ||
      link.getAttribute('href') === window.location.pathname.replace(/\/$/, '') + '.html') {
    link.classList.add('nav__link--active');
  }
});

/* ── Solution tabs + image init ── */
const solTabStrip = document.querySelector('.sol-tabs');

if (solTabStrip) {
  // Show real images, hide placeholders where src is set
  document.querySelectorAll('.sol-panel__img-item').forEach(item => {
    const img = item.querySelector('.sol-panel__img');
    if (img && img.getAttribute('src')) {
      img.removeAttribute('style');
      item.classList.add('has-img');
    }
  });

  const solTabs   = document.querySelectorAll('.sol-tab');
  const solPanels = document.querySelectorAll('.sol-panel');

  function activateTab(tab) {
    const target = tab.dataset.tab;
    solTabs.forEach(t   => { t.classList.remove('sol-tab--active'); t.setAttribute('aria-selected', 'false'); });
    solPanels.forEach(p => p.classList.remove('sol-panel--active'));
    tab.classList.add('sol-tab--active');
    tab.setAttribute('aria-selected', 'true');
    document.getElementById('sol-panel-' + target).classList.add('sol-panel--active');

    // Scroll strip so active tab is centered
    const stripRect = solTabStrip.getBoundingClientRect();
    const tabRect   = tab.getBoundingClientRect();
    const offset    = tabRect.left - stripRect.left - stripRect.width / 2 + tabRect.width / 2;
    solTabStrip.scrollBy({ left: offset, behavior: 'smooth' });
  }

  solTabs.forEach(tab => tab.addEventListener('click', () => activateTab(tab)));
}

/* ── Outcome counter + arrow animation ── */
function animateCounts(section) {
  section.querySelectorAll('[data-count-target]').forEach(el => {
    const target   = parseFloat(el.dataset.countTarget);
    const prefix   = el.dataset.countPrefix || '';
    const suffix   = el.dataset.countSuffix || '';
    const duration = 1400;
    const isInt    = Number.isInteger(target);
    let start      = null;

    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + (isInt ? Math.round(target * ease) : (target * ease).toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    /* Fade-in arrow at 60% of the count duration */
    const wrap      = el.closest('.project-detail__outcome-value-wrap');
    const arrowUp   = wrap && wrap.querySelector('.outcome-arrow-up');
    const arrowDown = wrap && wrap.querySelector('.outcome-arrow-down');
    if (arrowUp)   setTimeout(() => arrowUp.classList.add('outcome-arrow-up--visible'),   duration * 0.4);
    if (arrowDown) setTimeout(() => arrowDown.classList.add('outcome-arrow-down--visible'), duration * 0.4);
  });
}

document.querySelectorAll('.project-detail__outcomes').forEach(section => {
  if (!section.querySelector('[data-count-target]')) return; // skip non-counter sections

  if (section.classList.contains('in')) {
    animateCounts(section);
  } else {
    const countObs = new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) {
        animateCounts(section);
        obs.disconnect();
      }
    }, { threshold: 0.25 });
    countObs.observe(section);
  }
});

/* ── Vimeo scroll-play: play when visible, pause when not ── */
const mvpIframes = document.querySelectorAll('.project-detail__mvp-ratio iframe, .project-detail__split-img--has-video iframe');

if (mvpIframes.length > 0) {
  const vimeoScript = document.createElement('script');
  vimeoScript.src = 'https://player.vimeo.com/api/player.js';
  vimeoScript.onload = function () {
    const players = Array.from(mvpIframes).map(el => new Vimeo.Player(el));

    const mvpObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const idx = Array.from(mvpIframes).indexOf(entry.target);
        if (idx === -1) return;
        if (entry.isIntersecting) {
          players[idx].play();
        } else {
          players[idx].pause();
        }
      });
    }, { threshold: 0.4 });

    mvpIframes.forEach(el => mvpObserver.observe(el));
  };
  document.head.appendChild(vimeoScript);
}

/* ── Stagger project cards on entry ── */
const projectGrids = document.querySelectorAll('.project-grid');

if (projectGrids.length > 0) {
  const gridObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.project-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        card.style.transition = `opacity .5s ease ${i * 0.07}s, transform .5s ease ${i * 0.07}s`;
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      });
      gridObs.unobserve(entry.target);
    });
  }, { threshold: 0.05 });

  projectGrids.forEach(g => gridObs.observe(g));
}
