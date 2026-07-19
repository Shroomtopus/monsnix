/* Dave Frehner — Fotografie & Reisen · V2 Dynamik */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Scroll-Fortschrittsbalken ----------
const progressBar = document.querySelector('.scroll-progress span');

// ---------- Header + Floating Hamburger ----------
const header = document.querySelector('.site-header');
const fab = document.querySelector('.fab-nav');
let lastY = window.scrollY;

function onScroll() {
  const y = window.scrollY;

  header.classList.toggle('scrolled', y > 40);
  // Topnav ausblenden, sobald man in die Seite eintaucht
  header.classList.toggle('hidden', y > 220);
  // 3-Balken-Button oben rechts einblenden
  if (fab) fab.classList.toggle('show', y > 220 || window.innerWidth <= 820);

  if (progressBar) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }

  // Parallax
  if (!reduceMotion) {
    document.querySelectorAll('.parallax-media').forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        const shift = (r.top + r.height / 2 - window.innerHeight / 2) * -0.12;
        el.style.transform = `translateY(${shift.toFixed(1)}px) scale(1.15)`;
      }
    });
  }

  lastY = y;
}
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });

// ---------- Fullscreen-Overlay-Menü ----------
const mega = document.querySelector('.mega-menu');
if (fab && mega) {
  const setOpen = (open) => {
    mega.classList.toggle('open', open);
    fab.classList.toggle('open', open);
    fab.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  fab.addEventListener('click', () => setOpen(!mega.classList.contains('open')));
  mega.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mega.classList.contains('open')) setOpen(false);
  });
}

// ---------- Scroll-Reveal ----------
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---------- Zähler (Statistiken) ----------
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    counterObserver.unobserve(e.target);
    const el = e.target;
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    if (reduceMotion) { el.textContent = target + suffix; }
    else requestAnimationFrame(step);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ---------- 3D-Tilt auf Karten ----------
if (!reduceMotion && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
      card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ---------- Galerie-Filter ----------
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.filter;
  galleryItems.forEach(item => {
    item.classList.toggle('hidden', f !== 'alle' && item.dataset.cat !== f);
  });
}));

// ---------- Lightbox ----------
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const lbImg = lightbox.querySelector('img');
  const lbCap = lightbox.querySelector('.lightbox-caption');
  let current = 0;
  const visibleItems = () => [...galleryItems].filter(i => !i.classList.contains('hidden'));

  const show = (i) => {
    const items = visibleItems();
    current = (i + items.length) % items.length;
    const item = items[current];
    const img = item.querySelector('img');
    lbImg.src = img.dataset.full || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = item.querySelector('.caption')?.textContent || '';
  };

  galleryItems.forEach(item => item.addEventListener('click', () => {
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    show(visibleItems().indexOf(item));
  }));

  const close = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };
  lightbox.querySelector('.lightbox-close').addEventListener('click', close);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', e => { e.stopPropagation(); show(current - 1); });
  lightbox.querySelector('.lightbox-next').addEventListener('click', e => { e.stopPropagation(); show(current + 1); });
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}
