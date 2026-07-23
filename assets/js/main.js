/* MONSNIX v3.0 — Editorial */
(function () {
  'use strict';

  /* Tag/Nacht-Umschalter (Grundzustand setzt theme.js im <head>, vor dem Paint) */
  var root = document.documentElement;
  var btn = document.querySelector('.theme-toggle');
  function paintIcon() {
    if (btn) btn.textContent = root.getAttribute('data-theme') === 'dark' ? '☀' : '☾';
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

  /* Portal-Tür: Klick auf die Jahreszahl im Footer.
     PORTAL_URL wird gesetzt, sobald das private Portal (Cloudflare) steht. */
  var PORTAL_URL = '';
  var yr = document.getElementById('yr');
  if (yr && PORTAL_URL) {
    yr.addEventListener('click', function () { window.location.href = PORTAL_URL; });
  }
})();
