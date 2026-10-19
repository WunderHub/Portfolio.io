#!/usr/bin/env node
// Mede a Anybody no Chromium do Playwright e grava a geometria do letreiro.
// Saídas: src/generated/letreiro.json e src/styles/generated/letreiro.css
// Uso: npm run metricas   (ou node scripts/metricas-letreiro.mjs)
// Seções da direção: 2.3, 2.4, 5.1, 5.2, 5.3 e 13.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/opt/pw-browsers';
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fonteAnybody = join(raiz, 'src/assets/fonts/anybody-latin-wdth-normal.woff2');

const GRAUS = 16;
const TAN = Math.tan((GRAUS * Math.PI) / 180); // 0,28675
const LINHA = 0.74; // altura da linha do letreiro, em em
const ALVO_TORRE = 3.0; // largura de cada andar da torre, em em
const VAOS = ['WUN', 'DER', 'HUB'];
const NOMES = {
  codea: { texto: 'Côdea', wdth: 150, wght: 850 },
  junco: { texto: 'Junco', wdth: 62, wght: 400 },
  'louca-torta': { texto: 'Louça Torta', wdth: 125, wght: 250 },
};
const ETAPAS = [ // palavra do processo: [wght, wdth]
  [100, 50], [300, 50], [560, 62], [850, 62], [900, 150],
];
// Referência da seção 13 (para conferência no terminal).
const REF = {
  palavra: 3.5756,
  letras: { W: 0.6091, U: 0.3725, N: 0.4806, D: 0.3706, E: 0.2511, R: 0.3761, H: 0.3716, B: 0.3720 },
  vaos: { WUN: 1.462, DER: 0.9975, HUB: 1.1161 },
  letras140: { W: 0.1886, U: 0.1111, N: 0.1275, D: 0.0975, E: 0.0816, R: 0.1025, H: 0.1036, B: 0.1011 },
  torre: { WUN: 110.5, DER: 144.5, HUB: 134 },
  wordmark: 10.311, h1: 8.505, codea: 5.362, louca: 7.321, landing: 11.235, loja: 3.163, h2Porta: 12.029,
  seuNegocio: [0.897, 1.509, 3.332, 4.231, 10.835],
  negocio: [0.586, 1.012, 2.247, 2.874, 7.211],
};

const r4 = (n) => Math.round(n * 1e4) / 1e4;
const r2 = (n) => Math.round(n * 100) / 100;
const em = (n) => `${r4(n)}em`;
const pct = (n) => `${r2(n)}%`;

// ---------- medição no navegador ----------
const b64 = readFileSync(fonteAnybody).toString('base64');
const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.setContent('<!doctype html><html><body style="margin:0"></body></html>');
await pagina.evaluate(async (dados) => {
  const bin = Uint8Array.from(atob(dados), (c) => c.charCodeAt(0));
  const face = new FontFace('Medida', bin.buffer, { weight: '100 900', stretch: '50% 150%' });
  await face.load();
  document.fonts.add(face);
  await document.fonts.ready;
}, b64);

const medidas = await pagina.evaluate(({ VAOS, NOMES, ETAPAS, LINHA, ALVO_TORRE }) => {
  const FS = 1000; // corpo grande para precisão sub-pixel
  const span = document.createElement('span');
  span.style.cssText = `font-family:Medida;font-size:${FS}px;white-space:pre;display:inline-block;line-height:1;font-kerning:normal`;
  document.body.append(span);
  const largura = (texto, wght, wdth, extra = '') => {
    span.style.fontWeight = wght;
    span.style.fontStretch = `${wdth}%`;
    span.style.letterSpacing = extra;
    span.textContent = texto;
    return span.getBoundingClientRect().width / FS;
  };
  const letras = (t, wght, wdth) => [...t].map((c) => largura(c, wght, wdth));
  const soma = (a) => a.reduce((x, y) => x + y, 0);

  // Caixa de linha real: div com line-height fixo, células inline-block e um marcador de base.
  const caixa = (texto, wght, wdth, lh) => {
    const d = document.createElement('div');
    d.style.cssText = `font-family:Medida;font-size:${FS}px;line-height:${lh};font-weight:${wght};font-stretch:${wdth}%;white-space:pre;position:absolute;left:0;top:0`;
    for (const c of texto) {
      const s = document.createElement('span');
      s.style.cssText = 'display:inline-block';
      s.textContent = c;
      d.append(s);
    }
    const marca = document.createElement('span');
    marca.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    d.append(marca);
    document.body.append(d);
    const rd = d.getBoundingClientRect();
    const base = (marca.getBoundingClientRect().top - rd.top) / FS;
    const altura = rd.height / FS;
    d.remove();
    return { base, altura };
  };

  // Tinta (canvas): varredura de pixels, porque actualBoundingBoxAscent vem quantizado (dá 0,6875 para
  // uma versal real de 0,675). O canvas aceita só palavras-chave de largura; a versal da Anybody não varia
  // com wdth nem com wght (conferido), então a palavra-chave mais próxima basta.
  const tela = document.createElement('canvas');
  const ctx = tela.getContext('2d', { willReadFrequently: true });
  const chaveLargura = (wdth) => (wdth <= 56 ? 'ultra-condensed' : wdth <= 68 ? 'extra-condensed' : wdth <= 81 ? 'condensed' : wdth <= 94 ? 'semi-condensed' : wdth <= 106 ? 'normal' : wdth <= 119 ? 'semi-expanded' : wdth <= 137 ? 'expanded' : 'extra-expanded');
  const tinta = (texto, wght, wdth) => {
    const larg = Math.ceil(largura(texto, wght, wdth) * FS) + 200;
    const alt = 2 * FS, base = Math.round(1.3 * FS);
    tela.width = larg; tela.height = alt;
    ctx.font = `${wght} ${FS}px Medida`;
    ctx.fontStretch = chaveLargura(wdth);
    ctx.clearRect(0, 0, larg, alt);
    ctx.fillText(texto, 100, base);
    const px = ctx.getImageData(0, 0, larg, alt).data;
    let topo = alt, fundo = -1;
    for (let y = 0; y < alt; y++) {
      for (let x = 0; x < larg; x++) {
        if (px[(y * larg + x) * 4 + 3] > 127) { if (y < topo) topo = y; fundo = y; break; }
      }
    }
    return { sobe: (base - topo) / FS, desce: (fundo + 1 - base) / FS };
  };
  ctx.font = `900 ${FS}px Medida`;
  const fm = ctx.measureText('H');

  const out = {};
  out.fonteAscent = fm.fontBoundingBoxAscent / FS;
  out.fonteDescent = fm.fontBoundingBoxDescent / FS;
  out.versal = tinta('H', 900, 50).sobe;
  out.versal140 = tinta('H', 140, 50).sobe;
  out.tintaPalavra = tinta('WUNDERHUB', 900, 50);
  out.caixaLetreiro = caixa('WUN', 900, 50, LINHA);

  out.palavra = largura('WUNDERHUB', 900, 50);
  out.letras900 = Object.fromEntries([...'WUNDERHB'].map((c) => [c, largura(c, 900, 50)]));
  out.letras140 = Object.fromEntries([...'WUNDERHB'].map((c) => [c, largura(c, 140, 50)]));
  out.vaosPalavra = Object.fromEntries(VAOS.map((v) => [v, largura(v, 900, 50)]));

  // Torre: wdth que faz a soma das células em 900 chegar a ALVO_TORRE.
  out.torre = {};
  for (const v of VAOS) {
    let lo = 50, hi = 150;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (soma(letras(v, 900, mid)) < ALVO_TORRE) lo = mid; else hi = mid;
    }
    const exato = lo;
    const wdth = Math.floor(exato * 10) / 10; // arredonda para baixo: glifo nunca maior que a célula
    const cel = letras(v, 900, wdth);
    out.torre[v] = {
      wdthExato: exato,
      wdth,
      celulas900: cel,
      somaCelulas: soma(cel),
      celulas220: letras(v, 220, wdth),
      palavra: largura(v, 900, wdth),
      versal: tinta('H', 900, wdth).sobe,
      caixa: caixa(v, 900, wdth, LINHA),
    };
  }

  // Nomes dos conceitos (caixa com line-height: 1).
  out.nomes = {};
  for (const [slug, n] of Object.entries(NOMES)) {
    const versal = tinta('H', n.wght, n.wdth).sobe;
    out.nomes[slug] = {
      largura: largura(n.texto, n.wght, n.wdth),
      caixa: caixa(n.texto, n.wght, n.wdth, 1),
      versal,
      tinta: tinta(n.texto, n.wght, n.wdth),
    };
  }

  // Palavra do processo nos 5 estados.
  out.processo = ETAPAS.map(([w, s]) => ({
    wght: w, wdth: s,
    seuNegocio: largura('SEU NEGÓCIO', w, s),
    seu: largura('SEU', w, s),
    negocio: largura('NEGÓCIO', w, s),
  }));
  out.processoCaixa = caixa('SEU NEGÓCIO', 900, 150, LINHA);

  out.outras = {
    wordmark: largura('WUNDERHUB', 800, 150),
    wordmarkComEspaco: largura('WUNDERHUB', 800, 150, '0.01em'),
    h1PrimeiraParte: largura('Sites para o seu negócio', 800, 62),
    h2Porta: largura('Vamos conversar sobre o seu site', 800, 62),
    formatoLanding: largura('Landing page', 800, 150),
    formatoSite: largura('Site', 700, 125),
    formatoInstitucional: largura('institucional', 700, 125),
    formatoLoja: largura('Loja virtual', 800, 50),
    menuComoTrabalho: largura('Como trabalho', 800, 150),
  };
  return out;
}, { VAOS, NOMES, ETAPAS, LINHA, ALVO_TORRE });
const versaoChromium = navegador.version();
await navegador.close();

// ---------- geometria ----------
// Recorta um polígono convexo pelo semiplano a*x + b*y + c <= 0 (Sutherland-Hodgman).
function recortar(pontos, a, b, c) {
  const dentro = ([x, y]) => a * x + b * y + c <= 1e-12;
  const cruza = ([x1, y1], [x2, y2]) => {
    const d1 = a * x1 + b * y1 + c, d2 = a * x2 + b * y2 + c;
    const k = d1 / (d1 - d2);
    return [x1 + (x2 - x1) * k, y1 + (y2 - y1) * k];
  };
  const out = [];
  for (let i = 0; i < pontos.length; i++) {
    const p = pontos[i], q = pontos[(i + 1) % pontos.length];
    if (dentro(p)) { out.push(p); if (!dentro(q)) out.push(cruza(p, q)); }
    else if (dentro(q)) out.push(cruza(p, q));
  }
  return out;
}
// Reta do corte: passa por (W/2, yc) e desce 16° para a direita. Acima: y < yc + (x - W/2)·tan.
const ladoDeCima = (W, yc) => [-TAN, 1, -(yc - (W / 2) * TAN)]; // -t·x + y - (yc - W/2·t) <= 0
const ladoDeBaixo = (W, yc) => [TAN, -1, yc - (W / 2) * TAN];
// x em % da largura da caixa, y em em.
const poligono = (pts, W) => `polygon(${pts.map(([x, y]) => `${pct((x / W) * 100)} ${em(y)}`).join(', ')})`;

// Convenção: a linha de letras recebe padding-top = desvio, então a versal fica centrada na caixa de .74em.
function corte(W, base, versal) {
  const desvio = LINHA / 2 - (base - versal / 2);
  const baseCentrada = base + desvio;
  const yc = LINHA / 2; // centro da versal = centro da caixa
  const topo = baseCentrada - versal;
  const y0 = yc - (W / 2) * TAN;
  const y1 = yc + (W / 2) * TAN;
  // onde a reta cruza o topo e a base da versal (em % da largura; fora de 0..100 = cruza pela lateral)
  const xTopo = W / 2 - (yc - topo) / TAN;
  const xBase = W / 2 + (baseCentrada - yc) / TAN;
  const caixa = [[0, 0], [W, 0], [W, LINHA], [0, LINHA]];
  return {
    larguraEm: r4(W),
    centroYEm: r4(yc),
    y0Em: r4(y0),
    y1Em: r4(y1),
    quedaEm: r4(W * TAN),
    cruzaVersalTopoPct: r2((xTopo / W) * 100),
    cruzaVersalBasePct: r2((xBase / W) * 100),
    poligonos: {
      cima: poligono(recortar(caixa, ...ladoDeCima(W, yc)), W),
      baixo: poligono(recortar(caixa, ...ladoDeBaixo(W, yc)), W),
    },
  };
}

// ---------- desktop (uma linha, wdth 50) ----------
const L = medidas.letras900;
const base = medidas.caixaLetreiro.base;
const versal = medidas.versal;
const desvio = LINHA / 2 - (base - versal / 2); // quanto descer o texto para centralizar a versal
let x = 0;
const linha = VAOS.map((v, i) => {
  const cel = [...v].map((c) => L[c]);
  const W = cel.reduce((a, b) => a + b, 0);
  const item = { indice: i, letras: v, wdth: 50, xEm: r4(x), celulasEm: cel.map(r4), ...corte(W, base, versal) };
  x += W;
  return item;
});
const larguraLinha = x;

// ---------- mobile (torre, wdth por andar, células escaladas para 3,0em) ----------
const torre = VAOS.map((v, i) => {
  const t = medidas.torre[v];
  const k = ALVO_TORRE / t.somaCelulas;
  const cel = t.celulas900.map((c) => c * k);
  return {
    indice: i, letras: v, wdth: t.wdth, wdthExato: r2(t.wdthExato), xEm: 0,
    somaCelulasAntesEm: r4(t.somaCelulas), escala: r4(k),
    celulasEm: cel.map(r4),
    folgaMinima220Em: r4(Math.min(...t.celulas220.map((g, j) => cel[j] - g))),
    ...corte(ALVO_TORRE, t.caixa.base, t.versal),
  };
});

// ---------- nomes partidos ----------
const LH_NOME = 1;
const nomes = Object.fromEntries(Object.entries(medidas.nomes).map(([slug, n]) => {
  const W = n.largura;
  const b = n.caixa.base;
  const yc = b - n.versal / 2;
  // caixa de recorte folgada (acentos e descendentes ficam dentro): x de -4% a 104%, y de -0,35em a 1,35em
  const caixa = [[-0.04 * W, -0.35], [1.04 * W, -0.35], [1.04 * W, LH_NOME + 0.35], [-0.04 * W, LH_NOME + 0.35]];
  const yEm = (xx) => yc + (xx - W / 2) * TAN;
  const xa = -0.04 * W, xb = 1.04 * W;
  const tira = (d0, d1) => `polygon(${pct(-4)} calc(${em(yEm(xa))} + ${d0}px), ${pct(104)} calc(${em(yEm(xb))} + ${d0}px), ${pct(104)} calc(${em(yEm(xb))} + ${d1}px), ${pct(-4)} calc(${em(yEm(xa))} + ${d1}px))`;
  return [slug, {
    texto: NOMES[slug].texto, wdth: NOMES[slug].wdth, wght: NOMES[slug].wght,
    larguraEm: r4(W), lineHeight: LH_NOME, baseEm: r4(b), versalEm: r4(n.versal), centroYEm: r4(yc),
    tintaSobeEm: r4(n.tinta.sobe), tintaDesceEm: r4(n.tinta.desce),
    poligonos: {
      cima: poligono(recortar(caixa, ...ladoDeCima(W, yc)), W),
      baixo: poligono(recortar(caixa, ...ladoDeBaixo(W, yc)), W),
      aresta: tira(-2, 0),
      retorno: tira(0, 2),
    },
  }];
}));

// ---------- JSON ----------
const json = {
  gerado: new Date().toISOString(),
  gerador: 'scripts/metricas-letreiro.mjs',
  ambiente: `Chromium ${versaoChromium}, Playwright 1.56.1, @fontsource-variable/anybody@5.3.0`,
  angulo: { graus: GRAUS, tan: r4(TAN), vetorCorte: [0.961, 0.276], perpendicular: [-0.276, 0.961] },
  fonte: {
    ascentEm: r4(medidas.fonteAscent), descentEm: r4(medidas.fonteDescent),
    versalEm: r4(versal), versal140Em: r4(medidas.versal140),
  },
  linha: {
    alturaEm: LINHA,
    caixaMedidaEm: r4(medidas.caixaLetreiro.altura),
    baseNaturalEm: r4(base),
    versalTopoNaturalEm: r4(base - versal),
    desvioEm: r4(desvio),
    baseEm: r4(base + desvio),
    versalTopoEm: r4(base + desvio - versal),
    centroVersalEm: r4(LINHA / 2),
    nota: 'Com line-height .74em a versal da Anybody fica alta (topo acima da caixa). Toda linha de letras do letreiro recebe padding-top = desvioEm (atributo data-linha no CSS gerado); as coordenadas y do corte contam do topo da caixa de .74em com a versal centrada.',
  },
  desktop: {
    modo: 'linha', wdth: 50, wght: 900, wghtMin: 140, wghtEstatico: 390,
    larguraEm: r4(larguraLinha),
    palavraComKerningEm: r4(medidas.palavra),
    letras900Em: Object.fromEntries(Object.entries(L).map(([k, v]) => [k, r4(v)])),
    letras140Em: Object.fromEntries(Object.entries(medidas.letras140).map(([k, v]) => [k, r4(v)])),
    vaos: linha,
  },
  mobile: {
    modo: 'torre', wght: 900, wghtMin: 220, wghtEstatico: 440,
    larguraAlvoEm: ALVO_TORRE,
    andares: torre,
  },
  nomes,
  processo: {
    estados: medidas.processo.map((e, i) => ({
      etapa: i + 1, wght: e.wght, wdth: e.wdth,
      seuNegocioEm: r4(e.seuNegocio), seuEm: r4(e.seu), negocioEm: r4(e.negocio),
    })),
    caixa: { alturaEm: LINHA, baseNaturalEm: r4(medidas.processoCaixa.base), desvioEm: r4(LINHA / 2 - (medidas.processoCaixa.base - versal / 2)) },
  },
  larguras: Object.fromEntries(Object.entries(medidas.outras).map(([k, v]) => [k, r4(v)])),
};

mkdirSync(join(raiz, 'src/generated'), { recursive: true });
writeFileSync(join(raiz, 'src/generated/letreiro.json'), JSON.stringify(json, null, 2) + '\n');

// ---------- CSS ----------
const blocoVao = (v) => [
  `--vao-wdth: ${v.wdth};`,
  `--vao-l: ${em(v.larguraEm)};`,
  ...(v.xEm !== undefined ? [`--vao-x: ${em(v.xEm)};`] : []),
  `--corte-y0: ${em(v.y0Em)};`,
  `--corte-y1: ${em(v.y1Em)};`,
  ...v.celulasEm.map((c, j) => `--cel-${j}: ${em(c)};`),
].join(' ');

const regras = (seletor, lista) => lista.map((v) => `${seletor} [data-vao="${v.indice}"] { ${blocoVao(v)} }`).join('\n');
const css = `/* Gerado por scripts/metricas-letreiro.mjs (${json.ambiente}).
   Não edite à mão: rode \`npm run metricas\`. Valores em em do corpo do letreiro.

   Estrutura esperada (seção 5.1):
   .letreiro.letreiro--linha | --torre | --auto   (auto: torre abaixo de 1024px, linha a partir de 1024px)
     [data-vao="0|1|2"]                            um por vão (WUN, DER, HUB)
       [data-linha]                                cada linha de letras (letras, aresta, retorno)
         .cel[data-i="0|1|2"]                      uma célula por letra, glifo centralizado
   Coordenadas do corte (--corte-y0 na borda esquerda do vão, --corte-y1 na direita) contam do topo
   da caixa de linha de .74em. As metades usam a caixa do vão ampliada por --sangria-esq e --sangria-dir
   nas laterais, --sangria-cima em cima e --sangria-baixo embaixo.
   Atenção à ordem de pintura: a sangria lateral de um vão cobre a ponta do vizinho. Sugestão: metades
   de cima com z-index decrescente (WUN acima) e metades de baixo com z-index crescente (HUB acima). */

:root {
  --corte-tan: ${r4(TAN)};
  --letreiro-linha: ${LINHA}em;
  --letreiro-versal: ${em(versal)};
  --letreiro-desvio-y: ${em(desvio)}; /* desce o texto para centralizar a versal na linha de .74em */
  --letreiro-base: ${em(base + desvio)}; /* base com o desvio aplicado */
  --letreiro-em-linha: ${r4(larguraLinha)};
  --letreiro-em-torre: ${ALVO_TORRE};
${json.processo.estados.map((e) => `  --seu-negocio-em-${e.etapa}: ${e.seuNegocioEm}; --seu-em-${e.etapa}: ${e.seuEm}; --negocio-em-${e.etapa}: ${e.negocioEm};`).join('\n')}
  --formato-landing-em: ${json.larguras.formatoLanding};
  --formato-institucional-em: ${json.larguras.formatoInstitucional};
  --formato-loja-em: ${json.larguras.formatoLoja};
  --wordmark-em: ${json.larguras.wordmarkComEspaco};
}

.letreiro {
  --sangria-esq: 64px;
  --sangria-dir: 64px;
  --sangria-cima: 0px;
  --sangria-baixo: 0px;
  line-height: var(--letreiro-linha);
}
.letreiro [data-vao] {
  font-stretch: calc(var(--vao-wdth) * 1%);
  white-space: nowrap;
}
/* Os recortes são calculados em cada elemento do vão, então uma metade pode mudar as próprias sangrias
   (ex.: .vao__metade--cima { --sangria-dir: 0px }) e o polígono acompanha. Caixa de uma metade:
   inset: calc(-1 * cima) calc(-1 * dir) calc(-1 * baixo) calc(-1 * esq), com padding igual às sangrias. */
.letreiro [data-vao],
.letreiro [data-vao] * {
  /* reta do corte nas bordas da caixa ampliada pelas sangrias */
  --corte-ya: calc(var(--sangria-cima) + var(--corte-y0) - var(--sangria-esq) * ${r4(TAN)});
  --corte-yb: calc(var(--sangria-cima) + var(--corte-y1) + var(--sangria-dir) * ${r4(TAN)});
  /* metades (estáticos, 4 pontos) */
  --clip-cima: polygon(0 0, 100% 0, 100% var(--corte-yb), 0 var(--corte-ya));
  --clip-baixo: polygon(0 var(--corte-ya), 100% var(--corte-yb), 100% 100%, 0 100%);
  /* aresta polida (2px acima do corte) e retorno (2px abaixo), na caixa do vão sem sangria */
  --clip-aresta: polygon(0 calc(var(--corte-y0) - 2px), 100% calc(var(--corte-y1) - 2px), 100% var(--corte-y1), 0 var(--corte-y0));
  --clip-retorno: polygon(0 var(--corte-y0), 100% var(--corte-y1), 100% calc(var(--corte-y1) + 2px), 0 calc(var(--corte-y0) + 2px));
}
/* Linha de letras (letras, aresta, retorno): caixa de .74em com a versal centrada. */
.letreiro [data-linha] {
  display: block;
  box-sizing: border-box;
  height: var(--letreiro-linha);
  padding-top: var(--letreiro-desvio-y);
  line-height: var(--letreiro-linha);
  white-space: nowrap;
}
.letreiro .cel { display: inline-block; text-align: center; }
.letreiro .cel[data-i="0"] { width: var(--cel-0); }
.letreiro .cel[data-i="1"] { width: var(--cel-1); }
.letreiro .cel[data-i="2"] { width: var(--cel-2); }

/* Linha: desktop e Porta (Anybody wdth 50, wght 900) */
${regras('.letreiro--linha', linha)}

/* Torre: mobile (wdth por andar, cada andar com ${ALVO_TORRE}em) */
${regras('.letreiro--torre', torre)}

@media (min-width: 1024px) {
${regras('  .letreiro--auto', linha)}
}
@media (max-width: 1023.98px) {
${regras('  .letreiro--auto', torre)}
}

/* Nomes partidos da vitrine (seção 5.2). Caixa: inline-block, white-space: nowrap, line-height: ${LH_NOME},
   largura igual à do texto. x em % da largura, y em em a partir do topo da caixa. */
${Object.entries(nomes).map(([slug, n]) => `[data-nome="${slug}"] {
  --nome-wdth: ${n.wdth}; --nome-wght: ${n.wght}; --largura-em: ${n.larguraEm};
  --clip-nome-cima: ${n.poligonos.cima};
  --clip-nome-baixo: ${n.poligonos.baixo};
  --clip-nome-aresta: ${n.poligonos.aresta};
  --clip-nome-retorno: ${n.poligonos.retorno};
}`).join('\n')}
`;
mkdirSync(join(raiz, 'src/styles/generated'), { recursive: true });
writeFileSync(join(raiz, 'src/styles/generated/letreiro.css'), css);

// ---------- conferência com a seção 13 ----------
const linhas = [];
const conf = (nome, medido, ref, tol = 0.003) => {
  const d = medido - ref;
  linhas.push(`${Math.abs(d) <= tol ? 'ok  ' : 'DIF '} ${nome.padEnd(28)} medido ${String(r4(medido)).padEnd(8)} ref ${String(ref).padEnd(8)} Δ ${r4(d)}`);
};
conf('WUNDERHUB 50/900 (células)', larguraLinha, REF.palavra);
conf('WUNDERHUB 50/900 (kerning)', medidas.palavra, REF.palavra);
for (const [k, v] of Object.entries(REF.letras)) conf(`letra ${k} 50/900`, L[k], v);
for (const [k, v] of Object.entries(REF.letras140)) conf(`letra ${k} 50/140`, medidas.letras140[k], v);
for (const v of linha) conf(`vão ${v.letras}`, v.larguraEm, REF.vaos[v.letras]);
for (const a of torre) conf(`torre ${a.letras} wdth`, a.wdth, REF.torre[a.letras], 0.6);
conf('wordmark 150/800', medidas.outras.wordmark, REF.wordmark);
conf('H1 parte 62/800', medidas.outras.h1PrimeiraParte, REF.h1);
conf('Côdea 150/850', nomes.codea.larguraEm, REF.codea);
conf('Louça Torta 125/250', nomes['louca-torta'].larguraEm, REF.louca);
conf('Landing page 150/800', medidas.outras.formatoLanding, REF.landing);
conf('Loja virtual 50/800', medidas.outras.formatoLoja, REF.loja);
conf('H2 Porta 62/800', medidas.outras.h2Porta, REF.h2Porta);
medidas.processo.forEach((e, i) => conf(`SEU NEGÓCIO etapa ${i + 1}`, e.seuNegocio, REF.seuNegocio[i]));
medidas.processo.forEach((e, i) => conf(`NEGÓCIO etapa ${i + 1}`, e.negocio, REF.negocio[i]));
console.log(linhas.join('\n'));
console.log(`\nVersal ${r4(versal)}em; base natural na caixa de .74em: ${r4(base)}em (topo da versal ${r4(base - versal)}em); desvio aplicado ${r4(desvio)}em; caixa medida ${r4(medidas.caixaLetreiro.altura)}em.`);
for (const v of linha) console.log(`linha ${v.letras}: x ${v.xEm}em, y0 ${v.y0Em}em, y1 ${v.y1Em}em, queda ${v.quedaEm}em`);
for (const a of torre) console.log(`torre ${a.letras}: wdth ${a.wdth} (exato ${a.wdthExato}), escala ${a.escala}, corte na versal ${a.cruzaVersalTopoPct}% → ${a.cruzaVersalBasePct}%, folga mín. em 220: ${a.folgaMinima220Em}em`);
console.log(`Junco 62/400: ${nomes.junco.larguraEm}em`);
console.log('Gravado: src/generated/letreiro.json, src/styles/generated/letreiro.css');
