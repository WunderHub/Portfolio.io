// Menu mobile (<768px), seção 3.4 e tabela da seção 6. Frente dona: topo.
// Sem JS, "Menu" é um link para #mapa (lista "Nesta página" do rodapé). Com JS (e <dialog> suportado),
// o link vira <button aria-haspopup="dialog" aria-controls="menu"> que abre o dialog com showModal()
// (foco preso, fundo inert e Escape nativos). O foco vai para "Fechar" (autofocus).
// Entra em 280ms (y −24px → 0, opacidade, --ease-corte); sai em 200ms (--ease-saida).
// Fechar, Escape (evento cancel) e destinos fecham com a animação de saída; nos dois primeiros o foco
// volta ao botão "Menu"; num destino, a rolagem vai para a âncora depois de fechar.
// Se a janela passar de 767px com o menu aberto, fecha sem animação. Reduced motion: sem deslocamento.
import { animate } from 'motion';
import { preferencias, suporta } from './motion/preferencias.js';
import { easeCorte, easeSaida, dur, distancia } from './motion/tokens.js';

const DURACAO_ENTRADA = 0.28;

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
  let animacao = null;
  let fechando = false;

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
        },
      });
      return;
    }
    if (evento.target.closest('[data-menu-fechar]')) fechar();
  };
  const aoMudarLargura = () => {
    if (largo.matches) fechar({ instantaneo: true });
  };

  botao.addEventListener('click', aoClicarBotao);
  dialog.addEventListener('cancel', aoCancelar);
  dialog.addEventListener('click', aoClicarDialog);
  largo.addEventListener('change', aoMudarLargura);

  return () => {
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
