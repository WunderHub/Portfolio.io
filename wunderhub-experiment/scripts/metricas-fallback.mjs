#!/usr/bin/env node
// Mede size-adjust e overrides das faces de fallback (seção 2.3) e grava:
//   src/generated/fallback.json   (valores, referências usadas, todos os candidatos medidos)
//   src/styles/fontes.css         (@font-face das fontes e dos fallbacks, pilhas em :root)
// Uso: npm run metricas   (ou node scripts/metricas-fallback.mjs)
//
// size-adjust = largura(texto na fonte web) / largura(texto na face local)
// ascent/descent-override = fontBoundingBoxAscent/Descent da fonte web a 100px, divididos pelo size-adjust.
// A referência de cada face é o primeiro candidato da lista local() disponível nesta máquina. Quando
// nenhum local existe (caso das condensadas neste Linux), usa uma cópia de referência baixada do npm
// para a pasta de cache (fora do src/ e do dist/), e registra isso no JSON.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cache = join(raiz, 'node_modules/.cache/wh-metricas');

const UNICODE_LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const H1 = 'Sites para o seu negócio ser encontrado e chamado.';
const LEAD = 'Sou Kauê Ribeiro, da WunderHub. Crio landing pages, sites institucionais e lojas virtuais para pequenos negócios e profissionais. Quem atende você sou eu, da primeira conversa à publicação.';

// Cópias de referência (só para medir; nunca vão para o site).
const referencias = {
  'Roboto Condensed Bold': { pacote: '@fontsource/roboto-condensed@5.3.0', tgz: 'fontsource-roboto-condensed-5.3.0.tgz', arquivo: 'package/files/roboto-condensed-latin-700-normal.woff2' },
  'DejaVu Sans Condensed Bold': { pacote: 'dejavu-fonts-ttf@2.37.3', tgz: 'dejavu-fonts-ttf-2.37.3.tgz', arquivo: 'package/ttf/DejaVuSansCondensed-Bold.ttf' },
};

const faces = [
  {
    familia: 'Anybody Fallback Estreita', peso: 800, web: 'anybody', texto: H1, wght: 800, wdth: 62,
    locais: ['Arial Narrow Bold', 'ArialNarrow-Bold', 'Liberation Sans Narrow Bold', 'LiberationSansNarrow-Bold', 'Roboto Condensed Bold', 'RobotoCondensed-Bold', 'DejaVu Sans Condensed Bold', 'DejaVuSansCondensed-Bold'],
    referencias: { 'Roboto Condensed Bold': 'Roboto Condensed Bold', 'RobotoCondensed-Bold': 'Roboto Condensed Bold', 'DejaVu Sans Condensed Bold': 'DejaVu Sans Condensed Bold', 'DejaVuSansCondensed-Bold': 'DejaVu Sans Condensed Bold' },
  },
  {
    familia: 'Anybody Fallback', peso: 800, web: 'anybody', texto: H1, wght: 800, wdth: 62,
    locais: ['Arial Bold', 'Arial-BoldMT', 'Liberation Sans Bold', 'LiberationSans-Bold', 'Roboto Bold', 'Roboto-Bold', 'Helvetica Neue Bold', 'HelveticaNeue-Bold'],
    referencias: {},
  },
  {
    familia: 'Archivo Fallback', peso: null, web: 'archivo', texto: LEAD, wght: 400, wdth: 100,
    locais: ['Arial', 'ArialMT', 'Liberation Sans', 'LiberationSans', 'Roboto', 'Helvetica Neue'],
    referencias: {},
  },
];

// Baixa as cópias de referência uma vez (npm pack + tar), para a pasta de cache.
function garantirReferencia(nome) {
  const ref = referencias[nome];
  const destino = join(cache, ref.arquivo);
  if (!existsSync(destino)) {
    mkdirSync(cache, { recursive: true });
    execFileSync('npm', ['pack', ref.pacote, '--silent', '--pack-destination', cache], { stdio: 'ignore' });
    execFileSync('tar', ['xzf', join(cache, ref.tgz), '-C', cache, ref.arquivo]);
  }
  return readFileSync(destino).toString('base64');
}

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.setContent('<!doctype html><html><body style="margin:0"></body></html>');
await pagina.evaluate(async ({ anybody, archivo }) => {
  const add = async (familia, b64, desc) => {
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const f = new FontFace(familia, bin.buffer, desc);
    await f.load();
    document.fonts.add(f);
  };
  await add('Web anybody', anybody, { weight: '100 900', stretch: '50% 150%' });
  await add('Web archivo', archivo, { weight: '100 900' });
}, {
  anybody: readFileSync(join(raiz, 'src/assets/fonts/anybody-latin-wdth-normal.woff2')).toString('base64'),
  archivo: readFileSync(join(raiz, 'src/assets/fonts/archivo-latin-wght-normal.woff2')).toString('base64'),
});

const versaoChromium = navegador.version();
const resultado = {};
for (const face of faces) {
  // Fonte web: largura do texto e métricas verticais.
  const web = await pagina.evaluate(({ familia, texto, wght, wdth }) => {
    const s = document.createElement('span');
    s.style.cssText = `font-family:"${familia}";font-size:100px;font-weight:${wght};font-stretch:${wdth}%;white-space:pre;display:inline-block`;
    s.textContent = texto;
    document.body.append(s);
    const largura = s.getBoundingClientRect().width;
    s.remove();
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `${wght} 100px "${familia}"`;
    const m = ctx.measureText('H');
    return { largura, ascent: m.fontBoundingBoxAscent / 100, descent: m.fontBoundingBoxDescent / 100 };
  }, { familia: `Web ${face.web}`, texto: face.texto, wght: face.wght, wdth: face.wdth });

  const candidatos = [];
  for (const local of face.locais) {
    const nomeRef = face.referencias[local];
    const medida = await pagina.evaluate(async ({ local, texto, peso, refB64, idx }) => {
      const familia = `Cand ${idx}`;
      let fonte;
      try {
        fonte = refB64
          ? new FontFace(familia, Uint8Array.from(atob(refB64), (c) => c.charCodeAt(0)).buffer, peso ? { weight: String(peso) } : {})
          : new FontFace(familia, `local("${local}")`, peso ? { weight: String(peso) } : {});
        await fonte.load();
      } catch { return null; }
      document.fonts.add(fonte);
      const s = document.createElement('span');
      s.style.cssText = `font-family:"${familia}",monospace;font-size:100px;font-weight:${peso || 400};white-space:pre;display:inline-block`;
      s.textContent = texto;
      document.body.append(s);
      const largura = s.getBoundingClientRect().width;
      s.remove();
      return { largura };
    }, { local, texto: face.texto, peso: face.peso, refB64: null, idx: candidatos.length });
    if (medida) {
      candidatos.push({ local, origem: 'local', largura: medida.largura });
      continue;
    }
    if (nomeRef) {
      const refB64 = garantirReferencia(nomeRef);
      const m2 = await pagina.evaluate(async ({ texto, peso, refB64, idx }) => {
        const familia = `Ref ${idx}`;
        const f = new FontFace(familia, Uint8Array.from(atob(refB64), (c) => c.charCodeAt(0)).buffer, { weight: String(peso) });
        await f.load();
        document.fonts.add(f);
        const s = document.createElement('span');
        s.style.cssText = `font-family:"${familia}",monospace;font-size:100px;font-weight:${peso};white-space:pre;display:inline-block`;
        s.textContent = texto;
        document.body.append(s);
        const largura = s.getBoundingClientRect().width;
        s.remove();
        return { largura };
      }, { texto: face.texto, peso: face.peso, refB64, idx: candidatos.length });
      candidatos.push({ local, origem: `cópia de referência (${referencias[nomeRef].pacote}); local ausente nesta máquina`, largura: m2.largura });
    } else {
      candidatos.push({ local, origem: 'ausente', largura: null });
    }
  }
  const usados = candidatos.filter((c) => c.largura);
  const escolhido = usados.find((c) => c.origem === 'local') || usados[0];
  if (!escolhido) throw new Error(`Nenhuma referência mensurável para ${face.familia}`);
  const sizeAdjust = web.largura / escolhido.largura;
  resultado[face.familia] = {
    referencia: `${escolhido.local} (${escolhido.origem})`,
    texto: face.texto,
    fonteWeb: `${face.web === 'anybody' ? 'Anybody' : 'Archivo'} wdth ${face.wdth} wght ${face.wght}`,
    sizeAdjustPct: +(sizeAdjust * 100).toFixed(2),
    ascentOverridePct: +((web.ascent / sizeAdjust) * 100).toFixed(2),
    descentOverridePct: +((web.descent / sizeAdjust) * 100).toFixed(2),
    lineGapOverridePct: 0,
    metricasWeb: { ascentEm: +web.ascent.toFixed(4), descentEm: +web.descent.toFixed(4) },
    candidatos: candidatos.map((c) => ({
      local: c.local, origem: c.origem,
      razao: c.largura ? +(web.largura / c.largura).toFixed(4) : null,
    })),
  };
}

// Conferência: altura do bloco do H1 e do lead com a fonte web e com o fallback, em 390 e 1440.
const fontesCss = gerarCss(resultado, true);
const conferencia = await pagina.evaluate(async ({ css, H1, LEAD }) => {
  const st = document.createElement('style');
  st.textContent = css;
  document.head.append(st);
  await document.fonts.ready;
  const bloco = (familia, wght, wdth, larg, fs, lh, texto) => {
    const d = document.createElement('div');
    d.style.cssText = `font-family:${familia};font-weight:${wght};font-stretch:${wdth}%;width:${larg}px;font-size:${fs}px;line-height:${lh}`;
    d.textContent = texto;
    document.body.append(d);
    const h = d.getBoundingClientRect().height;
    d.remove();
    return Math.round(h * 10) / 10;
  };
  const out = {};
  // Pilha real sem a fonte web: nesta máquina a Estreita não existe e cai na "Anybody Fallback".
  const pilhaEstrutura = '"Anybody Fallback Estreita", "Anybody Fallback", sans-serif';
  for (const [nome, larg, fs] of [['390', 358, 44], ['1440', 760, 72]]) {
    out[`h1-${nome}`] = {
      web: bloco('"Web anybody"', 800, 62, larg, fs, 0.95, H1),
      fallback: bloco(pilhaEstrutura, 800, 100, larg, fs, 0.95, H1),
    };
  }
  // line-height normal: valida ascent/descent-override (altura de uma linha = ascent + descent).
  out['linha-normal-100px'] = {
    anybody: bloco('"Web anybody"', 800, 62, 4000, 100, 'normal', 'Sites'),
    anybodyFallback: bloco('"Anybody Fallback"', 800, 100, 4000, 100, 'normal', 'Sites'),
    archivo: bloco('"Web archivo"', 400, 100, 4000, 100, 'normal', 'Sou'),
    archivoFallback: bloco('"Archivo Fallback"', 400, 100, 4000, 100, 'normal', 'Sou'),
  };
  for (const [nome, larg, fs] of [['390', 358, 17], ['1440', 460, 21]]) {
    out[`lead-${nome}`] = {
      web: bloco('"Web archivo"', 400, 100, larg, fs, 1.45, LEAD),
      fallback: bloco('"Archivo Fallback"', 400, 100, larg, fs, 1.45, LEAD),
    };
  }
  return out;
}, { css: fontesCss, H1, LEAD });
await navegador.close();

const json = {
  gerado: new Date().toISOString(),
  gerador: 'scripts/metricas-fallback.mjs',
  ambiente: `Chromium ${versaoChromium}, Playwright 1.56.1, fontes @fontsource-variable@5.3.0`,
  faces: resultado,
  conferenciaAlturasPx: conferencia,
  nota: 'size-adjust vale para a referência indicada; outras faces da lista local() têm larguras diferentes (ver razao de cada candidato). Meta: CLS da troca de fonte <= 0,02.',
};
mkdirSync(join(raiz, 'src/generated'), { recursive: true });
writeFileSync(join(raiz, 'src/generated/fallback.json'), JSON.stringify(json, null, 2) + '\n');
writeFileSync(join(raiz, 'src/styles/fontes.css'), gerarCss(resultado, false));

for (const [familia, r] of Object.entries(resultado)) {
  console.log(`${familia}: size-adjust ${r.sizeAdjustPct}%, ascent ${r.ascentOverridePct}%, descent ${r.descentOverridePct}%  [ref: ${r.referencia}]`);
  for (const c of r.candidatos) console.log(`   ${c.local.padEnd(30)} ${c.razao ?? '-'}  ${c.origem}`);
}
console.log('Alturas (px) web x fallback:', JSON.stringify(conferencia));
console.log('Gravado: src/generated/fallback.json, src/styles/fontes.css');

function gerarCss(r, paraMedir) {
  const f = (familia) => r[familia];
  const locais = (lista) => lista.map((n) => `local("${n}")`).join(', ');
  const fb = (face) => {
    const v = f(face.familia);
    return `@font-face {
  font-family: "${face.familia}";${face.peso ? `\n  font-weight: ${face.peso};` : ''}
  src: ${locais(face.locais)};
  size-adjust: ${v.sizeAdjustPct}%;
  ascent-override: ${v.ascentOverridePct}%;
  descent-override: ${v.descentOverridePct}%;
  line-gap-override: 0%;
}`;
  };
  if (paraMedir) return faces.map(fb).join('\n');
  return `/* Gerado por scripts/metricas-fallback.mjs (${`Chromium ${versaoChromium}`}). Não edite à mão: rode \`npm run metricas\`.
   Fontes autohospedadas (SIL OFL 1.1; licenças em src/assets/fonts/OFL-*.txt). Seção 2.3 da direção.
   Referências das métricas: ${Object.entries(r).map(([k, v]) => `${k} → ${v.referencia}`).join('; ')}. */

/* Mesma URL nas duas faces da Anybody: o arquivo baixa uma vez (é o mesmo do preload do index.html). */
@font-face {
  font-family: "Anybody";
  font-style: normal;
  font-weight: 100 900;
  font-stretch: 50% 150%;
  font-display: swap;
  src: url(../assets/fonts/anybody-latin-wdth-normal.woff2) format("woff2");
  unicode-range: ${UNICODE_LATIN};
}
/* block: o letreiro nunca pisca em fallback; o script inline troca para .fonte-lenta em 900ms. */
@font-face {
  font-family: "Anybody Letreiro";
  font-style: normal;
  font-weight: 100 900;
  font-stretch: 50% 150%;
  font-display: block;
  src: url(../assets/fonts/anybody-latin-wdth-normal.woff2) format("woff2");
  unicode-range: ${UNICODE_LATIN};
}
@font-face {
  font-family: "Archivo";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url(../assets/fonts/archivo-latin-wght-normal.woff2) format("woff2");
  unicode-range: ${UNICODE_LATIN};
}

${faces.map(fb).join('\n')}

:root {
  --fonte-estrutura: "Anybody", "Anybody Fallback Estreita", "Anybody Fallback", sans-serif;
  --fonte-letreiro: "Anybody Letreiro", "Anybody Fallback Estreita", "Anybody Fallback", sans-serif;
  --fonte-leitura: "Archivo", "Archivo Fallback", system-ui, sans-serif;
}

/* Fonte lenta (900ms sem a Anybody): o letreiro vai para o fallback estreito, sem eixos variáveis. */
.fonte-lenta {
  --fonte-letreiro: "Anybody Fallback Estreita", "Anybody Fallback", sans-serif;
}
`;
}
