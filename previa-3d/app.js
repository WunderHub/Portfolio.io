// Prévia WunderHub: metal líquido que se solidifica no W da marca.
// Os efeitos vêm da Paper Shaders (paper.design, licença Apache 2.0), adaptados
// às cores da marca: preto, prata e laranja.

import {
  ShaderMount, liquidMetalFragmentShader, voronoiFragmentShader,
  toProcessedLiquidMetal, getShaderColorFromString as cor, getShaderNoiseTexture,
} from './vendor/paper-shaders/dist/index.js';

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const capture = location.search.includes('captura');

/* ---------- Texto ---------- */
function splitWords(el) {
  const out = document.createDocumentFragment();
  let i = 0;
  const addWord = (text, wrapEm) => {
    const w = document.createElement('span');
    w.className = 'w';
    const inner = document.createElement('span');
    inner.style.transitionDelay = `${0.2 + i++ * 0.07}s`;
    if (wrapEm) { const em = document.createElement('em'); em.textContent = text; inner.append(em); } else inner.textContent = text;
    w.append(inner);
    out.append(w, document.createTextNode(' '));
  };
  el.childNodes.forEach((n) => {
    const isEm = n.nodeName === 'EM';
    n.textContent.trim().split(/\s+/).filter(Boolean).forEach((t) => addWord(t, isEm));
  });
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  el.textContent = '';
  el.append(out);
  [...el.children].forEach((c) => c.setAttribute('aria-hidden', 'true'));
}
document.querySelectorAll('[data-words]').forEach(splitWords);


/* ---------- Painel de orçamento ---------- */
const dialog = document.getElementById('orcamento');
const form = document.querySelector('[data-form]');
const enviar = document.querySelector('[data-enviar]');
function montarLink() {
  const f = new FormData(form);
  const nome = (f.get('nome') || '').trim();
  const negocio = (f.get('negocio') || '').trim();
  const tipo = f.get('tipo') || 'ajuda para escolher o formato';
  const msg = (f.get('msg') || '').trim();
  let t = 'Olá, Kauê! Vi o site da WunderHub.';
  if (nome) t += ` Sou ${nome}${negocio ? `, de ${negocio}` : ''}.`;
  else if (negocio) t += ` Tenho ${negocio}.`;
  t += ` Quero ${tipo}.`;
  if (msg) t += ` ${msg}`;
  enviar.href = `https://wa.me/5511959300903?text=${encodeURIComponent(t)}`;
}
if (dialog && typeof dialog.showModal === 'function') {
  document.querySelectorAll('[data-open-orcamento]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    montarLink();
    dialog.showModal();
  }));
  form.addEventListener('input', montarLink);
  enviar.addEventListener('click', () => setTimeout(() => dialog.close(), 300));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
}

/* ---------- Carregador ---------- */
const loaderN = document.querySelector('[data-loader-n]');
const loaderBar = document.querySelector('[data-loader-bar]');
function runLoader() {
  return new Promise((resolve) => {
    if (reduce.matches || capture) { resolve(); return; }
    const start = performance.now(), dur = 1300;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      loaderN.textContent = String(Math.round(e * 100)).padStart(3, '0');
      loaderBar.style.transform = `scaleX(${e})`;
      t < 1 ? requestAnimationFrame(step) : resolve();
    };
    requestAnimationFrame(step);
  });
}
function reveal() {
  root.classList.add('loaded');
  requestAnimationFrame(() => root.classList.add('ready'));
}

/* ---------- Metal líquido ---------- */
const BG = '#00000000'; // fundo transparente: o metal flutua sobre a página
const parado = () => reduce.matches || capture;
const tamanho = (o = {}) => ({ u_fit: 1, u_scale: 1, u_rotation: 0, u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0, ...o });

// Valores do metal já sólido e do metal ainda derretido
const SOLIDO = { u_distortion: 0.07, u_softness: 0.1, u_repetition: 2 };
const DERRETIDO = { u_distortion: 0.55, u_softness: 0.9, u_repetition: 4.5 };

function metal(el, o) {
  return new ShaderMount(el, liquidMetalFragmentShader, {
    u_colorBack: cor(BG), u_colorTint: cor(o.tint || '#ffffff'),
    u_image: o.image || '', u_isImage: !!o.image, u_shape: o.shape ?? 0,
    u_contour: 0.4, u_shiftRed: 0.12, u_shiftBlue: 0.12, u_angle: o.angle ?? 70,
    ...SOLIDO, ...(o.u || {}),
    ...tamanho({ u_scale: o.scale ?? 1 }),
  }, undefined, parado() ? 0 : (o.speed ?? 1), o.frame ?? 0, 1, 1920 * 1080, ['u_image']);
}

const imagens = {};
async function carregarW(nome) {
  if (!imagens[nome]) {
    imagens[nome] = (async () => {
      const { pngBlob } = await toProcessedLiquidMetal(`./img/${nome}.svg`);
      const img = new Image();
      img.src = URL.createObjectURL(pngBlob);
      await img.decode();
      return img;
    })();
  }
  return imagens[nome];
}

const montados = [];
async function montarW(el, nome, extra = {}) {
  const image = await carregarW(nome);
  const laranja = nome === 'w-laranja';
  const m = metal(el, { image, tint: '#ffffff', frame: laranja ? 4000 : 0, scale: 0.92, ...extra });
  montados.push(m);
  return m;
}

// Derrete → solidifica: anima os valores do metal ao longo de `dur` ms
function solidificar(ms, dur) {
  const t0 = performance.now();
  const passo = (agora) => {
    const t = Math.min(1, (agora - t0) / dur);
    const e = 1 - Math.pow(1 - t, 3);
    const u = {};
    for (const k in SOLIDO) u[k] = DERRETIDO[k] + (SOLIDO[k] - DERRETIDO[k]) * e;
    ms.forEach((m) => m.setUniforms(u));
    if (t < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

async function montarCelulas(el) {
  const noise = getShaderNoiseTexture();
  if (noise && !noise.complete) await new Promise((r) => { noise.onload = r; noise.onerror = r; });
  montados.push(new ShaderMount(el, voronoiFragmentShader, {
    u_colors: [cor('#24272c'), cor('#3c4148'), cor('#16181c')], u_colorsCount: 3, u_stepsPerColor: 2,
    u_colorGlow: cor('#ff6a1a'), u_colorGap: cor('#ff7a2a'),
    u_distortion: 0.3, u_gap: 0.02, u_glow: 0.6, u_noiseTexture: noise,
    ...tamanho({ u_fit: 0, u_scale: 1.1 }),
  }, undefined, parado() ? 0 : 0.35, 0, 1, 1920 * 1080));
}

const hero = document.querySelector('.obra-hero');
async function montarHero() {
  const gotasEl = hero.querySelector('[data-shader="gotas"]');
  const [prataEl, laranjaEl] = hero.querySelectorAll('.m-w');
  if (parado()) {
    hero.classList.add('solido');
    await Promise.all([montarW(prataEl, 'w-prata'), montarW(laranjaEl, 'w-laranja')]);
    return;
  }
  // 1. gotas de metal líquido se movendo
  const gotas = metal(gotasEl, { shape: 4, scale: 0.75, speed: 1.4, u: { u_repetition: 3, u_softness: 0.35 } });
  // 2. o W nasce derretido, ainda invisível
  const ws = await Promise.all([
    montarW(prataEl, 'w-prata', { u: DERRETIDO }),
    montarW(laranjaEl, 'w-laranja', { u: DERRETIDO }),
  ]);
  return () => {
    // 3. as gotas se fundem no W, que esfria e endurece
    hero.classList.add('solido');
    solidificar(ws, 2600);
    setTimeout(() => gotas.dispose(), 2200);
  };
}

async function iniciar() {
  let virarW = null;
  try {
    const pronto = Promise.all([
      montarHero().then((f) => { virarW = f; }),
      ...[...document.querySelectorAll('[data-shader="gota"]')].map((el) => {
        const m = metal(el, { shape: 4, scale: 0.6, speed: 0.6, frame: 9000, u: { u_repetition: 2.5, u_softness: 0.3 } });
        montados.push(m);
      }),
      ...[...document.querySelectorAll('.obra-fim')].map(async (el) => {
        const [p, l] = el.querySelectorAll('.m-w');
        await Promise.all([montarW(p, 'w-prata', { angle: 110 }), montarW(l, 'w-laranja', { angle: 110 })]);
      }),
      ...[...document.querySelectorAll('[data-shader="celulas"]')].map(montarCelulas),
    ]);
    await Promise.all([pronto, runLoader()]);
    root.classList.add('gl');
  } catch (err) {
    console.warn('Metal líquido indisponível neste navegador:', err);
    await runLoader();
  }
  reveal();
  if (virarW) setTimeout(virarW, 1500);
  window.__whReady = true;
}

reduce.addEventListener('change', () => montados.forEach((m) => {
  if (reduce.matches) { m.__vel = m.speed; m.setSpeed(0); } else m.setSpeed(m.__vel ?? 1);
}));
iniciar();
