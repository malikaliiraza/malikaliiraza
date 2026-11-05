// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Scroll-reveal for sections and cards
const revealTargets = document.querySelectorAll(
  '.section, .spec-card, .skill-card, .timeline__item, .skillnet, .cert-feature, .cta-band, .teaser-head, .cat-card, .proj-mini'
);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  revealTargets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => observer.observe(el));
}

// Page transitions between pages (fade/slide, ~300ms)
function goTo(url) {
  if (prefersReducedMotion || document.body.classList.contains('page-leave')) {
    window.location.href = url;
    return;
  }
  document.body.classList.add('page-leave');
  window.setTimeout(() => {
    window.location.href = url;
  }, 300);
}

// Fade/slide out before navigating: explicit data-transition links
// plus the shared site nav (every internal page link).
document.querySelectorAll('a[data-transition], .nav__links a, .nav__home').forEach(link => {
  link.addEventListener('click', (event) => {
    const url = link.getAttribute('href');
    // Leave in-page anchors and external/special links (http, mailto, ...) alone.
    if (!url || url.startsWith('#') || /^[a-zA-Z][\w+.-]*:/.test(url)) return;
    event.preventDefault();
    goTo(url);
  });
});

// Make whole project/certificate cards clickable (real links inside still work normally)
document.querySelectorAll('.spec-card[data-detail]').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    goTo(card.getAttribute('data-detail'));
  });
});

// Fade/slide in on page load
if (!prefersReducedMotion) {
  document.body.classList.add('page-enter');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove('page-enter');
    });
  });
}

// Fade-out classes must never survive a back/forward restore: the browser
// can restore a faded-out page from its back-forward cache, which would
// leave it invisible (blank). Always clear them when the page is shown.
window.addEventListener('pageshow', () => {
  document.body.classList.remove('page-leave', 'page-enter');
});

// History-aware Back buttons: return to the exact previous screen when it
// is a usable same-origin page, otherwise navigate straight to the
// fallback (never a blank page). A safety timer covers the case where
// history.back() does not actually navigate.
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const fallback = btn.getAttribute('data-fallback') || 'projects.html';
    let wentBack = false;
    const markHidden = () => { wentBack = true; };
    try {
      const ref = document.referrer;
      const sameOrigin = ref && new URL(ref, window.location.href).origin === window.location.origin;
      if (sameOrigin && window.history.length > 1) {
        window.addEventListener('pagehide', markHidden, { once: true });
        window.history.back();
        window.setTimeout(() => {
          window.removeEventListener('pagehide', markHidden);
          if (!wentBack) window.location.href = fallback;
        }, 800);
        return;
      }
    } catch (err) { /* fall through to the fallback */ }
    window.location.href = fallback;
  });
});

// Interactive home door: the handle (or the door) swings the door open in
// 3D to reveal warm light and the menu; menu options reveal compact
// previews inside the same doorway. Keyboard-accessible, and with
// prefers-reduced-motion the door opens instantly (no swing).
(function () {
  var door = document.querySelector('[data-door]');
  if (!door) return;
  var leaf = door.querySelector('[data-door-leaf]');
  var handle = door.querySelector('[data-door-handle]');
  var interior = door.querySelector('[data-door-interior]');
  var views = Array.prototype.slice.call(door.querySelectorAll('[data-door-view]'));

  function showView(name) {
    views.forEach(function (view) {
      view.hidden = view.getAttribute('data-door-view') !== name;
    });
  }

  function openDoor() {
    if (door.getAttribute('data-open') === 'true') return;
    door.setAttribute('data-open', 'true');
    showView('menu');
    if (interior) {
      interior.removeAttribute('inert');
      interior.removeAttribute('aria-hidden');
    }
    var first = door.querySelector('[data-door-view="menu"] .door__menu-btn');
    if (first) first.focus({ preventScroll: true });
  }

  function closeDoor() {
    door.setAttribute('data-open', 'false');
    showView('menu');
    if (interior) {
      interior.setAttribute('inert', '');
      interior.setAttribute('aria-hidden', 'true');
    }
    if (handle) handle.focus({ preventScroll: true });
  }

  if (handle) handle.addEventListener('click', function (event) {
    event.stopPropagation();
        if (door.getAttribute('data-open') === 'true') closeDoor(); else openDoor();
  });

  if (leaf) leaf.addEventListener('click', function () {
    if (door.getAttribute('data-open') === 'true') closeDoor(); else openDoor();
  });

  door.addEventListener('click', function (event) {
    var previewBtn = event.target.closest('[data-door-preview]');
    if (previewBtn) {
      showView(previewBtn.getAttribute('data-door-preview'));
      return;
    }
    var backBtn = event.target.closest('[data-door-back]');
    if (backBtn) {
      showView('menu');
      return;
    }
    var closeBtn = event.target.closest('[data-door-close]');
    if (closeBtn) closeDoor();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && door.getAttribute('data-open') === 'true') closeDoor();
  });
})();
