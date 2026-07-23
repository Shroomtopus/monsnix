/* Reisejournal v3.1 — Editorial */
(function () {
  'use strict';

  /* Tag/Nacht-Umschalter (Grundzustand setzt theme.js im <head>, vor dem Paint) */
  var root = document.documentElement;
  var btn = document.querySelector('.theme-toggle');
  var MOON = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M20.7 14.9A8.6 8.6 0 0 1 9.1 3.3a.6.6 0 0 0-.8-.75A9.3 9.3 0 1 0 21.45 15.7a.6.6 0 0 0-.75-.8z"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><circle cx="12" cy="12" r="4.4" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="12" y1="2.2" x2="12" y2="4.6"/><line x1="12" y1="19.4" x2="12" y2="21.8"/><line x1="2.2" y1="12" x2="4.6" y2="12"/><line x1="19.4" y1="12" x2="21.8" y2="12"/><line x1="5.1" y1="5.1" x2="6.8" y2="6.8"/><line x1="17.2" y1="17.2" x2="18.9" y2="18.9"/><line x1="5.1" y1="18.9" x2="6.8" y2="17.2"/><line x1="17.2" y1="6.8" x2="18.9" y2="5.1"/></g></svg>';
  function paintIcon() {
    if (btn) btn.innerHTML = root.getAttribute('data-theme') === 'dark' ? SUN : MOON;
  }
  if (btn) {
    paintIcon();
    btn.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') === 'dark';
      root.setAttribute('data-theme', dark ? 'light' : 'dark');
      try { localStorage.setItem('monsnix-theme', dark ? 'light' : 'dark'); } catch (e) {}
      paintIcon();
    });
  }

  /* Dezentes Einblenden */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* Tür zum privaten Portal (Schlüsselloch im Footer).
     PORTAL_URL wird gesetzt, sobald das Portal auf Cloudflare steht. */
  var PORTAL_URL = 'https://jarvis-dave.pages.dev';
  var door = document.querySelector('.portal-door');
  if (door) {
    if (PORTAL_URL) {
      door.setAttribute('href', PORTAL_URL);
      door.setAttribute('rel', 'noopener');
    } else {
      door.addEventListener('click', function (e) { e.preventDefault(); });
    }
  }
})();
