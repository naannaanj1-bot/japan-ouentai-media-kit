(function () {
  'use strict';

  // ===== Header scroll state =====
  const header = document.getElementById('siteHeader');
  const floatingCta = document.getElementById('floatingCta');

  const onScroll = () => {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 8);
    if (floatingCta) floatingCta.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== Mobile nav toggle =====
  const navToggle = document.getElementById('navToggle');
  const nav = document.querySelector('.global-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== Smooth scroll with header offset =====
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerH + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ===== Reveal on scroll =====
  const revealEls = [
    '.feature-card', '.kpi-card', '.audience-card', '.benefit-card',
    '.plan-card', '.fit-card', '.faq-item', '.chart-card', '.stat-card'
  ];
  const targets = document.querySelectorAll(revealEls.join(','));
  targets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            // 軽い stagger
            const delay = Math.min(i * 40, 200);
            setTimeout(() => el.classList.add('visible'), delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add('visible'));
  }

  // ===== Bar chart: animate from 0 → target height when in view =====
  const bars = document.querySelectorAll('.chart-bars .bar');
  bars.forEach((b) => {
    b.dataset.target = b.style.getPropertyValue('--h');
    b.style.setProperty('--h', '0%');
  });
  const chart = document.querySelector('.chart-bars');
  if (chart && 'IntersectionObserver' in window) {
    const chartIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            bars.forEach((b, i) => {
              setTimeout(() => {
                b.style.setProperty('--h', b.dataset.target);
              }, i * 150);
            });
            chartIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    chartIo.observe(chart);
  } else {
    bars.forEach((b) => b.style.setProperty('--h', b.dataset.target));
  }

  // ===== Donut chart: animate progress =====
  const donut = document.querySelector('.donut');
  if (donut && 'IntersectionObserver' in window) {
    const target = parseFloat(getComputedStyle(donut).getPropertyValue('--p')) || 86.3;
    donut.style.setProperty('--p', 0);
    const donutIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const start = performance.now();
            const dur = 1200;
            const tick = (now) => {
              const t = Math.min((now - start) / dur, 1);
              const eased = 1 - Math.pow(1 - t, 3);
              donut.style.setProperty('--p', (target * eased).toFixed(2));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            donutIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    donutIo.observe(donut);
  }

  // ===== Age bars: animate width =====
  const ageBars = document.querySelectorAll('.bar-mini span');
  ageBars.forEach((s) => {
    s.dataset.target = s.style.width;
    s.style.width = '0%';
  });
  const ageSection = document.querySelector('.audience-age');
  if (ageSection && 'IntersectionObserver' in window) {
    const ageIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ageBars.forEach((s, i) => {
              setTimeout(() => { s.style.width = s.dataset.target; }, i * 120);
            });
            ageIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    ageIo.observe(ageSection);
  } else {
    ageBars.forEach((s) => s.style.width = s.dataset.target);
  }

  // ===== FAQ: ensure only one open at a time (optional behaviour) =====
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  // ===== Current year (footer) =====
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
