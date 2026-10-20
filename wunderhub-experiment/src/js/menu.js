// Menu mobile (<768px), seção 3.4 e tabela da seção 6. Frente dona: topo.
// Sem JS, "Menu" é um link para #mapa (lista "Nesta página" do rodapé). Com JS (e <dialog> suportado),
// o link vira <button aria-haspopup="dialog" aria-controls="menu"> que abre o dialog com showModal()
// (foco preso, fundo inert e Escape nativos). O foco vai para "Fechar" (autofocus).
// Entra em 280ms (y −24px → 0, opacidade, --ease-corte); sai em 200ms (--ease-saida).
// Fechar, Escape (evento cancel) e destinos fecham com a animação de saída; nos dois primeiros o foco
// volta ao botão "Menu"; num destino, a rolagem vai para a âncora depois de fechar.
// Se a janela passar de 767px com o menu aberto, fecha sem animação. Reduced motion: sem deslocamento.
//
// Chegada às âncoras (links do header e destinos do menu): a rolagem até #servicos, #processo ou
// #contato passa por #trabalhos, e os módulos sob demanda que carregam no caminho podem mudar a altura
// do que fica acima do destino (a vitrine recolhe os painéis fechados). Durante 3s depois do clique,
// se a rolagem parar (ou a página mudar de altura) com o destino fora do lugar, rola de novo até ele.
// Qualquer gesto da pessoa (roda, toque, tecla, ponteiro) desarma a correção.
import { animate } from 'motion';
import { preferencias, suporta } from './motion/preferencias.js';
import { easeCorte, easeSaida, dur, distancia } from './motion/tokens.js';

const DURACAO_ENTRADA = 0.28;
const JANELA_CHEGADA_MS = 3000;
const GESTOS = ['wheel', 'touchstart', 'keydown', 'pointerdown'];

/** Garante que a rolagem até `alvo` termine com ele no lugar (ver cabeçalho). Devolve o desarme. */
function vigiarChegada(alvo) {
  let tentativas = 0;
  let ocioso = 0;
  let quadro = 0;
  const raiz = document.documentElement;
  const conferir = () => {
    quadro = 0;
    const esperado = parseFloat(getComputedStyle(raiz).scrollPaddingTop) || 0;
    const topo = alvo.getBoundingClientRect().top;
    const fora = Math.abs(topo - esperado) > 4;
    // no fim da página um destino abaixo do lugar não sobe mais; um destino que passou do lugar
    // (a página encolheu durante a rolagem) ainda pode voltar
    const noFim = window.scrollY >= raiz.scrollHeight - window.innerHeight - 1;
    if (!fora || (noFim && topo > esperado)) return;
    if (++tentativas > 3) return desarmar();
    alvo.scrollIntoView({ block: 'start' });
  };
  const agendar = () => {
    if (!quadro) quadro = requestAnimationFrame(conferir);
  };
  const aoRolar = () => {
    clearTimeout(ocioso);
    ocioso = setTimeout(agendar, 140);
  };
  const observador = new ResizeObserver(() => aoRolar());
  observador.observe(document.body);
  addEventListener('scroll', aoRolar, { passive: true });
  for (const gesto of GESTOS) addEventListener(gesto, desarmar, { passive: true, capture: true });
  const limite = setTimeout(desarmar, JANELA_CHEGADA_MS);
  function desarmar() {
    clearTimeout(ocioso);
    clearTimeout(limite);
    cancelAnimationFrame(quadro);
    observador.disconnect();
    removeEventListener('scroll', aoRolar);
    for (const gesto of GESTOS) removeEventListener(gesto, desarmar, { capture: true });
  }
  return desarmar;
}

/**
 * @param {{ raiz: HTMLElement }} contexto
 * @returns {() => void}
 */
export function init() {
  const dialog = document.querySelector('[data-menu]');
  const link = document.querySelector('[data-menu-gatilho]');
  if (!dialog || !link || !suporta.dialog) return () => {};

  // Troca o link #mapa por um botão com os mesmos estilos e texto.
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = link.className;
  botao.textContent = link.textContent;
  botao.setAttribute('aria-haspopup', 'dialog');
  botao.setAttribute('aria-controls', dialog.id);
  botao.setAttribute('aria-expanded', 'false');
  link.replaceWith(botao);

  const largo = matchMedia('(min-width: 768px)');
  const navHeader = document.querySelector('.header__nav');
  let animacao = null;
  let fechando = false;
  let desarmarChegada = () => {};
  const vigiar = (hash) => {
    const alvo = hash && hash.length > 1 && hash.startsWith('#') ? document.getElementById(hash.slice(1)) : null;
    desarmarChegada();
    desarmarChegada = alvo ? vigiarChegada(alvo) : () => {};
  };

  const deslocamento = () => (preferencias.reduzido ? 0 : -distancia.menu);

  function abrir() {
    if (dialog.open) return;
    animacao?.stop();
    fechando = false;
    dialog.showModal();
    botao.setAttribute('aria-expanded', 'true');
    animacao = animate(
      dialog,
      { opacity: [0, 1], transform: [`translateY(${deslocamento()}px)`, 'translateY(0px)'] },
      { duration: DURACAO_ENTRADA, ease: easeCorte },
    );
  }

  /** Fecha com a animação de saída e depois chama close(); `depois` roda já com o dialog fechado. */
  function fechar({ depois, instantaneo = false } = {}) {
    if (!dialog.open || fechando) return;
    animacao?.stop();
    const concluir = () => {
      fechando = false;
      dialog.close();
      dialog.style.opacity = '';
      dialog.style.transform = '';
      botao.setAttribute('aria-expanded', 'false');
      depois?.();
    };
    if (instantaneo) return concluir();
    fechando = true;
    animacao = animate(
      dialog,
      { opacity: 0, transform: `translateY(${deslocamento()}px)` },
      { duration: dur.saida, ease: easeSaida },
    );
    animacao.then(concluir);
  }

  const aoClicarBotao = () => abrir();
  // Escape: o cancel nativo fecharia sem animação; segura e fecha com a saída.
  const aoCancelar = (evento) => {
    evento.preventDefault();
    fechar();
  };
  const aoClicarDialog = (evento) => {
    const destino = evento.target.closest('[data-menu-destino]');
    if (destino) {
      const hash = destino.getAttribute('href');
      evento.preventDefault();
      fechar({
        depois: () => {
          const alvo = hash && hash.startsWith('#') ? document.getElementById(hash.slice(1)) : null;
          if (!alvo) return;
          // Navegação pela âncora: rola (smooth só sem reduced motion, pelo scroll-behavior do CSS)
          // e move o ponto de partida do Tab para a seção.
          if (location.hash === hash) alvo.scrollIntoView({ block: 'start' });
          else location.hash = hash;
          vigiar(hash);
        },
      });
      return;
    }
    if (evento.target.closest('[data-menu-fechar]')) fechar();
  };
  const aoMudarLargura = () => {
    if (largo.matches) fechar({ instantaneo: true });
  };
  // Links do header (≥768px): a navegação é a nativa; só vigia a chegada.
  const aoClicarHeader = (evento) => {
    const link = evento.target.closest('a[href^="#"]');
    if (link && !evento.defaultPrevented) vigiar(link.getAttribute('href'));
  };

  botao.addEventListener('click', aoClicarBotao);
  dialog.addEventListener('cancel', aoCancelar);
  dialog.addEventListener('click', aoClicarDialog);
  largo.addEventListener('change', aoMudarLargura);
  navHeader?.addEventListener('click', aoClicarHeader);

  return () => {
    desarmarChegada();
    navHeader?.removeEventListener('click', aoClicarHeader);
    animacao?.stop();
    if (dialog.open) dialog.close();
    dialog.style.opacity = '';
    dialog.style.transform = '';
    botao.removeEventListener('click', aoClicarBotao);
    dialog.removeEventListener('cancel', aoCancelar);
    dialog.removeEventListener('click', aoClicarDialog);
    largo.removeEventListener('change', aoMudarLargura);
    botao.replaceWith(link);
  };
}
