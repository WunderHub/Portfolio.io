// Gera as capturas da vitrine (assets/work/) a partir das páginas em concepts/.
// Usa o Chrome instalado via DevTools Protocol, sem dependências.
//
// 1. Na pasta do projeto: python -m http.server 8000
// 2. Em outro terminal:   node scripts/capture-work.mjs [slug ...]
//
// Variáveis opcionais: CHROME_PATH (caminho do Chrome/Edge) e BASE_URL (padrão http://127.0.0.1:8000).
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "work");
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8000";
const SLUGS = process.argv.length > 2 ? process.argv.slice(2) : ["brasa", "aura", "forma", "serena", "orbit"];
const PORT = 9333;

// Página inteira no computador (largura 1280, salva com 800 px) e primeira tela no celular (390 × 844).
const SHOTS = [
  { suffix: "desktop", width: 1280, height: 800, dpr: 1, mobile: false, fullPage: true, scale: 0.625, quality: 78 },
  { suffix: "mobile", width: 390, height: 844, dpr: 2, mobile: true, fullPage: false, scale: 0.6, quality: 80 },
];
const HIDE = ".concept-note{display:none!important}";

const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);
const chromePath = CANDIDATES.find((p) => existsSync(p));
if (!chromePath) {
  console.error("Chrome não encontrado. Defina CHROME_PATH.");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "wh-capture-"))}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--force-color-profile=srgb",
    "about:blank",
  ],
  { stdio: "ignore" },
);

async function browserSocket() {
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      return (await res.json()).webSocketDebuggerUrl;
    } catch {
      await sleep(150);
    }
  }
  throw new Error("O Chrome não respondeu.");
}

function client(ws) {
  let id = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      listeners.forEach((l) => l(msg));
    }
  });
  return {
    send(method, params = {}, sessionId) {
      const n = ++id;
      ws.send(JSON.stringify({ id: n, method, params, sessionId }));
      return new Promise((resolve, reject) => pending.set(n, { resolve, reject }));
    },
    once(method, sessionId) {
      return new Promise((resolve) => {
        const l = (msg) => {
          if (msg.method === method && msg.sessionId === sessionId) {
            listeners.delete(l);
            resolve(msg.params);
          }
        };
        listeners.add(l);
      });
    },
  };
}

try {
  const ws = new WebSocket(await browserSocket());
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  const cdp = client(ws);
  mkdirSync(OUT, { recursive: true });

  for (const slug of SLUGS) {
    for (const shot of SHOTS) {
      const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
      const s = (m, p) => cdp.send(m, p, sessionId);
      await s("Page.enable");
      await s("Emulation.setDeviceMetricsOverride", {
        width: shot.width,
        height: shot.height,
        deviceScaleFactor: shot.dpr,
        mobile: shot.mobile,
      });
      await s("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
      const loaded = cdp.once("Page.loadEventFired", sessionId);
      await s("Page.navigate", { url: `${BASE}/concepts/${slug}.html` });
      await loaded;
      await s("Runtime.evaluate", {
        awaitPromise: true,
        expression: `(async () => {
          const st = document.createElement("style");
          st.textContent = ${JSON.stringify(HIDE)};
          document.head.append(st);
          document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = "eager"));
          await document.fonts.ready;
          await Promise.all([...document.images].map((img) => img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })));
          await new Promise((r) => setTimeout(r, 600));
        })()`,
      });
      let height = shot.height;
      if (shot.fullPage) {
        const { result } = await s("Runtime.evaluate", {
          expression: "Math.ceil(document.documentElement.scrollHeight)",
          returnByValue: true,
        });
        height = result.value;
      }
      const { data } = await s("Page.captureScreenshot", {
        format: "webp",
        quality: shot.quality,
        captureBeyondViewport: shot.fullPage,
        clip: { x: 0, y: 0, width: shot.width, height, scale: shot.scale },
      });
      const file = join(OUT, `${slug}-${shot.suffix}.webp`);
      writeFileSync(file, Buffer.from(data, "base64"));
      console.log(`✓ ${slug}-${shot.suffix}.webp`);
      await cdp.send("Target.closeTarget", { targetId });
    }
  }
  ws.close();
  console.log("Atualize width/height das imagens em index.html se a altura das páginas mudou.");
} finally {
  chrome.kill();
}
