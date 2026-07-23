/* Läuft blockierend im <head>, damit der Nacht-Modus ohne Aufblitzen lädt. */
(function () {
  try {
    var t = localStorage.getItem('monsnix-theme');
    if (!t) t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) { document.documentElement.setAttribute('data-theme', 'light'); }
})();
