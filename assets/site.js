// WunderHub. JavaScript puro, sem dependências.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smooth = (p, e0, e1) => {
    const t = clamp((p - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };

  const year = $("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- texto dividido em palavras e letras ---------- */

  function rng(seed) {
    let s = seed >>> 0;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  }

  function splitText(el, seed) {
    const mode = el.dataset.split;
    const text = el.textContent.trim().replace(/\s+/g, " ");
    const r = rng(seed);
    const words = text.split(" ");
    const totalChars = text.replace(/\s/g, "").length;
    const half = Math.ceil(words.length / 2);
    const sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = text;
    const vis = document.createElement("span");
    vis.setAttribute("aria-hidden", "true");
    let ci = 0;
    words.forEach((word, wi) => {
      const w = document.createElement("span");
      w.className = "w";
      if (mode === "chars") {
        for (const ch of word) {
          const c = document.createElement("span");
          c.className = "c";
          c.textContent = ch;
          c.style.setProperty("--th", ((ci / totalChars) * 0.55 + r() * 0.06).toFixed(3));
          c.style.setProperty("--jx", `${-(16 + r() * 44).toFixed(1)}px`);
          w.append(c);
          ci++;
        }
      } else {
        w.textContent = word;
        const converge = el.closest(".band-converge");
        if (converge) {
          const dist = 40 + r() * 50;
          w.style.setProperty("--jx", `${wi < half ? -dist : dist}px`);
          w.style.setProperty("--th", (Math.abs(wi - (words.length - 1) / 2) * 0.06 + r() * 0.05).toFixed(3));
        } else {
          w.style.setProperty("--th", ((wi / words.length) * 0.5).toFixed(3));
        }
      }
      vis.append(w);
      if (wi < words.length - 1) vis.append(" ");
    });
    el.textContent = "";
    el.append(sr, vis);
  }

  $$("[data-split]").forEach((el, i) => splitText(el, 2026 + i * 97));

  /* ---------- topo: vídeo guiado pela rolagem ---------- */

  const hero = $("[data-hero]");
  const stage = $("[data-stage]");
  const video = $("[data-video]");
  const posterLayer = $("[data-poster]");
  const loader = $("[data-loader]");
  const ringFill = loader ? $(".ring-fill", loader) : null;

  const VIDEO_URL = "assets/hero-scrub.mp4";
  const VIDEO_BYTES = 6776065;
  const POSTER_URL = "assets/hero-poster.jpg";
  const ENDING_URL = "assets/hero-ending.jpg";

  const bands = $$("[data-band]").map((el, i, all) => ({
    el,
    a: Number(el.dataset.a),
    b: Number(el.dataset.b),
    ramp: el.dataset.ramp ? Number(el.dataset.ramp) : 0,
    first: i === 0,
    last: i === all.length - 1,
    op: -1,
    k: -1,
    ks: -1,
    kb: -1,
  }));

  // O começo do vídeo é lento: os primeiros 30% da rolagem cobrem 45% do filme.
  const timeOf = (p) => (p < 0.3 ? (p / 0.3) * 0.45 : 0.45 + ((p - 0.3) / 0.7) * 0.55);

  let target = 0;
  let shown = 0;
  let rafId = null;
  let lastTick = 0;
  let heroOnScreen = true;
  let scrubOn = false;
  let heroInit = false;
  let loadK = 0;
  let loadStart = 0;
  let seekBusy = false;
  let pendingTime = null;

  function heroProgress() {
    const range = hero.offsetHeight - innerHeight;
    if (range <= 0) return 0;
    return clamp(-hero.getBoundingClientRect().top / range, 0, 1);
  }

  function requestSeek(t) {
    if (!video.duration) return;
    if (seekBusy) {
      pendingTime = t;
      return;
    }
    seekBusy = true;
    video.currentTime = t;
  }

  video.addEventListener("seeked", () => {
    seekBusy = false;
    if (pendingTime !== null) {
      const t = pendingTime;
      pendingTime = null;
      requestSeek(t);
    }
  });

  video.addEventListener("error", () => {
    seekBusy = false;
    pendingTime = null;
    failVideo();
  });

  function setBandStyle(b, prop, val, cacheKey, eps) {
    if (Math.abs(b[cacheKey] - val) < eps) return;
    b[cacheKey] = val;
    if (prop === "opacity") b.el.style.opacity = val.toFixed(3);
    else b.el.style.setProperty(prop, val.toFixed(3));
  }

  function updateCaptions(p) {
    for (const b of bands) {
      const len = b.b - b.a;
      const f = Math.min(0.02, len / 3);
      let op;
      if (b.first) op = 1 - smooth(p, b.b - f, b.b);
      else if (b.last) op = smooth(p, b.a, b.a + f);
      else op = smooth(p, b.a, b.a + f) * (1 - smooth(p, b.b - f, b.b));
      let k = clamp((p - b.a) / (b.ramp || Math.min(0.025, len * 0.35)), 0, 1);
      if (b.first) k = Math.max(k, loadK);
      setBandStyle(b, "opacity", op, "op", 0.004);
      setBandStyle(b, "--k", k, "k", 0.008);
      if (b.last) {
        setBandStyle(b, "--ks", clamp((k - 0.62) * 4, 0, 1), "ks", 0.008);
        setBandStyle(b, "--kb", clamp((k - 0.76) * 4.5, 0, 1), "kb", 0.008);
      }
    }
  }

  function tick(now) {
    const dt = Math.min(100, now - (lastTick || now));
    lastTick = now;
    const k = 0.14;
    shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
    if (loadK < 1) {
      loadK = clamp((now - loadStart) / 1600, 0, 1);
      loadK = 1 - Math.pow(1 - loadK, 3);
    }
    const resting = Math.abs(target - shown) < 0.0005 && loadK >= 1;
    if (resting) {
      shown = target;
      rafId = null;
      lastTick = 0;
    } else {
      rafId = requestAnimationFrame(tick);
    }
    requestSeek(timeOf(shown) * video.duration);
    updateCaptions(shown);
  }

  function kick() {
    if (rafId === null && scrubOn && heroOnScreen) rafId = requestAnimationFrame(tick);
  }

  function onScroll() {
    target = heroProgress();
    kick();
  }

  function setRing(frac) {
    if (ringFill) ringFill.style.setProperty("--ld", Math.round(126 * (1 - frac)));
  }

  async function loadHeroBlob() {
    const ctrl = new AbortController();
    let watchdog = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(VIDEO_URL, { priority: "low", signal: ctrl.signal });
    if (!res.ok || !res.body) throw new Error("video");
    const total = Number(res.headers.get("Content-Length")) || VIDEO_BYTES;
    const reader = res.body.getReader();
    const chunks = [];
    let got = 0;
    let lastRing = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      clearTimeout(watchdog);
      watchdog = setTimeout(() => ctrl.abort(), 20000);
      chunks.push(value);
      got += value.length;
      const frac = Math.min(1, got / total);
      const now = performance.now();
      if (now - lastRing > 100 || frac === 1) {
        lastRing = now;
        setRing(frac);
      }
    }
    clearTimeout(watchdog);
    setRing(1);
    video.src = URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
    video.load();
    video.addEventListener(
      "canplay",
      () => {
        requestSeek(timeOf(heroProgress()) * video.duration);
        stage.classList.add("video-ready");
        onScroll();
      },
      { once: true },
    );
  }

  function failVideo() {
    if (stage.classList.contains("video-failed")) return;
    stage.classList.add("video-failed");
    if (scrubOn) posterLayer.style.backgroundImage = `url('${ENDING_URL}')`;
  }

  function initHeroOnce() {
    if (heroInit) return;
    heroInit = true;
    loadStart = performance.now();
    let started = false;
    const startBlob = () => {
      if (started) return;
      started = true;
      loadHeroBlob().catch(failVideo);
    };
    const img = new Image();
    img.onload = startBlob;
    img.onerror = startBlob;
    img.src = POSTER_URL;
    setTimeout(startBlob, 4000);
  }

  function enableScrub() {
    if (scrubOn) return;
    scrubOn = true;
    initHeroOnce();
    posterLayer.style.backgroundImage = `url('${stage.classList.contains("video-failed") ? ENDING_URL : POSTER_URL}')`;
    addEventListener("scroll", onScroll, { passive: true });
    bands.forEach((b) => {
      b.op = b.k = b.ks = b.kb = -1;
    });
    target = shown = heroProgress();
    updateCaptions(shown);
    onScroll();
    if (video.duration) requestSeek(timeOf(shown) * video.duration);
  }

  function disableScrub() {
    if (!scrubOn) return;
    scrubOn = false;
    removeEventListener("scroll", onScroll);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    posterLayer.style.removeProperty("background-image");
    bands.forEach((b) => {
      b.el.style.removeProperty("opacity");
      b.el.style.removeProperty("--k");
      b.el.style.removeProperty("--ks");
      b.el.style.removeProperty("--kb");
    });
  }

  // Celular, tablet em pé, tela de toque e movimento reduzido veem uma imagem fixa (iguais ao CSS).
  const GATES = [
    "(max-width: 720px)",
    "(orientation: portrait) and (max-width: 1024px)",
    "(orientation: portrait) and (pointer: coarse)",
    "(orientation: landscape) and (pointer: coarse) and (max-height: 560px)",
    "(prefers-reduced-motion: reduce)",
  ];
  const MQLS = GATES.map((q) => matchMedia(q));

  function applyHeroMode() {
    if (MQLS.some((m) => m.matches)) disableScrub();
    else enableScrub();
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      heroOnScreen = entries[0].isIntersecting;
      if (heroOnScreen) kick();
    }).observe(hero);
  }

  /* ---------- cabeçalho ---------- */

  const header = $("[data-header]");
  let lastScrolled = null;
  let headerQueued = false;

  function updateHeader() {
    headerQueued = false;
    const scrolled = scrollY > 8;
    if (scrolled === lastScrolled) return;
    lastScrolled = scrolled;
    header.classList.toggle("is-scrolled", scrolled);
  }

  addEventListener(
    "scroll",
    () => {
      if (headerQueued) return;
      headerQueued = true;
      requestAnimationFrame(updateHeader);
    },
    { passive: true },
  );
  addEventListener("resize", () => {
    if (scrubOn) onScroll();
  });

  /* ---------- imagens de fundo só baixam quando a pessoa se aproxima ---------- */

  const bgTargets = $$("[data-bg]");
  if ("IntersectionObserver" in window) {
    const bg = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("bg-on");
          bg.unobserve(e.target);
        }
      },
      { rootMargin: "900px 0px" },
    );
    bgTargets.forEach((el) => bg.observe(el));
  } else {
    bgTargets.forEach((el) => el.classList.add("bg-on"));
  }

  /* ---------- menu do celular ---------- */

  const menu = $("[data-menu]");
  const menuToggle = $("[data-menu-toggle]");
  const menuLabel = $("[data-menu-label]");

  function setMenu(open) {
    menu.hidden = !open;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuLabel.textContent = open ? "Fechar" : "Menu";
    document.documentElement.classList.toggle("menu-open", open);
  }

  menuToggle.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      setMenu(false);
      menuToggle.focus();
    }
  });
  matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });

  /* ---------- seção ativa no menu ---------- */

  const navLinks = $$(".nav a");
  if ("IntersectionObserver" in window && navLinks.length) {
    const byId = new Map(navLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const link = byId.get(e.target.id);
          if (!link) continue;
          if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle("is-active", a === link));
          else link.classList.remove("is-active");
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    byId.forEach((_, id) => {
      const s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- início ---------- */

  MQLS.forEach((m) => m.addEventListener("change", applyHeroMode));
  applyHeroMode();
  updateHeader();
})();
