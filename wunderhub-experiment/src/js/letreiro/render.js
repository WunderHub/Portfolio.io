// Renderizador do palco (seção 5.1, Motores): único escritor, num único frame.render do Motion, de
//   transform das metades, das persianas e da imagem de trás, opacidade do véu, visibilidade do plano
//   de trás, --peso e --brilho da .fachada, --v (varredura da carga) das arestas e data-corte da
//   .fachada ('cortando' durante a varredura; 'pronto' depois: o CSS troca as cópias de texto da
//   aresta e do retorno pela faixa desenhada no próprio aço, mais barata para a troca de peso).
// Escreve só quando algum valor quantizado muda. Não lê layout ao desenhar (medidas vêm de medir()).
// Usado por palco.js (que entrega p) e por carga.js (que escreve os números da carga e pede um quadro).
// Frente dona: topo.
import { frame, cancelFrame } from 'motion';

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const faixa = (p, de, ate) => clamp01((p - de) / (ate - de));
const r1 = (v) => Math.round(v * 10) / 10; // 0,1px
const r3 = (v) => Math.round(v * 1000) / 1000;

// Perpendicular do corte (2.6): para baixo e para a esquerda. A metade de cima anda no sentido oposto.
const PX = -0.276;
const PY = 0.961;

/**
 * Números do acontecimento de carga (5.0), 0..1 por vão: fenda (0 = metades encostadas, 1 = 6px) e
 * varredura da aresta (0 = apagada, 1 = inteira). Valem 1 (estado final) a menos que carga.js rode.
 */
export const carga = { fenda: [1, 1, 1], varredura: [1, 1, 1] };

let ativo = null;
const ouvintesProgresso = new Set();

/** Pede um quadro ao renderizador ativo (carga.js chama a cada onUpdate). */
export function pedirQuadro() {
  ativo?.pedir();
}
/** Progresso atual do palco (0 sem renderizador ativo). */
export function progressoAtual() {
  return ativo ? ativo.p : 0;
}
/** Avisa a cada novo p entregue pelo palco. Devolve o cancelamento. */
export function observarProgresso(fn) {
  ouvintesProgresso.add(fn);
  return () => ouvintesProgresso.delete(fn);
}

/**
 * @param {HTMLElement} fachada
 * @param {{ passoPeso: () => number, fonteLenta: () => boolean }} opcoes
 */
export function criarRenderizador(fachada, { passoPeso, fonteLenta }) {
  const vaos = [...fachada.querySelectorAll('.vao')].map((vao) => ({
    fundo: vao.querySelector('.vao__fundo'),
    captura: vao.querySelector('.vao__captura'),
    veu: vao.querySelector('.vao__veu'),
    persianaCima: vao.querySelector('.vao__persiana--cima'),
    persianaBaixo: vao.querySelector('.vao__persiana--baixo'),
    metadeCima: vao.querySelector('.vao__metade--cima'),
    metadeBaixo: vao.querySelector('.vao__metade--baixo'),
    aresta: vao.querySelector('.aresta'),
  }));

  // Cache do que já foi escrito (elemento → propriedade → valor) para escrever só o que mudou.
  const escrito = new Map();
  const tocados = new Set();
  function definir(el, prop, valor) {
    if (!el) return;
    let mapa = escrito.get(el);
    if (!mapa) escrito.set(el, (mapa = new Map()));
    if (mapa.get(prop) === valor) return;
    mapa.set(prop, valor);
    tocados.add(el);
    if (prop.startsWith('data-')) el.setAttribute(prop, valor);
    else if (prop.startsWith('--')) el.style.setProperty(prop, valor);
    else el.style[prop] = valor;
  }

  let medidas = { svh: 9, torre: false };
  let p = 0;
  let pedido = null;

  function desenhar() {
    pedido = null;
    const { svh, torre } = medidas;
    const a = faixa(p, 0, 0.35); // abertura
    const w = faixa(p, 0.25, 0.8); // peso
    const b = faixa(p, 0.2, 0.85); // luz

    const cima = a * (torre ? 2 : 6) * svh;
    const abreBaixo = a * (torre ? 7 : 22) * svh;
    // Centragem lateral: o letreiro inteiro desliza na horizontal metade da diferença entre as derivas
    // das metades (sem a fenda de 6px), para a abertura ficar centrada e nenhuma letra sair da tela.
    const centra = 0.138 * (abreBaixo - cima);

    // peso quantizado (passos de 20 com ponteiro fino, 40 com toque); o fallback não é variável
    if (!fonteLenta()) {
      const minimo = torre ? 220 : 140;
      const passo = passoPeso();
      const alvo = 900 - w * (900 - minimo);
      const peso = Math.max(minimo, Math.min(900, 900 - Math.round((900 - alvo) / passo) * passo));
      definir(fachada, '--peso', String(peso));
    }
    definir(fachada, '--brilho', String(Math.round((0.15 + 0.7 * p) * 200) / 200));
    definir(fachada, 'data-corte', carga.varredura.every((v) => v >= 1) ? 'pronto' : 'cortando');

    const veu = String(Math.round(0.75 * (1 - b) * 200) / 200);
    const imagem = torre ? 'none' : `translateX(${r1(12 - 24 * b)}px) scale(${r3(1.06 - 0.06 * b)})`;

    vaos.forEach((v, i) => {
      const baixo = 6 * carga.fenda[i] + abreBaixo;
      const cascata = torre ? i * a * 9 * svh : 0;
      const xCima = r1(-PX * cima + centra);
      const xBaixo = r1(PX * baixo + centra);
      const cimaT = `translate(${xCima}px, ${r1(-PY * cima)}px)`;
      const baixoT = `translate(${xBaixo}px, ${r1(PY * baixo)}px)`;
      const cimaC = `translate(${xCima}px, ${r1(-PY * cima + cascata)}px)`;
      const baixoC = `translate(${xBaixo}px, ${r1(PY * baixo + cascata)}px)`;
      definir(v.metadeCima, 'transform', cimaC);
      definir(v.metadeBaixo, 'transform', baixoC);
      definir(v.persianaCima, 'transform', cimaT);
      definir(v.persianaBaixo, 'transform', baixoT);
      definir(v.fundo, 'transform', cascata ? `translateY(${r1(cascata)}px)` : 'none');
      // janela fechada: o plano de trás não pinta (e a captura não vira candidata a LCP antes da rolagem)
      definir(v.fundo, 'visibility', a > 0 ? 'visible' : 'hidden');
      definir(v.veu, 'opacity', veu);
      definir(v.captura, 'transform', imagem);
      definir(v.aresta, '--v', String(r3(carga.varredura[i])));
    });
  }

  const api = {
    get p() {
      return p;
    },
    /** Lê as medidas (svh em px e modo) uma vez por resize. svh = (altura da caixa + header) / 100. */
    medir() {
      const raiz = document.documentElement;
      const headerH = parseFloat(getComputedStyle(raiz).getPropertyValue('--header-h')) || 64;
      const caixa = fachada.closest('.palco__caixa');
      const altura = caixa ? caixa.getBoundingClientRect().height : 0;
      const svh = altura > 0 ? (altura + headerH) / 100 : window.innerHeight / 100;
      medidas = { svh, torre: !matchMedia('(min-width: 1024px)').matches };
      api.pedir();
    },
    escrever(novoP) {
      const q = Math.round(clamp01(novoP) * 10000) / 10000;
      if (q !== p) {
        p = q;
        for (const fn of [...ouvintesProgresso]) fn(p);
      }
      api.pedir();
    },
    pedir() {
      if (!pedido) pedido = frame.render(desenhar);
    },
    /** Para de desenhar e devolve o controle ao CSS (remove tudo o que foi escrito inline). */
    destruir() {
      if (pedido) cancelFrame(pedido);
      pedido = null;
      for (const el of tocados) {
        const mapa = escrito.get(el);
        if (!mapa) continue;
        for (const prop of mapa.keys()) {
          if (prop.startsWith('data-')) el.removeAttribute(prop);
          else if (prop.startsWith('--')) el.style.removeProperty(prop);
          else el.style[prop] = '';
        }
      }
      escrito.clear();
      tocados.clear();
      if (ativo === api) ativo = null;
    },
  };
  ativo = api;
  return api;
}
