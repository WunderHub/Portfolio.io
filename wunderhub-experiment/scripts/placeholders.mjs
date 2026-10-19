#!/usr/bin/env node
// Placeholders provisórios, neutros, para o build funcionar antes das capturas reais:
//   src/assets/capturas/<slug>-desktop-{480,960,1440}.webp (16:10) e <slug>-celular-{390,780}.webp (390×844)
//   public/media/showreel-poster-{640,1280}.webp (16:9)
//   public/og.png (1200×630)
//   src/generated/decisoes.json (posições plausíveis, marcadas como provisórias)
// `npm run capturas`, `npm run showreel:render` e scripts/og.mjs sobrescrevem estes arquivos.
// Uso: npm run placeholders   (não sobrescreve arquivos existentes; use --forcar para refazer)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const forcar = process.argv.includes('--forcar');
const b64 = (p) => readFileSync(join(raiz, p)).toString('base64');
const ANY = b64('src/assets/fonts/anybody-latin-wdth-normal.woff2');
const ARC = b64('src/assets/fonts/archivo-latin-wght-normal.woff2');

// larguraEm: largura do nome nos eixos do conceito (src/generated/letreiro.json, chave nomes)
const letreiro = JSON.parse(readFileSync(join(raiz, 'src/generated/letreiro.json'), 'utf8'));
const conceitos = [
  { slug: 'codea', nome: 'Côdea', wdth: 150, wght: 850 },
  { slug: 'junco', nome: 'Junco', wdth: 62, wght: 400 },
  { slug: 'louca-torta', nome: 'Louça Torta', wdth: 125, wght: 250 },
].map((c) => ({ ...c, larguraEm: letreiro.nomes[c.slug].larguraEm }));

const base = (corpo, w, h) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:A;src:url(data:font/woff2;base64,${ANY}) format('woff2');font-weight:100 900;font-stretch:50% 150%}
@font-face{font-family:R;src:url(data:font/woff2;base64,${ARC}) format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{background:#25282C;color:#B9BEC5;font-family:R,sans-serif}
</style></head><body>${corpo}</body></html>`;

const captura = (c, w, h, celular) => base(`
<div style="position:absolute;inset:${Math.round(w * 0.03)}px;border:${Math.max(1, Math.round(w / 480))}px solid #3B3F45;display:grid;align-content:center;justify-items:start;gap:${Math.round(w * (celular ? 0.03 : 0.015))}px;padding:0 ${Math.round(w * 0.07)}px">
  <div style="font-family:A;font-stretch:${c.wdth}%;font-weight:${c.wght};font-size:${Math.floor(Math.min(w * (celular ? 0.2 : 0.11), (w * 0.8) / c.larguraEm))}px;line-height:1;color:#EEF0F2;white-space:nowrap">${c.nome}</div>
  <div style="font-size:${Math.round(w * (celular ? 0.055 : 0.022))}px;line-height:1.3">captura provisória</div>
  <div style="font-size:${Math.round(w * (celular ? 0.04 : 0.014))}px;color:#7D838B">${celular ? '390 × 844, celular' : '1440 × 900, computador'}</div>
</div>`, w, h);

const poster = (w, h) => base(`
<div style="position:absolute;inset:0;background:#000;display:grid;align-content:center;justify-items:center;gap:${Math.round(w * 0.015)}px">
  <div style="font-family:A;font-stretch:50%;font-weight:900;font-size:${Math.round(w * 0.12)}px;line-height:.8;color:#7D838B;letter-spacing:0">WUNDERHUB</div>
  <div style="font-size:${Math.round(w * 0.022)}px;color:#B9BEC5">Filme da fachada, pôster provisório</div>
</div>`, w, h);

const og = () => {
  const larg = 1200 - 2 * 56;
  const fs = larg / 3.5756; // letreiro em uma linha, 50/900 (src/generated/letreiro.json)
  return base(`
<div style="position:absolute;inset:0;background:#000;padding:48px 56px 0;display:grid;grid-template-rows:auto auto 1fr;row-gap:28px">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <span style="font-family:A;font-stretch:150%;font-weight:800;font-size:22px;letter-spacing:.01em;color:#EEF0F2">WUNDERHUB</span>
    <span style="font-size:20px;color:#B9BEC5">Kauê Ribeiro</span>
  </div>
  <div style="font-family:A;font-stretch:62%;font-weight:800;font-size:60px;line-height:.95;color:#EEF0F2">Sites para o seu negócio ser<br>encontrado e chamado.</div>
  <div style="align-self:end;font-family:A;font-stretch:50%;font-weight:900;font-size:${fs}px;line-height:.74;height:.74em;padding-top:.0605em;white-space:nowrap;color:transparent;background:linear-gradient(104deg,#7A8088 0%,#C9CDD2 14%,#E9ECEF 24%,#AEB3BA 38%,#CDD1D6 55%,#959BA3 72%,#D5D9DD 88%,#A3A9B0 100%);-webkit-background-clip:text;background-clip:text;margin-bottom:28px">WUNDERHUB</div>
</div>`, 1200, 630);
};

const tmp = join(tmpdir(), `wh-placeholders-${process.pid}`);
mkdirSync(tmp, { recursive: true });
const navegador = await chromium.launch();
const pagina = await navegador.newPage();

async function render(html, w, h, destino, formato = 'webp', qualidade = 70) {
  const alvo = join(raiz, destino);
  if (existsSync(alvo) && !forcar) {
    console.log(`mantido  ${destino}`);
    return;
  }
  await pagina.setViewportSize({ width: w, height: h });
  await pagina.setContent(html);
  await pagina.evaluate(() => document.fonts.ready);
  const png = join(tmp, 'q.png');
  await pagina.screenshot({ path: png });
  mkdirSync(dirname(alvo), { recursive: true });
  if (formato === 'png') writeFileSync(alvo, readFileSync(png));
  else execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-c:v', 'libwebp', '-quality', String(qualidade), alvo]);
  console.log(`gravado  ${destino}`);
}

for (const c of conceitos) {
  for (const w of [480, 960, 1440]) await render(captura(c, w, w * 10 / 16, false), w, w * 10 / 16, `src/assets/capturas/${c.slug}-desktop-${w}.webp`);
  for (const w of [390, 780]) await render(captura(c, w, Math.round(w * 844 / 390), true), w, Math.round(w * 844 / 390), `src/assets/capturas/${c.slug}-celular-${w}.webp`);
}
await render(poster(640, 360), 640, 360, 'public/media/showreel-poster-640.webp', 'webp', 72);
await render(poster(1280, 720), 1280, 720, 'public/media/showreel-poster-1280.webp', 'webp', 72);
await render(og(), 1200, 630, 'public/og.png', 'png');
await navegador.close();
rmSync(tmp, { recursive: true, force: true });

// Posições provisórias dos elementos [data-decisao] (em % da captura: canto superior esquerdo, largura, altura).
const decisoes = join(raiz, 'src/generated/decisoes.json');
if (!existsSync(decisoes) || forcar) {
  const json = {
    gerado: new Date().toISOString(),
    gerador: 'scripts/placeholders.mjs',
    provisorio: true,
    nota: 'Posições plausíveis para o layout da vitrine. scripts/capturas.mjs regrava este arquivo medindo os [data-decisao] das demos.',
    unidade: 'percentual da captura; x e y são o canto superior esquerdo do elemento',
    viewport: { desktop: [1440, 900], celular: [390, 844] },
    conceitos: {
      codea: {
        desktop: { A: { x: 0, y: 0, w: 100, h: 5 }, B: { x: 6, y: 62, w: 55, h: 30 }, C: { x: 68, y: 62, w: 26, h: 30 } },
        celular: { A: { x: 0, y: 0, w: 100, h: 6 }, B: { x: 4, y: 70, w: 92, h: 20 }, C: { x: 0, y: 92, w: 100, h: 8 } },
      },
      junco: {
        desktop: { A: { x: 8, y: 70, w: 84, h: 25 }, B: { x: 58, y: 2, w: 12, h: 5 }, C: { x: 84, y: 2, w: 12, h: 5 } },
        celular: { A: { x: 4, y: 72, w: 92, h: 24 }, B: { x: 70, y: 1, w: 26, h: 6 }, C: { x: 4, y: 50, w: 60, h: 6 } },
      },
      'louca-torta': {
        desktop: { A: { x: 4, y: 66, w: 20, h: 30 }, B: { x: 28, y: 70, w: 30, h: 25 }, C: { x: 86, y: 2, w: 10, h: 5 } },
        celular: { A: { x: 4, y: 76, w: 40, h: 6 }, B: { x: 4, y: 84, w: 92, h: 14 }, C: { x: 74, y: 1, w: 22, h: 6 } },
      },
    },
  };
  mkdirSync(dirname(decisoes), { recursive: true });
  writeFileSync(decisoes, JSON.stringify(json, null, 2) + '\n');
  console.log('gravado  src/generated/decisoes.json');
} else {
  console.log('mantido  src/generated/decisoes.json');
}
