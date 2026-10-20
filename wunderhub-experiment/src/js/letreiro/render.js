// Renderizador do palco (seção 5.1, Motores): único escritor, num único frame.render do Motion, de
//   - transform das metades, das persianas e da imagem de trás, opacidade do véu, visibilidade do
//     plano de trás;
//   - --peso das linhas de letras ([data-linha]), escrito direto em quem o usa (ver "custo por
//     quadro" em palco.css);
//   - posição da faixa especular (o --brilho da seção 5.1), escrita como transform da .brilho (que
//     leva a máscara) e da cópia .brilho__contra, que anda ao contrário (as letras ficam paradas),
//     e a opacidade da .brilho (só o acendimento da faixa depois do corte de carga);
//   - --v (varredura da carga) das arestas e data-corte da .fachada ('cortando' durante a varredura;
//     'pronto' depois: o CSS troca as cópias de texto da aresta e do retorno pela faixa desenhada no
//     próprio aço, mais barata para a troca de peso).
// Escreve só quando algum valor quantizado muda. Não lê layout ao desenhar (medidas vêm de medir()).
// O peso troca no máximo um degrau (passoPeso) por quadro: numa rolagem muito rápida (arrastar a barra,
// fling do trackpad) ele segue p com um pequeno atraso e alcança o alvo logo depois que ela para. Cada
// degrau move a ponta esquerda das letras (centradas nas células) de 1 a 6px, e o Chromium só ignora no
// CLS o que se move menos de 3px entre dois quadros: vários degraus num quadro só viravam deslocamento
// de layout (0,1 por ida e volta em 1024); um degrau por quadro fica no ritmo de uma rolagem lenta.
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
 * Números do acontecimento de carga (5.0): por vão, fenda (0 = metades encostadas, 1 = 6px) e varredura
 * da aresta (0 = apagada, 1 = inteira); do letreiro todo, luz (0..1: a faixa especular entra pela
 * esquerda e sai pela direita, de --brilho −0,15 a 1,15) e acende (0..1: a opacidade com que a faixa
 * reaparece em repouso, sem deslizar de volta). Valem 1 (estado final) a menos que carga.js rode.
 */
export const carga = { fenda: [1, 1, 1], varredura: [1, 1, 1], luz: 1, acende: 1 };

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
  const linhas = [...fachada.querySelectorAll('[data-linha]')];
  const faixas = [...fachada.querySelectorAll('.brilho')].map((brilho) => ({
    brilho,
    mascara: brilho.querySelector('.brilho__mascara'),
    contra: brilho.querySelector('.brilho__contra'),
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

  let medidas = { svh: 9, torre: false, curso: 0 };
  let p = 0;
  let pedido = null;
  let pesoAtual = null; // peso já escrito nas linhas (null até o primeiro quadro)

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

    // peso quantizado (passo do palco.js), um degrau por quadro no máximo; o fallback não é variável
    if (!fonteLenta()) {
      const minimo = torre ? 220 : 140;
      const passo = passoPeso();
      const alvo = 900 - w * (900 - minimo);
      const pesoAlvo = Math.max(minimo, Math.min(900, 900 - Math.round((900 - alvo) / passo) * passo));
      // a primeira escrita (e a volta depois de uma pausa do modo vivo) cai direto no alvo
      if (pesoAtual === null) pesoAtual = pesoAlvo;
      else pesoAtual += Math.max(-passo, Math.min(passo, pesoAlvo - pesoAtual));
      for (const linha of linhas) definir(linha, '--peso', String(pesoAtual));
      if (pesoAtual !== pesoAlvo) api.pedir(); // ainda a caminho: mais um quadro
    }
    // faixa especular: --brilho vira deslocamento horizontal (palco.css, .brilho): a máscara anda x e a
    // cópia das letras anda −x. Só transforms (e a opacidade no acendimento): nada de aço recalculado.
    // Em repouso --brilho = 0,15 + 0,7 × p. No corte de carga (carga.luz < 1) a mesma faixa cruza o
    // letreiro de −0,15 a 1,15 junto com as arestas; ao sair, volta ao repouso acendendo a opacidade.
    const luzViva = carga.luz < 1;
    const brilho = luzViva ? -0.15 + 1.3 * carga.luz : 0.15 + 0.7 * p;
    const x = r1((brilho - 0.5) * medidas.curso);
    const acesa = luzViva ? '1' : String(r3(carga.acende));
    for (const f of faixas) {
      definir(f.brilho, 'transform', `translateX(${x}px)`);
      definir(f.brilho, 'opacity', acesa);
      definir(f.contra, 'transform', `translateX(${-x}px)`);
    }
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
    /** Lê as medidas (svh em px, modo e curso da faixa) uma vez por resize. svh = (caixa + header) / 100. */
    medir() {
      const raiz = document.documentElement;
      const headerH = parseFloat(getComputedStyle(raiz).getPropertyValue('--header-h')) || 64;
      const caixa = fachada.closest('.palco__caixa');
      const altura = caixa ? caixa.getBoundingClientRect().height : 0;
      const svh = altura > 0 ? (altura + headerH) / 100 : window.innerHeight / 100;
      // curso da faixa = largura + 0,2493 × altura da placa de aço (o tamanho da máscara, em px)
      const tamanho = faixas[0] ? getComputedStyle(faixas[0].mascara) : null;
      const [largura = 0, alturaPlaca = 0] = ((tamanho && (tamanho.maskSize || tamanho.webkitMaskSize)) || '')
        .split(' ')
        .map(parseFloat);
      medidas = { svh, torre: !matchMedia('(min-width: 1024px)').matches, curso: largura + 0.2493 * alturaPlaca };
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
