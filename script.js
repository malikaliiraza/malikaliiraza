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
