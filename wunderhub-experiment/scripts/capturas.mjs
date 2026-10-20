#!/usr/bin/env node
// Capturas reais dos três conceitos, para os vãos do letreiro e a vitrine da home.
//   1. build num outDir temporário (nunca o dist/ do projeto) e preview dele em 127.0.0.1;
//   2. abre conceitos/<slug>/ no Chromium do Playwright, espera fontes, imagens da primeira tela e
//      o fim das animações de entrada (a tela para de mudar), e fotografa a primeira tela como o
//      visitante a vê: selo de conceito no topo, rolagem em 0, nenhum diálogo aberto;
//   3. grava os mesmos arquivos e dimensões dos placeholders em src/assets/capturas/:
//      <slug>-desktop-{480,960,1440}.webp (viewport 1440×900, 16:10)
//      <slug>-celular-{390,780}.webp      (viewport 390×844, fotografado em deviceScaleFactor 2)
//      As larguras menores saem da maior por redução lanczos (mesma proporção, sem esticar).
// Relógio fixo numa terça às 10h em São Paulo: a Côdea mostra "Aberto agora" e as capturas são
// reprodutíveis. WebP por ffmpeg/libwebp (o mesmo meio de scripts/placeholders.mjs), qualidade 80.
// Nada é sobrescrito se uma página der erro de console, 404 ou abrir com diálogo.
// Depois: src/generated/decisoes.json (medir os [data-decisao]) e os assets do showreel
// (showreel/assets/img/) ficam para a etapa da vitrine e do showreel; este script ainda não os gera.
// Uso: npm run capturas   (porta do preview: PORTA=5185 por padrão)
import { build, preview } from 'vite';
import { chromium } from 'playwright';
import { mkdirSync, rmSync, copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const porta = Number(process.env.PORTA || 5185);
const QUALIDADE = 80;
const HORA_FIXA = new Date('2026-10-20T10:00:00-03:00'); // terça, 10h, horário de Brasília
const slugs = ['codea', 'junco', 'louca-torta'];

const formatos = {
  desktop: { viewport: { width: 1440, height: 900 }, escala: 1, larguras: [1440, 960, 480] },
  celular: { viewport: { width: 390, height: 844 }, escala: 2, larguras: [780, 390] },
};
const alturaDe = (f, w) => Math.round((w * f.viewport.height) / f.viewport.width);

const medir = (arquivo) => {
  const [w, h] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', arquivo], { encoding: 'utf8' })
    .trim().split(',').map(Number);
  return { w, h };
};

// Os placeholders definem o contrato (width/height no HTML e srcset): confere antes de sobrescrever.
for (const slug of slugs) {
  for (const [tipo, f] of Object.entries(formatos)) {
    for (const w of f.larguras) {
      const alvo = join(raiz, `src/assets/capturas/${slug}-${tipo}-${w}.webp`);
      if (!existsSync(alvo)) continue;
      const atual = medir(alvo);
      if (atual.w !== w || atual.h !== alturaDe(f, w)) {
        console.error(`dimensão inesperada em ${alvo}: ${atual.w}×${atual.h}, esperado ${w}×${alturaDe(f, w)}`);
        process.exit(1);
      }
    }
  }
}

const tmp = join(tmpdir(), `wh-capturas-${process.pid}`);
const outDir = join(tmp, 'build');
const saida = join(tmp, 'webp');
mkdirSync(saida, { recursive: true });

let servidor;
let navegador;
let falhou = false;
try {
  console.log('build em', outDir);
  await build({ root: raiz, logLevel: 'error', build: { outDir, emptyOutDir: true } });
  servidor = await preview({ root: raiz, logLevel: 'warn', build: { outDir }, preview: { port: porta, strictPort: true, host: '127.0.0.1' } });
  const base = `http://127.0.0.1:${porta}`;
  navegador = await chromium.launch();

  for (const slug of slugs) {
    for (const [tipo, f] of Object.entries(formatos)) {
      const contexto = await navegador.newContext({
        viewport: f.viewport,
        deviceScaleFactor: f.escala,
        isMobile: tipo === 'celular',
        hasTouch: tipo === 'celular',
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
        colorScheme: 'light',
        reducedMotion: 'no-preference',
      });
      const pagina = await contexto.newPage();
      await pagina.clock.setFixedTime(HORA_FIXA);
      const problemas = [];
      pagina.on('console', (m) => m.type() === 'error' && problemas.push(`console: ${m.text()}`));
      pagina.on('pageerror', (e) => problemas.push(`erro: ${e.message}`));
      pagina.on('requestfailed', (r) => problemas.push(`falhou: ${r.url()}`));
      pagina.on('response', (r) => r.status() >= 400 && problemas.push(`${r.status()}: ${r.url()}`));

      await pagina.goto(`${base}/conceitos/${slug}/`, { waitUntil: 'networkidle' });
      await pagina.evaluate(async () => {
        await document.fonts.ready;
        const naTela = (el) => {
          const r = el.getBoundingClientRect();
          return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
        };
        await Promise.all([...document.images].filter(naTela).map((img) => img.decode().catch(() => {})));
      });

      // Animações de entrada: espera um mínimo e depois até duas fotos seguidas saírem idênticas.
      await pagina.waitForTimeout(1500);
      let anterior = await pagina.screenshot();
      let estavel = false;
      for (let i = 0; i < 20 && !estavel; i++) {
        await pagina.waitForTimeout(400);
        const atual = await pagina.screenshot();
        estavel = atual.equals(anterior);
        anterior = atual;
      }
      if (!estavel) console.warn(`aviso: ${slug} ${tipo} não estabilizou em 9,5s; usando o último quadro`);

      const estado = await pagina.evaluate(() => ({
        rolagem: scrollY,
        dialogo: [...document.querySelectorAll('dialog[open], [aria-modal="true"]')].some((d) => d.getClientRects().length > 0),
        selo: (() => {
          const s = document.querySelector('[data-selo]');
          if (!s) return false;
          const r = s.getBoundingClientRect();
          return r.height > 0 && r.top < innerHeight && r.bottom > 0;
        })(),
        fontes: document.fonts.status,
      }));
      if (estado.rolagem !== 0) problemas.push(`rolagem em ${estado.rolagem}`);
      if (estado.dialogo) problemas.push('diálogo aberto');
      if (!estado.selo) problemas.push('selo de conceito fora da primeira tela');
      if (estado.fontes !== 'loaded') problemas.push(`fontes: ${estado.fontes}`);

      const png = join(tmp, `${slug}-${tipo}.png`);
      writeFileSync(png, anterior);
      await contexto.close();

      if (problemas.length) {
        falhou = true;
        console.error(`${slug} ${tipo}:\n  ${problemas.join('\n  ')}`);
        continue;
      }
      for (const w of f.larguras) {
        const h = alturaDe(f, w);
        const destino = join(saida, `${slug}-${tipo}-${w}.webp`);
        // accurate_rnd + full_chroma_int: sem isso a conversão para 4:2:0 serrilha bordas claras
        // sobre cor saturada (o botão branco da Côdea sobre o amarelo), no mesmo tamanho de arquivo.
        const filtro = `scale=${w}:${h}:flags=lanczos+accurate_rnd+full_chroma_int:out_color_matrix=bt601,format=yuv420p`;
        execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-vf', filtro, '-c:v', 'libwebp', '-quality', String(QUALIDADE), '-compression_level', '6', destino]);
        const m = medir(destino);
        if (m.w !== w || m.h !== h) {
          falhou = true;
          console.error(`${destino}: saiu ${m.w}×${m.h}, esperado ${w}×${h}`);
        }
      }
      console.log(`capturado ${slug} ${tipo}`);
    }
  }
} catch (erro) {
  falhou = true;
  console.error(erro.message);
} finally {
  await navegador?.close();
  await servidor?.close?.();
}

if (falhou) {
  rmSync(tmp, { recursive: true, force: true });
  console.error('capturas não gravadas: corrija os problemas acima');
  process.exit(1);
}
const pasta = join(raiz, 'src/assets/capturas');
mkdirSync(pasta, { recursive: true });
for (const slug of slugs) {
  for (const [tipo, f] of Object.entries(formatos)) {
    for (const w of f.larguras) {
      const nome = `${slug}-${tipo}-${w}.webp`;
      copyFileSync(join(saida, nome), join(pasta, nome));
      console.log(`gravado  src/assets/capturas/${nome}`);
    }
  }
}
rmSync(tmp, { recursive: true, force: true });
