// Acontecimento de carga, o corte (seção 5.0), e vigia da fonte lenta (5.1). Frente dona: topo.
// Quando a Anybody fica pronta em até 900ms, com o palco em p=0 e sem reduced motion: para cada vão,
// com atraso de i × 90ms, a faixa especular percorre a aresta da esquerda para a direita em 520ms
// (--ease-corte) e acende a aresta atrás dela; depois a metade de baixo desce 6px na perpendicular em
// 240ms. Termina em 940ms. Este módulo só anima números (animate(0, 1, { onUpdate })); quem escreve no
// DOM é o render.js. A rolagem (p > 0) completa tudo na hora. Reduced motion, sem JS, fonte lenta,
// volta pelo bfcache ou página aberta no meio do palco: estado final direto, sem repetir.
//
// Fonte: não confia em html.fonte-pronta. O script inline chama document.fonts.load antes de existir
// o CSS com o @font-face, e a promessa resolve na hora sem carregar nada (visto no build: fonte-pronta
// com a fonte atrasada 2,5s e fonte-lenta nunca marcada). Aqui o CSS já está aplicado (o módulo roda
// depois da folha de estilo), então document.fonts.check diz a verdade; se a Anybody não chegar em
// 900ms desde o início da navegação, este módulo marca html.fonte-lenta (letreiro no fallback estreito).
import { animate } from 'motion';
import { preferencias } from '../motion/preferencias.js';
import { easeCorte, dur, stagger } from '../motion/tokens.js';
import { carga, pedirQuadro, observarProgresso } from './render.js';

const LIMITE_FONTE_MS = 900;
const FONTE = '900 100px "Anybody Letreiro"';

/**
 * @param {{ raiz: HTMLElement, estatico: boolean }} contexto
 * @returns {() => void}
 */
export function init({ raiz, estatico }) {
  const palco = document.querySelector('[data-palco]');
  const fontes = document.fonts;
  const fontePronta = () => !fontes?.check || fontes.check(FONTE);
  let animacoes = [];
  let encerrado = false;
  let pararProgresso = () => {};
  let vigia = 0;

  // ---------- vigia da fonte (vale com ou sem o corte) ----------
  const marcarLenta = () => {
    if (!fontePronta()) raiz.classList.add('fonte-lenta');
  };
  if (!fontePronta() && !raiz.classList.contains('fonte-lenta')) {
    const resta = LIMITE_FONTE_MS - performance.now();
    if (resta <= 0) marcarLenta();
    else vigia = setTimeout(marcarLenta, resta);
  }

  // ---------- o corte ----------
  function finalizar() {
    if (encerrado) return;
    encerrado = true;
    pararProgresso();
    for (const a of animacoes) a.complete();
    animacoes = [];
    carga.fenda = [1, 1, 1];
    carga.varredura = [1, 1, 1];
    pedirQuadro();
  }

  const aoMostrarPagina = (evento) => {
    if (evento.persisted) finalizar();
  };
  window.addEventListener('pageshow', aoMostrarPagina);
  const limpar = () => {
    clearTimeout(vigia);
    window.removeEventListener('pageshow', aoMostrarPagina);
    finalizar();
  };

  // p = 0 enquanto o topo do palco ainda não chegou ao header (a abertura ainda está na tela)
  const headerH = parseFloat(getComputedStyle(raiz).getPropertyValue('--header-h')) || 64;
  const emRepouso = palco && palco.getBoundingClientRect().top >= headerH - 1;
  const podeCorrer = !estatico && !preferencias.estatico && palco && emRepouso && !raiz.classList.contains('fonte-lenta');
  if (!podeCorrer || !fontes?.load || performance.now() >= LIMITE_FONTE_MS && !fontePronta()) {
    finalizar();
    return limpar;
  }

  // Estado inicial do corte: metades encostadas, aresta apagada (o letreiro já está pintado).
  carga.fenda = [0, 0, 0];
  carga.varredura = [0, 0, 0];
  pedirQuadro();

  // Qualquer rolagem que tire o palco de p = 0 completa a carga na hora.
  pararProgresso = observarProgresso((p) => {
    if (p > 0) finalizar();
  });

  function correr() {
    if (encerrado) return;
    if (preferencias.estatico || raiz.classList.contains('fonte-lenta')) return finalizar();
    for (let i = 0; i < 3; i++) {
      const varredura = animate(0, 1, {
        duration: dur.revelacao,
        ease: easeCorte,
        delay: i * stagger.vao,
        onUpdate: (v) => {
          carga.varredura[i] = v;
          pedirQuadro();
        },
      });
      animacoes.push(varredura);
      varredura.then(() => {
        if (encerrado) return;
        const descida = animate(0, 1, {
          duration: dur.saidaLonga,
          ease: easeCorte,
          onUpdate: (v) => {
            carga.fenda[i] = v;
            pedirQuadro();
          },
        });
        animacoes.push(descida);
        if (i === 2) descida.then(() => finalizar());
      });
    }
  }

  if (fontePronta()) {
    correr();
  } else {
    // corre só se a fonte chegar antes do prazo; no prazo, o vigia marca .fonte-lenta e encerra
    const prazo = setTimeout(finalizar, Math.max(0, LIMITE_FONTE_MS - performance.now()));
    fontes
      .load(FONTE)
      .then(() => {
        clearTimeout(prazo);
        if (fontePronta()) correr();
        else finalizar();
      })
      .catch(finalizar);
  }

  return limpar;
}
