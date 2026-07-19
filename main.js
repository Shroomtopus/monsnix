/* MONSNIX «Synapse» — interactions */
(() => {
  "use strict";
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $  = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const clamp = (v,a,b) => Math.min(b, Math.max(a, v));

  /* ---------- Scroll progress + header hide ---------- */
  const progress = $(".progress span");
  const top = $(".top");
  let lastY = 0;
  const onScrollUI = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    if (top) top.classList.toggle("hidden", scrollY > 140 && scrollY > lastY);
    lastY = scrollY;
  };
  addEventListener("scroll", onScrollUI, { passive:true }); onScrollUI();

  /* ---------- Neuron menu ---------- */
  const fab = $(".fab"), neuro = $(".neuro");
  const CONNECTIONS = [[0,1],[1,2],[2,3],[3,0],[1,3],[2,4],[3,4]];
  let linesDrawn = false;

  function drawLines(){
    if (!neuro) return;
    const svg = $("svg", neuro);
    const nodes = $$(".n-node", neuro);
    if (!svg || nodes.length < 2) return;
    $$("line", svg).forEach(l => l.remove());
    const R = neuro.getBoundingClientRect();
    const c = nodes.map(n => {
      const r = n.getBoundingClientRect();
      const d = $(".n-dot", n).getBoundingClientRect();
      return { x: d.left - R.left + d.width/2, y: d.top - R.top + d.height/2 };
    });
    CONNECTIONS.forEach(([a,b],i) => {
      if (!c[a] || !c[b]) return;
      const l = document.createElementNS("http://www.w3.org/2000/svg","line");
      l.setAttribute("x1",c[a].x); l.setAttribute("y1",c[a].y);
      l.setAttribute("x2",c[b].x); l.setAttribute("y2",c[b].y);
      l.dataset.a = a; l.dataset.b = b;
      const len = Math.hypot(c[b].x-c[a].x, c[b].y-c[a].y);
      l.style.strokeDasharray = len;
      l.style.strokeDashoffset = len;
      l.style.transition = `stroke-dashoffset .9s ${.15 + i*.08}s cubic-bezier(.22,.9,.24,1), opacity .4s, stroke-width .4s`;
      svg.appendChild(l);
      requestAnimationFrame(() => requestAnimationFrame(() => { l.style.strokeDashoffset = 0; }));
    });
    linesDrawn = true;
  }
  function resetLines(){
    if (!neuro) return;
    $$("line", $("svg", neuro) || neuro).forEach(l => l.remove());
    linesDrawn = false;
  }
  function toggleMenu(force){
    const open = force !== undefined ? force : !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", open);
    fab && fab.setAttribute("aria-expanded", open);
    if (open) setTimeout(drawLines, 60); else setTimeout(resetLines, 550);
    document.documentElement.style.overflow = open ? "hidden" : "";
  }
  fab && fab.addEventListener("click", () => toggleMenu());
  addEventListener("keydown", e => { if (e.key === "Escape") toggleMenu(false); });
  addEventListener("resize", () => { if (document.body.classList.contains("menu-open")) drawLines(); });
  // hover: light up connected lines
  $$(".n-node").forEach(node => {
    node.addEventListener("mouseenter", () => {
      const i = node.dataset.i;
      $$(".neuro line").forEach(l => l.classList.toggle("lit", l.dataset.a === i || l.dataset.b === i));
    });
    node.addEventListener("mouseleave", () => $$(".neuro line.lit").forEach(l => l.classList.remove("lit")));
    node.addEventListener("click", () => toggleMenu(false));
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold:.12, rootMargin:"0px 0px -8% 0px" });
  $$(".reveal").forEach(el => io.observe(el));

  /* ---------- Parallax media ---------- */
  const plx = $$("[data-parallax]");
  const parallax = () => plx.forEach(el => {
    const sp = parseFloat(el.dataset.parallax) || .12;
    const r = el.parentElement.getBoundingClientRect();
    const v = (r.top + r.height/2 - innerHeight/2) * sp;
    el.style.transform = `translateY(${v.toFixed(1)}px) scale(1.12)`;
  });
  if (!RM && plx.length){ addEventListener("scroll", () => requestAnimationFrame(parallax), { passive:true }); parallax(); }

  /* ---------- INTRO scrollytelling (lens) ---------- */
  const intro = $(".intro");
  if (intro && !RM){
    const lens = $(".lens", intro);
    const ticks = $(".ring-ticks", intro);
    const grad  = $(".ring-grad", intro);
    const img   = $(".lens-aperture img", intro);
    const blades= $(".lens-blades", intro);
    const read  = $(".lens-read b", intro);
    const hint  = $(".intro-hint", intro);
    const chapters = $$(".intro-chapter", intro);
    const F = ["ƒ/16","ƒ/11","ƒ/8","ƒ/5.6","ƒ/4","ƒ/2.8","ƒ/2","ƒ/1.4"];
    const windows = [[0,.2],[.24,.44],[.48,.68],[.74,1.01]];

    const tick = () => {
      const rect = intro.getBoundingClientRect();
      const total = intro.offsetHeight - innerHeight;
      const p = clamp(-rect.top / total, 0, 1);

      // entrance: tilt -> flat (first 25%)
      const e = clamp(p / .25, 0, 1);
      const settle = 1 - Math.pow(1 - e, 3);
      lens.style.transform =
        `perspective(1100px) rotateX(${(1-settle)*22}deg) scale(${.86 + settle*.14}) rotateZ(${(1-settle)*-6}deg)`;

      // rings rotate with scroll
      ticks.style.transform = `rotate(${p*300}deg)`;
      grad.style.transform  = `rotate(${-p*210}deg)`;

      // aperture opens
      const r = 9 + p * 37;                       // 9% -> 46%
      img.style.clipPath = `circle(${r}% at 50% 50%)`;
      img.style.transform = `scale(${1.45 - p*.45})`;
      blades.style.opacity = String(clamp(.85 - p*1.1, 0, .85));
      blades.style.transform = `rotate(${p*140}deg)`;

      // finale: dim photo behind title
      const dim = clamp((p - .68) / .32, 0, 1);
      img.style.filter = `brightness(${(1 - dim*.55).toFixed(2)}) saturate(${(1 - dim*.25).toFixed(2)})`;

      // f-stop readout
      if (read) read.textContent = F[clamp(Math.floor(p * F.length), 0, F.length-1)];

      // chapters
      chapters.forEach((c,i) => {
        const [a,b] = windows[i] || [2,3];
        c.classList.toggle("active", p >= a && p < b);
      });
      if (hint) hint.style.opacity = String(clamp(1 - p*6, 0, 1));
    };
    addEventListener("scroll", () => requestAnimationFrame(tick), { passive:true });
    tick();
  }

  /* ---------- Tilt cards ---------- */
  if (!RM && matchMedia("(pointer:fine)").matches){
    $$("[data-tilt]").forEach(card => {
      let raf = 0;
      card.addEventListener("pointermove", e => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left)/r.width - .5;
          const y = (e.clientY - r.top)/r.height - .5;
          card.style.transform = `perspective(900px) rotateY(${x*7}deg) rotateX(${-y*7}deg) translateY(-4px)`;
        });
      });
      card.addEventListener("pointerleave", () => {
        cancelAnimationFrame(raf);
        card.style.transition = "transform .7s cubic-bezier(.22,.9,.24,1)";
        card.style.transform = "";
        setTimeout(() => card.style.transition = "", 700);
      });
    });

    /* ---------- Magnetic buttons ---------- */
    $$(".btn, .fab").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.18}px, ${(e.clientY-r.top-r.height/2)*.22}px)`;
      });
      el.addEventListener("pointerleave", () => el.style.transform = "");
    });

    /* ---------- Cursor glow ---------- */
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    let gx=0, gy=0, tx=0, ty=0, shown=false;
    addEventListener("pointermove", e => {
      tx = e.clientX; ty = e.clientY;
      if (!shown){ glow.style.opacity = ".9"; shown = true; }
      const t = e.target.closest("a,button,.g-item,[data-tilt]");
      glow.classList.toggle("big", !!t);
    }, { passive:true });
    (function loop(){
      gx += (tx-gx)*.16; gy += (ty-gy)*.16;
      glow.style.left = gx+"px"; glow.style.top = gy+"px";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Gallery filters ---------- */
  const fbtns = $$(".filter-btn");
  if (fbtns.length){
    fbtns.forEach(b => b.addEventListener("click", () => {
      fbtns.forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      const f = b.dataset.filter;
      $$(".g-item").forEach(it => {
        const show = f === "alle" || it.dataset.cat === f;
        it.classList.toggle("hide", !show);
      });
    }));
  }

  /* ---------- Lightbox ---------- */
  const lb = $(".lightbox");
  if (lb){
    const lbImg = $("img", lb), lbCap = $(".lb-cap", lb);
    const openLb = fig => {
      lbImg.src = $("img", fig).src;
      lbCap.textContent = ($("figcaption", fig)?.textContent || "").trim();
      lb.classList.add("open");
      document.documentElement.style.overflow = "hidden";
    };
    const closeLb = () => { lb.classList.remove("open"); document.documentElement.style.overflow = ""; };
    $$(".g-item").forEach(f => f.addEventListener("click", () => openLb(f)));
    lb.addEventListener("click", e => { if (e.target === lb || e.target.closest(".lb-x")) closeLb(); });
    addEventListener("keydown", e => { if (e.key === "Escape") closeLb(); });
  }

  /* ---------- Intro deco stars ---------- */
  const stars = $(".intro-stars");
  if (stars){
    for (let i=0;i<26;i++){
      const s = document.createElement("i");
      s.style.left = Math.random()*100+"%";
      s.style.top = Math.random()*100+"%";
      s.style.animationDelay = (Math.random()*5)+"s";
      s.style.opacity = (.15+Math.random()*.5).toFixed(2);
      stars.appendChild(s);
    }
  }

  /* ---------- Neuro deco dots ---------- */
  if (neuro){
    const pos = [[12,14],[86,22],[14,80],[88,68],[48,8],[78,88]];
    pos.forEach(([x,y],i) => {
      const d = document.createElement("span");
      d.className = "n-deco";
      d.style.left = x+"%"; d.style.top = y+"%";
      d.style.animationDelay = (i*.7)+"s";
      neuro.appendChild(d);
    });
  }

  /* ---------- Year ---------- */
  $$("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
})();


/* ============ v2.1: smooth wheel scrolling ============ */
(() => {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (RM || !matchMedia("(pointer:fine)").matches) return;
  let target = scrollY, raf = null;
  const max = () => document.documentElement.scrollHeight - innerHeight;
  addEventListener("scroll", () => { if (raf === null) target = scrollY; }, { passive:true });
  addEventListener("wheel", e => {
    if (document.body.classList.contains("menu-open") || e.ctrlKey || e.defaultPrevented) return;
    e.preventDefault();
    const d = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
    target = Math.max(0, Math.min(max(), target + d));
    if (raf === null) raf = requestAnimationFrame(step);
  }, { passive:false });
  function step(){
    const cur = scrollY, next = cur + (target - cur) * .13;
    if (Math.abs(target - next) < .6){ scrollTo(0, target); raf = null; return; }
    scrollTo(0, next); raf = requestAnimationFrame(step);
  }
})();

/* ============ v2.1: curtain page transitions ============ */
(() => {
  const c = document.querySelector(".curtain");
  if (!c) return;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!RM){
    c.classList.add("cover");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      c.classList.add("anim","exit");
      setTimeout(() => c.classList.remove("cover","anim","exit"), 760);
    }));
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const h = a.getAttribute("href");
    if (!h || h.startsWith("#") || h.startsWith("mailto:") || h.startsWith("http") ||
        a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || RM) return;
    e.preventDefault();
    document.body.classList.remove("menu-open");
    document.documentElement.style.overflow = "";
    c.classList.add("anim","cover");
    setTimeout(() => location.href = h, 640);
  });
  addEventListener("pageshow", ev => { if (ev.persisted) c.classList.remove("cover","anim","exit"); });
})();

/* ============ v2.1: before/after slider ============ */
(() => {
  const ba = document.querySelector("[data-ba]");
  if (!ba) return;
  const set = x => {
    const r = ba.getBoundingClientRect();
    ba.style.setProperty("--x", Math.max(3, Math.min(97, (x - r.left) / r.width * 100)).toFixed(2) + "%");
  };
  let down = false;
  ba.addEventListener("pointerdown", e => { down = true; ba.setPointerCapture(e.pointerId); set(e.clientX); });
  ba.addEventListener("pointermove", e => down && set(e.clientX));
  addEventListener("pointerup", () => down = false);
})();
