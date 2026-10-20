// Acontecimento de carga, o corte (seção 5.0), e vigia da fonte lenta (5.1). Frente dona: topo.
// Quando a Anybody fica pronta em até 900ms, com o palco em p=0 e sem reduced motion: para cada vão,
// com atraso de i × 90ms, a faixa especular percorre a aresta da esquerda para a direita em 520ms
// (--ease-corte) e acende a aresta atrás dela; depois a metade de baixo desce 6px na perpendicular em
// 240ms. Junto com o corte, uma faixa de luz larga (a mesma faixa especular do palco) cruza o letreiro
// inteiro, WUN, DER e HUB, da esquerda para a direita em 760ms (--ease-corte); ao sair, a faixa volta ao
// repouso acendendo a opacidade em 320ms (--ease-resposta), sem deslizar de volta. Termina em ~1,1s.
// Este módulo só anima números (animate(0, 1, { onUpdate })); quem escreve no DOM é o render.js. A rolagem (p > 0) completa tudo na hora. Reduced motion, sem JS, fonte lenta,
// volta pelo bfcache ou página aberta no meio do palco: estado final direto, sem repetir.
//
// Volta pelo histórico sem bfcache (o navegador recarrega a página): também sem repetir, pelo tipo
// de navegação 'back_forward'.
//
// Fallback do letreiro (.fonte-lenta, desktop): a face local é larga e cada glifo é comprimido no
// centro da própria célula. A escala de cada célula (--escala) é medida aqui, uma vez, pela largura do
// glifo na face que o navegador escolheu, para cada letra caber na sua célula com a mesma folga.
//
// Fonte: não confia em html.fonte-pronta. O script inline chama document.fonts.load antes de existir
// o CSS com o @font-face, e a promessa resolve na hora sem carregar nada (visto no build: fonte-pronta
// com a fonte atrasada 2,5s e fonte-lenta nunca marcada). Aqui o CSS já está aplicado (o módulo roda
// depois da folha de estilo), então document.fonts.check diz a verdade; se a Anybody não chegar em
// 900ms desde o início da navegação, este módulo marca html.fonte-lenta (letreiro no fallback estreito).
import { animate } from 'motion';
import { preferencias } from '../motion/preferencias.js';
import { easeCorte, easeResposta, dur, stagger } from '../motion/tokens.js';
import { carga, pedirQuadro, observarProgresso } from './render.js';

const LIMITE_FONTE_MS = 900;
const FONTE = '900 100px "Anybody Letreiro"';
const DUR_LUZ = 0.76; // a luz atravessa o letreiro
const DUR_ACENDE = 0.32; // a faixa reacende em repouso (2 × --dur-resposta)

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
  let ajusteFeito = false;
  let pararAjuste = () => {};
  const marcarLenta = () => {
    if (fontePronta()) return;
    raiz.classList.add('fonte-lenta');
    ajustarFallback();
  };
  if (raiz.classList.contains('fonte-lenta')) ajustarFallback();
  else if (!fontePronta()) {
    const resta = LIMITE_FONTE_MS - performance.now();
    if (resta <= 0) marcarLenta();
    else vigia = setTimeout(marcarLenta, resta);
  }

  /** --escala por célula: largura da célula / largura do glifo no fallback, com 6% de respiro. */
  function ajustarFallback() {
    if (ajusteFeito || !palco) return;
    ajusteFeito = true;
    const fachada = palco.querySelector('[data-fachada]');
    if (!fachada) return;
    const sonda = document.createElement('span');
    sonda.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap;font:inherit;font-stretch:inherit;line-height:1';
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      fachada.append(sonda);
      const corpo = parseFloat(getComputedStyle(fachada).fontSize) || 1;
      const larguras = new Map();
      for (const letra of 'WUNDERHB') {
        sonda.textContent = letra;
        larguras.set(letra, sonda.getBoundingClientRect().width / corpo);
      }
      sonda.remove();
      for (const cel of fachada.querySelectorAll('.cel')) {
        const vao = cel.closest('[data-vao]');
        const celula = parseFloat(getComputedStyle(vao).getPropertyValue(`--cel-${cel.dataset.i}`)) || 0;
        const glifo = larguras.get(cel.textContent.trim()) || 0;
        if (!celula || !glifo) continue;
        cel.style.setProperty('--escala', String(Math.min(1, Math.round(((celula * 0.94) / glifo) * 1000) / 1000)));
      }
    };
    // depois do recálculo de estilo com a classe nova; de novo se a face local terminar de carregar
    quadro = requestAnimationFrame(medir);
    const aoCarregarFonte = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    fontes?.addEventListener?.('loadingdone', aoCarregarFonte);
    pararAjuste = () => {
      cancelAnimationFrame(quadro);
      fontes?.removeEventListener?.('loadingdone', aoCarregarFonte);
      sonda.remove();
      for (const cel of fachada.querySelectorAll('.cel')) cel.style.removeProperty('--escala');
    };
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
    carga.luz = 1;
    carga.acende = 1;
    pedirQuadro();
  }

  const aoMostrarPagina = (evento) => {
    if (evento.persisted) finalizar();
  };
  window.addEventListener('pageshow', aoMostrarPagina);
  const limpar = () => {
    clearTimeout(vigia);
    window.removeEventListener('pageshow', aoMostrarPagina);
    pararAjuste();
    finalizar();
  };

  // p = 0 enquanto o topo do palco ainda não chegou ao header (a abertura ainda está na tela)
  const headerH = parseFloat(getComputedStyle(raiz).getPropertyValue('--header-h')) || 64;
  const emRepouso = palco && palco.getBoundingClientRect().top >= headerH - 1;
  const voltando = performance.getEntriesByType?.('navigation')?.[0]?.type === 'back_forward';
  const podeCorrer =
    !estatico && !preferencias.estatico && palco && emRepouso && !voltando && !raiz.classList.contains('fonte-lenta');
  if (!podeCorrer || !fontes?.load || performance.now() >= LIMITE_FONTE_MS && !fontePronta()) {
    finalizar();
    return limpar;
  }

  // Estado inicial do corte: metades encostadas, aresta apagada (o letreiro já está pintado).
  carga.fenda = [0, 0, 0];
  carga.varredura = [0, 0, 0];
  carga.luz = 0;
  carga.acende = 0;
  pedirQuadro();

  // Qualquer rolagem que tire o palco de p = 0 completa a carga na hora.
  pararProgresso = observarProgresso((p) => {
    if (p > 0) finalizar();
  });

  function correr() {
    if (encerrado) return;
    if (preferencias.estatico || raiz.classList.contains('fonte-lenta')) return finalizar();
    // a luz: entra, cruza o letreiro e sai; só então a faixa reacende em repouso
    const luz = animate(0, 1, {
      duration: DUR_LUZ,
      ease: easeCorte,
      onUpdate: (v) => {
        carga.luz = v;
        pedirQuadro();
      },
    });
    animacoes.push(luz);
    // o corte só termina quando a luz e os três vãos terminam
    const partes = [
      luz.then(() => {
        if (encerrado) return;
        const acende = animate(0, 1, {
          duration: DUR_ACENDE,
          ease: easeResposta,
          onUpdate: (v) => {
            carga.acende = v;
            pedirQuadro();
          },
        });
        animacoes.push(acende);
        return acende;
      }),
    ];
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
      partes.push(
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
          return descida;
        }),
      );
    }
    Promise.all(partes).then(() => finalizar());
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
