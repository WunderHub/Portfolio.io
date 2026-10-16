/* Native canvas sequence: no imports, animation library, build step or scroll interception. */
(() => {
  "use strict";
  const section = document.querySelector("[data-logo-sequence]");
  if (!section) return;
  const stage = section.querySelector(".logo-sequence-stage");
  const canvas = section.querySelector("canvas");
  const status = section.querySelector('[role="status"]');
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const smallScreen = matchMedia("(max-width: 760px)");
  const count = Number(section.dataset.frameCount) || 240;
  let context;
  try {
    context = canvas.getContext("2d", { alpha: false });
  } catch {
    return;
  }
  if (!context) return; // The HTML picture remains usable without canvas.

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  let session = null;
  let near = true;
  let raf = 0;
  let lastTime = 0;
  let position = 0;
  let requested = 0;
  let drawn = -1;
  let needsResize = true;

  async function decode(blob) {
    if ("createImageBitmap" in window) {
      try {
        const bitmap = await createImageBitmap(blob);
        return { image: bitmap, dispose: () => bitmap.close() };
      } catch {
        /* Older WebKit versions can still decode through an Image. */
      }
    }
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image();
      image.decoding = "async";
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });
      return { image, dispose: () => image.removeAttribute("src") };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // Compressed files are prefetched progressively. Only a small moving window is decoded.
  class FrameCache {
    constructor(variant) {
      this.variant = variant;
      this.radius = variant === "mobile" ? 5 : 8;
      this.limit = variant === "mobile" ? 14 : 20;
      this.blobs = new Map();
      this.images = new Map();
      this.pending = new Map();
      this.decoding = new Set();
      this.attempts = new Map();
      this.failed = new Set();
      this.wanted = [];
      this.target = -1;
      this.visible = true;
      this.disposed = false;
      this.lastDrawn = -1;
      this.tail = [];
      // Sparse anchors make long scroll jumps useful before every intermediate file arrives.
      for (let i = 0; i < count; i += 15) this.tail.push(i);
      this.tail.push(count - 1);
      for (let i = 0; i < count; i++) this.tail.push(i);
    }
    setTarget(index) {
      if (this.target === index) {
        this.pump();
        return;
      }
      const direction = index >= this.target ? 1 : -1;
      this.target = index;
      this.wanted = [index];
      for (let distance = 1; distance <= this.radius; distance++) {
        for (const sign of [direction, -direction]) {
          const i = index + distance * sign;
          if (i >= 0 && i < count) this.wanted.push(i);
        }
      }
      this.trim();
      this.pump();
    }
    trim() {
      const farthest = [...this.images.keys()].sort(
        (a, b) => Math.abs(b - this.target) - Math.abs(a - this.target),
      );
      for (const index of farthest) {
        if (this.images.size <= this.limit) break;
        if (index === this.lastDrawn) continue;
        this.images.get(index).dispose();
        this.images.delete(index);
      }
      section.dataset.decodedFrames = String(this.images.size);
    }
    pump() {
      if (this.disposed || !this.visible) return;
      for (const index of this.wanted) {
        if (this.decoding.size >= 2) break;
        if (
          this.blobs.has(index) &&
          !this.images.has(index) &&
          !this.decoding.has(index) &&
          !this.failed.has(index)
        )
          this.loadImage(index);
      }
      for (const index of [...this.wanted, ...this.tail]) {
        if (this.pending.size >= 4) break;
        if (
          !this.blobs.has(index) &&
          !this.pending.has(index) &&
          !this.failed.has(index)
        )
          this.loadFile(index);
      }
    }
    async loadFile(index) {
      const controller = new AbortController();
      this.pending.set(index, controller);
      this.attempts.set(index, (this.attempts.get(index) || 0) + 1);
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const name = `frame-${String(index + 1).padStart(4, "0")}.webp`;
        const url = new URL(
          `${section.dataset.framesRoot}/${this.variant}/${name}`,
          document.baseURI,
        );
        const response = await fetch(url, {
          signal: controller.signal,
          cache: "force-cache",
        });
        if (!response.ok)
          throw new Error(`Frame ${index}: HTTP ${response.status}`);
        const blob = await response.blob();
        if (!this.disposed) this.blobs.set(index, blob);
      } catch {
        if (!this.disposed && this.attempts.get(index) >= 2)
          this.failed.add(index);
      } finally {
        clearTimeout(timeout);
        this.pending.delete(index);
        if (!this.disposed) {
          if (this.failed.size >= 4 && this.blobs.size === 0) {
            showStatic(
              "Não foi possível carregar a apresentação. Continue para o portfólio.",
            );
          } else this.pump();
        }
      }
    }
    async loadImage(index) {
      this.decoding.add(index);
      try {
        const frame = await decode(this.blobs.get(index));
        if (this.disposed) frame.dispose();
        else {
          this.images.set(index, frame);
          this.trim();
          requestDraw();
        }
      } catch {
        if (!this.disposed) {
          this.failed.add(index);
          this.blobs.delete(index);
          if (this.failed.size >= 4 && this.images.size === 0)
            showStatic(
              "Não foi possível carregar a apresentação. Continue para o portfólio.",
            );
        }
      } finally {
        this.decoding.delete(index);
        this.pump();
      }
    }
    closest(index) {
      if (this.images.has(index)) return index;
      let nearest = -1;
      for (const key of this.images.keys())
        if (nearest === -1 || Math.abs(key - index) < Math.abs(nearest - index))
          nearest = key;
      return nearest;
    }
    pause() {
      this.visible = false;
      // Retain only the painted frame when the sequence is away from the viewport.
      for (const [index, frame] of this.images) {
        if (index !== this.lastDrawn) {
          frame.dispose();
          this.images.delete(index);
        }
      }
      section.dataset.decodedFrames = String(this.images.size);
    }
    dispose() {
      this.disposed = true;
      for (const controller of this.pending.values()) controller.abort();
      for (const frame of this.images.values()) frame.dispose();
      this.images.clear();
      this.blobs.clear();
    }
  }

  function progress() {
    const distance = section.offsetHeight - stage.clientHeight;
    return distance > 0
      ? clamp(-section.getBoundingClientRect().top / distance, 0, 1)
      : 1;
  }
  function requestDraw() {
    if (raf || !session || !near || document.hidden) return;
    raf = requestAnimationFrame(draw);
  }
  function resizeCanvas() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    // Cap both pixel density and total backing-buffer area on high-DPI phones.
    const dpr = Math.min(
      devicePixelRatio || 1,
      2,
      Math.sqrt(3000000 / Math.max(1, width * height)),
    );
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    needsResize = false;
  }
  function draw(time) {
    raf = 0;
    if (!session || !near || document.hidden) return;
    const target = progress() * (count - 1);
    const dt = lastTime ? Math.min(64, time - lastTime) : 16;
    lastTime = time;
    position += (target - position) * (1 - Math.exp(-dt / 65));
    if (Math.abs(target - position) < 0.08) position = target;
    requested = clamp(Math.round(position), 0, count - 1);
    session.setTarget(requested);
    const index = session.closest(requested);
    const resized = needsResize;
    if (resized) resizeCanvas();
    if (index !== -1 && (index !== drawn || resized)) {
      const image = session.images.get(index).image;
      const width = image.width || image.naturalWidth;
      const height = image.height || image.naturalHeight;
      const fit = section.dataset.fit === "cover" ? Math.max : Math.min;
      const scale = fit(canvas.width / width, canvas.height / height);
      const drawWidth = width * scale;
      const drawHeight = height * scale;
      context.fillStyle = "#000";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        (canvas.width - drawWidth) / 2,
        (canvas.height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
      drawn = index;
      session.lastDrawn = index;
      section.dataset.currentFrame = String(index + 1);
      section.dataset.state = "ready";
      status.textContent = "";
    }
    if (position !== target) requestDraw();
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
    lastTime = 0;
    session?.dispose();
    session = null;
    drawn = -1;
    section.dataset.decodedFrames = "0";
    delete section.dataset.currentFrame;
  }
  function showStatic(message = "") {
    stop();
    section.dataset.mode = "static";
    section.dataset.state = "static";
    status.textContent = message;
  }
  function variant() {
    return smallScreen.matches || navigator.connection?.saveData
      ? "mobile"
      : "desktop";
  }
  function start() {
    stop();
    if (reduced.matches) {
      showStatic();
      return;
    }
    section.dataset.mode = "scroll";
    section.dataset.state = "loading";
    section.dataset.variant = variant();
    status.textContent = "Preparando apresentação…";
    position = progress() * (count - 1);
    needsResize = true;
    session = new FrameCache(variant());
    session.visible = near && !document.hidden;
    session.setTarget(Math.round(position));
    requestDraw();
  }
  function visibility() {
    if (!session) return;
    if (near && !document.hidden) {
      session.visible = true;
      lastTime = 0;
      requestDraw();
      session.pump();
    } else {
      cancelAnimationFrame(raf);
      raf = 0;
      lastTime = 0;
      session.pause();
    }
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      near = entry.isIntersecting;
      visibility();
    },
    { rootMargin: "200px 0px" },
  );
  observer.observe(stage);
  const resize = () => {
    if (session && session.variant !== variant()) {
      start();
      return;
    }
    needsResize = true;
    requestDraw();
  };
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", requestDraw, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  reduced.addEventListener("change", start);
  smallScreen.addEventListener("change", resize);
  window.addEventListener("pagehide", stop);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) start();
  });
  section
    .querySelector(".logo-sequence-skip")
    .addEventListener("click", (event) => {
      const destination = document.querySelector("#inicio");
      if (!destination) return;
      event.preventDefault();
      destination.setAttribute("tabindex", "-1");
      destination.focus({ preventScroll: true });
      destination.scrollIntoView({ behavior: "instant", block: "start" });
      history.replaceState(history.state, "", "#inicio");
    });
  start();
})();
