// Confere a página nas situações que o CLAUDE.md pede antes de dar algo por pronto.
// Uso: node .claude/skills/conferir-site/conferir.mjs [pasta-ou-url] [--saida pasta] [--lighthouse]
// Sem argumento, serve a raiz do repositório num servidor local temporário.
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { extname, join, resolve, normalize } from "node:path";

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const alvo = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--saida") || ".";
const saida = resolve(opt("--saida", join(tmpdir(), "conferir-site")));
mkdirSync(saida, { recursive: true });

// Dependências que não vêm com o ambiente ficam num cache fora do repositório.
const cache = join(homedir(), ".cache", "conferir-site");
function modulo(pacote, arquivo) {
  const caminho = join(cache, "node_modules", pacote.replace(/@[\d.]+$/, ""), arquivo);
  if (!existsSync(caminho)) {
    mkdirSync(cache, { recursive: true });
    execFileSync("npm", ["i", "--silent", "--no-audit", "--no-fund", "--prefix", cache, pacote], { stdio: "inherit" });
  }
  return caminho;
}
const req = createRequire(import.meta.url);
const { chromium } = req("playwright");
const axePath = modulo("axe-core@4.14.0", "axe.min.js");

// Servidor local simples, com suporte a Range (o vídeo precisa).
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".avif": "image/avif", ".mp4": "video/mp4", ".webm": "video/webm", ".woff2": "font/woff2",
  ".ico": "image/x-icon", ".txt": "text/plain", ".xml": "application/xml", ".webmanifest": "application/manifest+json" };
async function servir(raiz) {
  const srv = createServer((rq, rs) => {
    let p = decodeURIComponent(new URL(rq.url, "http://x").pathname);
    let f = normalize(join(raiz, p));
    if (!f.startsWith(raiz)) { rs.writeHead(403).end(); return; }
    if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
    if (!existsSync(f)) { rs.writeHead(404).end("404"); return; }
    const buf = readFileSync(f);
    const h = { "Content-Type": TIPOS[extname(f).toLowerCase()] || "application/octet-stream", "Accept-Ranges": "bytes" };
    const m = /bytes=(\d*)-(\d*)/.exec(rq.headers.range || "");
    if (m) {
      const ini = m[1] ? +m[1] : 0, fim = m[2] ? Math.min(+m[2], buf.length - 1) : buf.length - 1;
      rs.writeHead(206, { ...h, "Content-Range": `bytes ${ini}-${fim}/${buf.length}`, "Content-Length": fim - ini + 1 });
      rs.end(buf.subarray(ini, fim + 1));
    } else { rs.writeHead(200, { ...h, "Content-Length": buf.length }); rs.end(buf); }
  });
  await new Promise((ok) => srv.listen(0, "127.0.0.1", ok));
  return { srv, url: `http://127.0.0.1:${srv.address().port}/` };
}

let srv, url = alvo;
if (!/^https?:/.test(alvo)) ({ srv, url } = await servir(resolve(alvo)));

const CENAS = [
  { nome: "celular", viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { nome: "computador", viewport: { width: 1440, height: 900 } },
  { nome: "celular-movimento-reduzido", viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: "reduce" },
  { nome: "computador-movimento-reduzido", viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
  { nome: "computador-sem-js", viewport: { width: 1440, height: 900 }, javaScriptEnabled: false },
  { nome: "celular-sem-js", viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, javaScriptEnabled: false },
];

const kb = (b) => (b / 1024 >= 1024 ? (b / 1048576).toFixed(1) + " MB" : Math.round(b / 1024) + " KB");
const browser = await chromium.launch();
const linhas = [];
const detalhes = [];

for (const c of CENAS) {
  const { nome, ...ctxOpts } = c;
  console.error(`conferindo: ${nome}`);
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const erros = [];
  const pedidos = [];
  page.on("console", (m) => m.type() === "error" && erros.push(m.text()));
  page.on("pageerror", (e) => erros.push(e.message));
  page.on("requestfinished", (r) => pedidos.push(r));
  page.on("requestfailed", (r) => !r.url().startsWith("blob:") && erros.push(`falhou: ${r.url()}`));

  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(saida, `${nome}-topo.png`) });
  // Desce a página aos poucos para carregar o que só aparece perto da tela.
  const altura = await page.evaluate(() => document.documentElement.scrollHeight);
  const passo = ctxOpts.viewport.height * 0.8;
  for (let y = 0; y < altura; y += passo) { await page.mouse.wheel(0, passo); await page.waitForTimeout(120); }
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(saida, `${nome}-inteira.png`), fullPage: true });

  let bytes = 0;
  const porTipo = {};
  for (const r of pedidos) {
    const s = await r.sizes().catch(() => null);
    if (!s) continue;
    const t = s.responseBodySize + s.responseHeadersSize;
    bytes += t;
    const tipo = r.resourceType();
    porTipo[tipo] = (porTipo[tipo] || 0) + t;
  }

  const rolagemLateral = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);

  let axe = "não roda sem JS";
  let axeLista = [];
  if (ctxOpts.javaScriptEnabled !== false) {
    await page.addScriptTag({ path: axePath });
    const r = await page.evaluate(() => axe.run({ resultTypes: ["violations"] }));
    axeLista = r.violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length}x): ${v.help}`);
    axe = axeLista.length ? `${axeLista.length} problema(s)` : "nenhum problema";
  }

  // Teclado: percorre os primeiros itens com Tab e confere se o foco aparece.
  const foco = [];
  if (!nome.includes("celular")) {
    // Rolagem instantânea durante o teste, para ver onde o foco para sem esperar a animação.
    await page.evaluate(() => { document.activeElement?.blur(); document.documentElement.style.scrollBehavior = "auto"; });
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(150);
      const f = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const visivel = (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== "none";
        const texto = (el.getAttribute("aria-label") || el.textContent || el.getAttribute("href") || el.tagName).trim().replace(/\s+/g, " ").slice(0, 40);
        return { texto, visivel, naTela: r.bottom > 0 && r.top < innerHeight && r.width > 0 };
      });
      if (!f) break;
      if (foco.length && foco[0].texto === f.texto) break;
      foco.push(f);
    }
  }
  const semAnel = foco.filter((f) => !f.visivel).map((f) => f.texto);
  const foraDaTela = foco.filter((f) => !f.naTela).map((f) => f.texto);

  linhas.push(`| ${nome} | ${kb(bytes)} | ${erros.length} | ${axe} | ${rolagemLateral ? "sim" : "não"} | ${foco.length ? `${foco.length} paradas, ${semAnel.length} sem anel de foco, ${foraDaTela.length} fora da tela` : "—"} |`);
  detalhes.push(`### ${nome}\n- Peso por tipo: ${Object.entries(porTipo).map(([k, v]) => `${k} ${kb(v)}`).join(", ") || "—"}\n` +
    (erros.length ? `- Erros: ${erros.slice(0, 8).join(" · ")}\n` : "") +
    (axeLista.length ? axeLista.map((a) => `- Acessibilidade: ${a}`).join("\n") + "\n" : "") +
    (foco.length ? `- Ordem do Tab: ${foco.map((f) => f.texto + (f.visivel ? "" : " [sem anel]") + (f.naTela ? "" : " [fora da tela]")).join(" → ")}\n` : ""));
  await ctx.close();
}
await browser.close();

let lh = "";
if (flag("--lighthouse")) {
  const lhBin = modulo("lighthouse@13.5.0", "cli/index.js");
  const json = join(saida, "lighthouse.json");
  // Assíncrono: o servidor local roda neste mesmo processo e precisa continuar respondendo.
  await new Promise((ok, falha) => {
    const p = spawn("node", [lhBin, url, "--quiet", "--form-factor=mobile", "--only-categories=performance,accessibility,best-practices,seo",
      "--chrome-flags=--headless=new --no-sandbox", "--output=json", `--output-path=${json}`],
      { env: { ...process.env, CHROME_PATH: chromium.executablePath() }, stdio: "inherit" });
    p.on("exit", (code) => (code === 0 ? ok() : falha(new Error(`Lighthouse saiu com código ${code}`))));
  });
  const r = JSON.parse(readFileSync(json, "utf8"));
  const n = Object.values(r.categories).map((v) => `${v.title} ${Math.round(v.score * 100)}`).join(" · ");
  lh = `\n## Lighthouse (celular, 4G simulado)\n${n}\n- Maior conteúdo na tela: ${r.audits["largest-contentful-paint"].displayValue}\n- Peso total: ${r.audits["total-byte-weight"].displayValue}\n`;
}
srv?.close();

const rel = `# Conferência de ${url}\n\n| Situação | Peso baixado | Erros | Acessibilidade (axe) | Rolagem lateral | Teclado |\n|---|---|---|---|---|---|\n${linhas.join("\n")}\n${lh}\n## Detalhes\n${detalhes.join("\n")}\nCapturas em ${saida}\n`;
writeFileSync(join(saida, "relatorio.md"), rel);
console.log(rel);
