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
  '.section, .spec-card, .skill-card, .timeline__item'
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

// Page transitions between home and project detail pages
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

// Fade/slide out before navigating from View Detail / Back to Home links
document.querySelectorAll('a[data-transition]').forEach(link => {
  link.addEventListener('click', (event) => {
    const url = link.getAttribute('href');
    if (!url || url.startsWith('#')) return;
    event.preventDefault();
    goTo(url);
  });
});

// Make whole project cards clickable (real links inside still work normally)
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
