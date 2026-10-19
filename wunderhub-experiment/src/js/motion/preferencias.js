// Preferências e capacidades do visitante, num só lugar (seções 2.5, 5 e 10).
// Uso:
//   import { preferencias, subscribe, suporta } from './motion/preferencias.js';
//   if (preferencias.reduzido) …                      // leitura do estado atual
//   const parar = subscribe((p, mudou) => { … });     // chamado a cada mudança (e já na inscrição)
//   parar();                                          // na limpeza do módulo
// Mantém MotionGlobalConfig.skipAnimations igual a prefers-reduced-motion, em tempo real.
// Não lê nome de aparelho: só media queries e APIs.
import { MotionGlobalConfig } from 'motion';

const consultas = {
  reduzido: '(prefers-reduced-motion: reduce)',
  ponteiroFino: '(pointer: fine)',
  hover: '(hover: hover)',
  baixa: '(max-height: 499px)', // sem pista do palco (inclui zoom de 200% em 1440×900)
  dadosReduzidos: '(prefers-reduced-data: reduce)',
  navegacao: '(min-width: 768px)', // header completo, textura de grão
  desktop: '(min-width: 1024px)', // palco em linha, "Testar aqui"
};

const listas = {};
for (const [chave, q] of Object.entries(consultas)) {
  listas[chave] = typeof matchMedia === 'function' ? matchMedia(q) : { matches: false, addEventListener() {}, removeEventListener() {} };
}

const conexao = typeof navigator !== 'undefined' ? navigator.connection : undefined;
const raiz = document.documentElement;

function calcular() {
  const p = {};
  for (const chave of Object.keys(consultas)) p[chave] = listas[chave].matches;
  p.saveData = Boolean(conexao && conexao.saveData);
  // economia: sem texturas e sem mídia opcional pesada
  p.economia = p.saveData || p.dadosReduzidos;
  p.jsFalhou = raiz.classList.contains('js-falhou');
  // estático: palco sem pista, porta aberta, nada de deslocamento
  p.estatico = p.reduzido || p.baixa || p.jsFalhou;
  p.testarAqui = p.ponteiroFino && p.desktop;
  p.passoPeso = p.ponteiroFino ? 20 : 40;
  return Object.freeze(p);
}

let estado = calcular();
const ouvintes = new Set();

function aplicar() {
  MotionGlobalConfig.skipAnimations = estado.reduzido;
  raiz.classList.toggle('economia', estado.economia);
}
aplicar();

function atualizar() {
  const anterior = estado;
  estado = calcular();
  const mudou = Object.keys(estado).filter((k) => estado[k] !== anterior[k]);
  if (!mudou.length) return;
  aplicar();
  for (const fn of [...ouvintes]) {
    try {
      fn(estado, mudou);
    } catch (erro) {
      console.error(erro);
    }
  }
}

for (const lista of Object.values(listas)) lista.addEventListener('change', atualizar);
conexao?.addEventListener?.('change', atualizar);
// js-falhou pode ser marcado pelo teto do script inline depois que este módulo carregar
new MutationObserver(atualizar).observe(raiz, { attributes: true, attributeFilter: ['class'] });

/** Estado atual (objeto congelado; troca de identidade a cada mudança). */
export const preferencias = new Proxy({}, { get: (_, k) => estado[k], ownKeys: () => Reflect.ownKeys(estado), getOwnPropertyDescriptor: (_, k) => Reflect.getOwnPropertyDescriptor(estado, k) });

/** Retrato do estado atual. */
export const get = () => estado;

/**
 * Inscreve uma função para mudanças. Chamada já na inscrição (mudou = []) a não ser que imediato seja false.
 * @param {(estado: object, mudou: string[]) => void} fn
 * @returns {() => void} cancela a inscrição
 */
export function subscribe(fn, { imediato = true } = {}) {
  ouvintes.add(fn);
  if (imediato) fn(estado, []);
  return () => ouvintes.delete(fn);
}

/** Detecção de suporte a APIs (seção 10). */
export const suporta = Object.freeze({
  inert: typeof HTMLElement !== 'undefined' && 'inert' in HTMLElement.prototype,
  dialog: typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal === 'function',
  clipboard: Boolean(navigator.clipboard?.writeText) && window.isSecureContext,
  fontes: Boolean(document.fonts?.load),
});
