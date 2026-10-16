// WunderHub · conceito Núcleo. JavaScript puro, sem dependências.
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smooth = (p, e0, e1) => {
    const t = clamp((p - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const RM = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");

  root.classList.add("reveal-ready");
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

  /* ---------- descida: vídeo guiado pela rolagem ---------- */

  const hero = $("[data-hero]");
  const stage = $("[data-stage]");
  const video = $("[data-video]");
  const posterLayer = $("[data-poster]");
  const loader = $("[data-loader]");
  const ringFill = loader ? $(".ring-fill", loader) : null;
  const cue = $("[data-cue]");
  const hud = $(".hud");
  const altEl = $("[data-alt]");

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
  let lastAlt = "";
  let lastAltAt = 0;
  let cueHidden = false;
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
    const hide = p > 0.03;
    if (cue && hide !== cueHidden) {
      cueHidden = hide;
      cue.classList.toggle("is-hidden", hide);
    }
  }

  function updateHud(p, now) {
    if (!altEl || now - lastAltAt < 100) return;
    const meters = Math.round(((1 - timeOf(p)) * 1200) / 10) * 10;
    const done = p > 0.985;
    const text = done ? "0 m · Núcleo" : `${meters.toLocaleString("pt-BR")} m`;
    if (text === lastAlt) return;
    lastAlt = text;
    lastAltAt = now;
    altEl.textContent = text;
    hud.classList.toggle("is-done", done);
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
    updateHud(shown, now);
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
    unpinFinalStates();
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

  /* ---------- trilha de circuito (assinatura) ---------- */

  const spine = $("[data-spine]");
  const spineLit = $("[data-spine-lit]");
  const spinePulse = $("[data-spine-pulse]");
  const nodes = $$("[data-node]");
  let spineTop = 0;
  let spineHeight = 0;
  let spineDots = [];
  let pinned = false;

  function measureSpine() {
    if (!spine) return;
    const main = $("#main");
    const mainTop = main.getBoundingClientRect().top + scrollY;
    const start = hero.getBoundingClientRect().bottom + scrollY;
    const end = $(".contact").getBoundingClientRect().top + scrollY + 160;
    spineTop = start;
    spineHeight = Math.max(0, end - start);
    spine.style.top = `${start - mainTop}px`;
    spine.style.height = `${spineHeight}px`;
    spineDots.forEach((d) => d.el.remove());
    spineDots = nodes.map((n) => {
      const el = document.createElement("i");
      el.className = "spine-dot";
      const y = n.getBoundingClientRect().top + scrollY + n.offsetHeight / 2 - spineTop;
      el.style.top = `${y - 4}px`;
      spine.append(el);
      return { el, y, lit: false };
    });
  }

  /* ---------- efeitos ligados à rolagem ---------- */

  const header = $("[data-header]");
  const fab = $("[data-fab]");
  const contact = $(".contact");
  const process = $("[data-process]");
  const steps = $$("[data-step]");
  const interImg = $("[data-parallax]");
  const interlude = $("[data-interlude]");
  let ticking = false;
  let lastScrolled = null;
  let lastFab = null;
  let lastTp = -1;
  let lastSpineP = -1;
  let lastPx = null;
  const nodeLit = new Map();

  function updatePage() {
    ticking = false;
    const y = scrollY;
    const vh = innerHeight;

    const scrolled = y > 8;
    if (scrolled !== lastScrolled) {
      lastScrolled = scrolled;
      header.classList.toggle("is-scrolled", scrolled);
    }

    if (fab) {
      const pastHero = hero.getBoundingClientRect().bottom < vh * 0.4;
      const atContact = contact.getBoundingClientRect().top < vh * 0.85;
      const show = pastHero && !atContact;
      if (show !== lastFab) {
        lastFab = show;
        fab.classList.toggle("is-visible", show);
      }
    }

    if (pinned) return;

    if (spine && spineHeight > 0) {
      const litY = clamp(y + vh * 0.55 - spineTop, 0, spineHeight);
      const p = litY / spineHeight;
      if (Math.abs(p - lastSpineP) > 0.0005) {
        lastSpineP = p;
        spineLit.style.setProperty("--p", p.toFixed(4));
        spinePulse.style.setProperty("--py", `${(litY - 3).toFixed(1)}px`);
      }
      for (const d of spineDots) {
        const lit = d.y <= litY;
        if (lit !== d.lit) {
          d.lit = lit;
          d.el.classList.toggle("is-lit", lit);
        }
      }
    }

    for (const n of nodes) {
      const lit = n.getBoundingClientRect().top < vh * 0.6;
      if (nodeLit.get(n) !== lit) {
        nodeLit.set(n, lit);
        n.classList.toggle("is-lit", lit);
      }
    }

    if (process) {
      const r = process.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        const tp = clamp((vh * 0.72 - r.top) / (r.height * 0.55), 0, 1);
        if (Math.abs(tp - lastTp) > 0.002) {
          lastTp = tp;
          process.style.setProperty("--tp", tp.toFixed(3));
          const wide = innerWidth >= 900;
          steps.forEach((s, i) => {
            const lit = wide ? tp >= (i + 0.35) / steps.length : s.getBoundingClientRect().top < vh * 0.72;
            s.classList.toggle("is-lit", lit);
          });
        }
      }
    }

    if (interImg && !RM.matches) {
      const r = interlude.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        const px = Math.round((r.top + r.height / 2 - vh / 2) * -0.12);
        if (px !== lastPx) {
          lastPx = px;
          interImg.style.setProperty("--px", `${px}px`);
        }
      }
    }
  }

  function requestPage() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updatePage);
  }

  addEventListener("scroll", requestPage, { passive: true });
  addEventListener("resize", () => {
    measureSpine();
    lastSpineP = -1;
    lastTp = -1;
    requestPage();
    if (scrubOn) onScroll();
  });
  addEventListener("load", () => {
    measureSpine();
    requestPage();
  });

  /* ---------- movimento reduzido: tudo no estado final ---------- */

  function pinToFinalStates() {
    pinned = true;
    if (spineLit) spineLit.style.setProperty("--p", "1");
    spineDots.forEach((d) => d.el.classList.add("is-lit"));
    nodes.forEach((n) => n.classList.add("is-lit"));
    if (process) process.style.setProperty("--tp", "1");
    steps.forEach((s) => s.classList.add("is-lit"));
    if (interImg) interImg.style.removeProperty("--px");
    bootComplete();
  }

  function unpinFinalStates() {
    if (!pinned) return;
    pinned = false;
    spineDots.forEach((d) => {
      d.lit = false;
      d.el.classList.remove("is-lit");
    });
    nodeLit.clear();
    nodes.forEach((n) => n.classList.remove("is-lit"));
    lastSpineP = -1;
    lastTp = -1;
    requestPage();
  }

  /* ---------- entradas ---------- */

  const revealTargets = $$("[data-reveal], [data-reveal-group]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          if (e.target.hasAttribute("data-reveal-group")) {
            setTimeout(() => e.target.classList.add("settled"), 1500);
          }
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    revealTargets.forEach((el) => io.observe(el));

    const live = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.classList.toggle("live", e.isIntersecting);
    });
    $$("[data-live]").forEach((el) => live.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in", "settled"));
    $$("[data-live]").forEach((el) => el.classList.add("live"));
  }

  document.addEventListener("visibilitychange", () => {
    document.body.classList.toggle("paused", document.hidden);
  });

  /* ---------- menu do celular ---------- */

  const menu = $("[data-menu]");
  const menuToggle = $("[data-menu-toggle]");
  const menuLabel = $("[data-menu-label]");

  function setMenu(open) {
    menu.hidden = !open;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuLabel.textContent = open ? "Fechar" : "Menu";
    root.classList.toggle("menu-open", open);
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

  /* ---------- vitrine ---------- */

  const pins = $$("[data-pin]");
  const screens = $$("[data-screen]");

  function selectPin(i, focus) {
    pins.forEach((p, j) => {
      const on = i === j;
      p.setAttribute("aria-selected", String(on));
      p.tabIndex = on ? 0 : -1;
    });
    screens.forEach((s, j) => {
      const on = i === j;
      s.hidden = !on;
      s.classList.remove("is-on");
      if (on) {
        void s.offsetWidth;
        s.classList.add("is-on");
      }
    });
    if (focus) pins[i].focus();
    measureSpine();
  }

  pins.forEach((p, i) => {
    p.addEventListener("click", () => selectPin(i));
    p.addEventListener("keydown", (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) {
        e.preventDefault();
        selectPin((i + keys[e.key] + pins.length) % pins.length, true);
      } else if (e.key === "Home") {
        e.preventDefault();
        selectPin(0, true);
      } else if (e.key === "End") {
        e.preventDefault();
        selectPin(pins.length - 1, true);
      }
    });
  });

  /* ---------- segure para ligar (o momento interativo) ---------- */

  const boot = $("[data-boot]");
  const hold = $("[data-hold]");
  const holdLabel = $("[data-hold-label]");
  const bootStatus = $("[data-boot-status]");
  let hp = 0;
  let holding = false;
  let booted = false;
  let holdRaf = null;
  let holdLast = 0;
  const FILL_S = 1.6;
  const DRAIN_S = 0.9;

  function setHp(v) {
    hp = v;
    boot.style.setProperty("--hp", v.toFixed(3));
  }

  function bootComplete() {
    if (!boot || booted) return;
    booted = true;
    holding = false;
    setHp(1);
    boot.classList.add("is-on");
    holdLabel.textContent = "Ligado. Toque para desligar";
    bootStatus.textContent = "No ar.";
  }

  function bootReset() {
    booted = false;
    setHp(0);
    boot.classList.remove("is-on");
    holdLabel.textContent = "Segure para ligar";
    bootStatus.textContent = "Desligado.";
  }

  function holdStep(now) {
    const dt = Math.min(0.05, (now - (holdLast || now)) / 1000);
    holdLast = now;
    if (booted) {
      holdRaf = null;
      return;
    }
    const next = clamp(hp + (holding ? dt / FILL_S : -dt / DRAIN_S), 0, 1);
    setHp(next);
    if (next >= 1) {
      bootComplete();
      holdRaf = null;
      return;
    }
    if (holding || next > 0) {
      holdRaf = requestAnimationFrame(holdStep);
    } else {
      holdRaf = null;
      holdLast = 0;
    }
  }

  function holdStart(e) {
    if (booted) {
      bootReset();
      return;
    }
    if (e && e.cancelable) e.preventDefault();
    holding = true;
    bootStatus.textContent = "Ligando…";
    if (holdRaf === null) {
      holdLast = 0;
      holdRaf = requestAnimationFrame(holdStep);
    }
  }

  function holdEnd() {
    if (!holding) return;
    holding = false;
    if (!booted) bootStatus.textContent = "Segure até o fim.";
  }

  if (hold) {
    hold.addEventListener("pointerdown", holdStart);
    hold.addEventListener("pointerup", holdEnd);
    hold.addEventListener("pointerleave", holdEnd);
    hold.addEventListener("pointercancel", holdEnd);
    hold.addEventListener("contextmenu", (e) => e.preventDefault());
    hold.addEventListener("keydown", (e) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) {
        e.preventDefault();
        holdStart();
      }
    });
    hold.addEventListener("keyup", (e) => {
      if (e.key === " " || e.key === "Enter") holdEnd();
    });
  }

  /* ---------- inclinação 3D do W ---------- */

  function tilt(el, max) {
    const target3d = el.firstElementChild;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    function frame() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      target3d.style.setProperty("--rx", `${(-cy * max).toFixed(2)}deg`);
      target3d.style.setProperty("--ry", `${(cx * max).toFixed(2)}deg`);
      raf = Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(frame) : 0;
    }
    el.addEventListener("pointermove", (e) => {
      if (RM.matches || !finePointer.matches) return;
      const r = el.getBoundingClientRect();
      tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
      if (!raf) raf = requestAnimationFrame(frame);
    });
    el.addEventListener("pointerleave", () => {
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    });
  }

  $$("[data-tilt]").forEach((el) => tilt(el, 10));

  /* ---------- prévia ao vivo (computador / celular) ---------- */

  const viewer = $("[data-viewer]");
  if (viewer && typeof viewer.showModal === "function") {
    const frame = $("[data-viewer-frame]", viewer);
    const device = $("[data-viewer-device]", viewer);
    const vStage = $("[data-viewer-stage]", viewer);
    const vTitle = $("[data-viewer-title]", viewer);
    const vOpen = $("[data-viewer-open]", viewer);
    const vLoading = $("[data-viewer-loading]", viewer);
    const modeButtons = $$("[data-viewer-mode]", viewer);
    const SIZES = { desktop: { w: 1280 }, mobile: { w: 390, h: 844, bezel: 10 } };
    let mode = "desktop";

    const frameDoc = () => {
      try {
        return frame.contentDocument;
      } catch {
        return null;
      }
    };

    function layout() {
      const cs = getComputedStyle(vStage);
      const availW = vStage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const availH = vStage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (mode === "desktop") {
        const s = Math.min(1, availW / SIZES.desktop.w);
        frame.style.width = `${SIZES.desktop.w}px`;
        frame.style.height = `${availH / s}px`;
        frame.style.transform = `scale(${s})`;
        device.style.width = `${SIZES.desktop.w * s}px`;
        device.style.height = `${availH}px`;
      } else {
        const { w, h, bezel } = SIZES.mobile;
        const s = Math.min(1, (availH - bezel * 2) / h, (availW - bezel * 2) / w);
        frame.style.width = `${w}px`;
        frame.style.height = `${h}px`;
        frame.style.transform = `scale(${s})`;
        device.style.width = `${w * s + bezel * 2}px`;
        device.style.height = `${h * s + bezel * 2}px`;
      }
    }

    function setMode(next) {
      mode = next;
      vStage.dataset.mode = next;
      modeButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.viewerMode === next)));
      frameDoc()?.documentElement.classList.toggle("wh-phone", next === "mobile");
      layout();
    }

    function openViewer(url, name, preferred) {
      vTitle.textContent = name;
      vOpen.href = url;
      vLoading.hidden = false;
      setMode(preferred || (innerWidth < 760 ? "mobile" : "desktop"));
      viewer.showModal();
      layout();
      frame.src = url;
    }

    frame.addEventListener("load", () => {
      if (!frame.getAttribute("src")) return;
      vLoading.hidden = true;
      const doc = frameDoc();
      if (!doc || !doc.head) return;
      const style = doc.createElement("style");
      style.textContent =
        ".concept-note{display:none!important}.wh-phone{scrollbar-width:none}.wh-phone::-webkit-scrollbar{display:none}";
      doc.head.append(style);
      doc.documentElement.classList.toggle("wh-phone", mode === "mobile");
      doc.addEventListener("click", (e) => {
        const a = e.target.closest("a[href]");
        if (!a) return;
        const url = new URL(a.getAttribute("href"), doc.baseURI);
        if (url.origin !== location.origin) {
          e.preventDefault();
          window.open(url.href, "_blank", "noopener");
        } else if (!url.pathname.includes("/concepts/")) {
          e.preventDefault();
          viewer.close();
        }
      });
    });

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-preview]");
      if (!trigger || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
      e.preventDefault();
      openViewer(trigger.getAttribute("data-preview"), trigger.dataset.name || "Conceito", trigger.dataset.mode);
    });

    modeButtons.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.viewerMode)));
    $("[data-viewer-close]", viewer).addEventListener("click", () => viewer.close());
    viewer.addEventListener("click", (e) => {
      if (e.target === viewer || e.target === vStage) viewer.close();
    });
    viewer.addEventListener("close", () => frame.removeAttribute("src"));
    addEventListener("resize", () => {
      if (viewer.open) layout();
    });
  }

  /* ---------- início ---------- */

  MQLS.forEach((m) => m.addEventListener("change", applyHeroMode));
  RM.addEventListener("change", (e) => {
    if (e.matches) pinToFinalStates();
    else applyHeroMode();
  });

  measureSpine();
  applyHeroMode();
  if (RM.matches) pinToFinalStates();
  updatePage();
})();
