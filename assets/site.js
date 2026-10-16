// WunderHub — interações da página inicial. Sem dependências.
(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  root.classList.add("reveal-ready");

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- reveal on scroll ---------- */

  const revealTargets = document.querySelectorAll("[data-reveal], .step, .footer-word");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- active section in nav ---------- */

  const navLinks = [...document.querySelectorAll(".nav a")];
  if (navLinks.length && "IntersectionObserver" in window) {
    const byId = new Map(navLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const link = byId.get(entry.target.id);
          if (!link) continue;
          if (entry.isIntersecting) {
            navLinks.forEach((a) => a.classList.toggle("is-active", a === link));
          } else if (link.classList.contains("is-active")) {
            link.classList.remove("is-active");
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    byId.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* ---------- mobile menu ---------- */

  const menu = document.querySelector("[data-menu]");
  const menuToggle = document.querySelector("[data-menu-toggle]");

  function setMenu(open) {
    if (!menu || !menuToggle) return;
    menu.hidden = !open;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.querySelector(".menu-toggle-label").textContent = open ? "Fechar" : "Menu";
    root.classList.toggle("menu-open", open);
  }

  menuToggle?.addEventListener("click", () => setMenu(menu.hidden));
  menu?.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu && !menu.hidden) {
      setMenu(false);
      menuToggle.focus();
    }
  });
  matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });

  /* ---------- scroll-linked effects ---------- */

  const header = document.querySelector("[data-header]");
  const progress = document.querySelector("[data-progress]");
  const stackItems = [...document.querySelectorAll(".stack-item")];
  const stackCards = stackItems.map((item) => item.querySelector(".work-card"));
  const process = document.querySelector("[data-process]");
  const stepsLine = document.querySelector("[data-steps-line]");
  const steps = [...document.querySelectorAll(".step")];
  const hero = document.querySelector("[data-hero]");
  const cta = document.querySelector(".cta");
  const ctaShapes = [...document.querySelectorAll(".cta-shapes i")];
  const fab = document.querySelector("[data-fab]");

  let stickyTops = [];
  let ticking = false;

  function measure() {
    stickyTops = stackItems.map((item) => {
      const style = getComputedStyle(item);
      return style.position === "sticky" ? parseFloat(style.top) || 0 : null;
    });
  }

  function update() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight - vh;

    header?.classList.toggle("is-scrolled", y > 8);
    progress?.style.setProperty("--p", docH > 0 ? (y / docH).toFixed(4) : "0");

    // cartões empilhados: o anterior recua enquanto o próximo sobe
    const animate = !reduceMotion.matches;
    for (let i = 0; i < stackCards.length; i++) {
      const card = stackCards[i];
      const nextTop = stickyTops[i + 1];
      if (!animate || nextTop == null || stickyTops[i] == null) {
        card.style.removeProperty("--s");
        card.style.removeProperty("--dim");
        continue;
      }
      const top = stackItems[i + 1].getBoundingClientRect().top;
      const p = clamp((vh - top) / (vh - nextTop), 0, 1);
      card.style.setProperty("--s", (1 - p * 0.05).toFixed(4));
      card.style.setProperty("--dim", (p * 0.42).toFixed(3));
    }

    // linha do processo
    if (process && stepsLine && getComputedStyle(stepsLine.parentElement).display !== "none") {
      const r = process.getBoundingClientRect();
      const p = clamp((vh * 0.78 - r.top) / (r.height * 0.55), 0, 1);
      stepsLine.style.setProperty("--p", p.toFixed(4));
      steps.forEach((step, i) => step.classList.toggle("is-active", p >= i / steps.length + 0.04));
    }

    // formas do CTA com leve paralaxe
    if (cta && animate) {
      const r = cta.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        ctaShapes.forEach((shape, i) => shape.style.setProperty("--shift", `${(p * (i + 1) * 40).toFixed(1)}px`));
      }
    }

    // botão flutuante do WhatsApp (telas pequenas)
    if (fab && hero) {
      const pastHero = hero.getBoundingClientRect().bottom < vh * 0.4;
      const atCta = cta ? cta.getBoundingClientRect().top < vh * 0.85 : false;
      fab.classList.toggle("is-visible", pastHero && !atCta);
    }
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  measure();
  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    requestUpdate();
  });

  /* ---------- 3D tilt (hero mark + ID card) ---------- */

  function tilt(el, surface, { max = 8, glare = false } = {}) {
    const target = el.firstElementChild;
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0,
      raf = 0;

    function frame() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      target.style.setProperty("--rx", `${(-cy * max).toFixed(2)}deg`);
      target.style.setProperty("--ry", `${(cx * max).toFixed(2)}deg`);
      if (glare) {
        target.style.setProperty("--gx", `${((cx + 1) * 50).toFixed(1)}%`);
        target.style.setProperty("--gy", `${((cy + 1) * 50).toFixed(1)}%`);
      }
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = 0;
      }
    }

    function kick() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    surface.addEventListener("pointermove", (e) => {
      if (reduceMotion.matches || !finePointer.matches) return;
      const r = el.getBoundingClientRect();
      tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
      kick();
    });
    surface.addEventListener("pointerleave", () => {
      tx = 0;
      ty = 0;
      kick();
    });
  }

  const heroMark = document.querySelector(".hero-mark");
  if (heroMark && hero) tilt(heroMark, hero, { max: 10 });
  const idCard = document.querySelector(".id-card");
  if (idCard) tilt(idCard, idCard, { max: 7, glare: true });

  /* ---------- live preview (computador / celular) ---------- */

  const viewer = document.querySelector("[data-viewer]");
  if (!viewer || typeof viewer.showModal !== "function") return;

  const frame = viewer.querySelector("[data-viewer-frame]");
  const device = viewer.querySelector("[data-viewer-device]");
  const stage = viewer.querySelector("[data-viewer-stage]");
  const title = viewer.querySelector("[data-viewer-title]");
  const openLink = viewer.querySelector("[data-viewer-open]");
  const loading = viewer.querySelector("[data-viewer-loading]");
  const modeButtons = [...viewer.querySelectorAll("[data-viewer-mode]")];
  const SIZES = { desktop: { w: 1280 }, mobile: { w: 390, h: 844, bezel: 10 } };
  let mode = "desktop";

  function layout() {
    const cs = getComputedStyle(stage);
    const availW = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const availH = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
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

  function frameDoc() {
    try {
      return frame.contentDocument;
    } catch {
      return null;
    }
  }

  function setMode(next) {
    mode = next;
    stage.dataset.mode = next;
    modeButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.viewerMode === next)));
    frameDoc()?.documentElement.classList.toggle("wh-phone", next === "mobile");
    layout();
  }

  function openViewer(url, name, preferred) {
    title.textContent = name;
    openLink.href = url;
    loading.hidden = false;
    setMode(preferred || (window.innerWidth < 760 ? "mobile" : "desktop"));
    viewer.showModal();
    layout();
    frame.src = url;
  }

  frame.addEventListener("load", () => {
    if (frame.src === "about:blank" || !frame.src) return;
    loading.hidden = true;
    const doc = frameDoc();
    if (!doc || !doc.head) return;
    const style = doc.createElement("style");
    style.textContent =
      ".concept-note{display:none!important}" +
      ".wh-phone{scrollbar-width:none}.wh-phone::-webkit-scrollbar{display:none}";
    doc.head.append(style);
    doc.documentElement.classList.toggle("wh-phone", mode === "mobile");
    // links externos (WhatsApp) abrem fora; voltar à vitrine fecha a prévia
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
    openViewer(trigger.dataset.preview, trigger.dataset.name || "Conceito", trigger.dataset.mode);
  });

  modeButtons.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.viewerMode)));
  viewer.querySelector("[data-viewer-close]").addEventListener("click", () => viewer.close());
  viewer.addEventListener("click", (e) => {
    if (e.target === viewer || e.target === stage) viewer.close();
  });
  viewer.addEventListener("close", () => {
    frame.removeAttribute("src");
  });
  window.addEventListener("resize", () => {
    if (viewer.open) layout();
  });
})();
