// Acordeões (Tratamentos e Perguntas frequentes): botões com aria-expanded, um ou mais abertos.
// Sem JS, os painéis ficam abertos. Painel fechado usa hidden="until-found" onde houver suporte,
// para a busca do navegador (Ctrl+F) achar o texto e abrir o painel.
import { animate } from 'motion';
import { EASE, EASE_SAIDA } from './movimento.js';

const suportaAchar = 'onbeforematch' in document.documentElement;

function esconder(painel) {
  if (suportaAchar) painel.setAttribute('hidden', 'until-found');
  else painel.hidden = true;
}

export function iniciarAcordeoes() {
  const limpezas = [];

  for (const botao of document.querySelectorAll('[data-acordeao] [data-acordeao-botao]')) {
    const painel = document.getElementById(botao.getAttribute('aria-controls'));
    if (!painel) continue;
    const item = botao.closest('li, .faq__item');
    let animacao;

    const definir = (abrir, { animar = true } = {}) => {
      botao.setAttribute('aria-expanded', String(abrir));
      item?.classList.toggle('aberto', abrir);
      animacao?.stop();
      if (abrir) {
        painel.removeAttribute('hidden');
        if (!animar) return;
        const altura = painel.scrollHeight;
        animacao = animate(painel, { height: [0, altura], opacity: [0, 1] }, { duration: 0.38, ease: EASE });
        animacao.then(() => {
          if (botao.getAttribute('aria-expanded') === 'true') painel.style.height = '';
        });
      } else {
        if (!animar || painel.hasAttribute('hidden')) {
          esconder(painel);
          painel.style.height = '';
          painel.style.opacity = '';
          return;
        }
        const altura = painel.offsetHeight;
        animacao = animate(painel, { height: [altura, 0], opacity: [1, 0] }, { duration: 0.24, ease: EASE_SAIDA });
        animacao.then(() => {
          if (botao.getAttribute('aria-expanded') !== 'false') return;
          esconder(painel);
          painel.style.height = '';
          painel.style.opacity = '';
        });
      }
    };

    // Estado inicial: aberto se o HTML disser, ou se a âncora da URL apontar para o item.
    const alvoDaUrl = location.hash && item?.id && location.hash.slice(1) === item.id;
    definir(botao.getAttribute('aria-expanded') === 'true' || Boolean(alvoDaUrl), { animar: false });

    const aoClicar = () => definir(botao.getAttribute('aria-expanded') !== 'true');
    const aoAchar = () => definir(true, { animar: false });
    botao.addEventListener('click', aoClicar);
    painel.addEventListener('beforematch', aoAchar);
    limpezas.push(() => {
      animacao?.stop();
      botao.removeEventListener('click', aoClicar);
      painel.removeEventListener('beforematch', aoAchar);
    });
  }

  return () => limpezas.splice(0).forEach((fn) => fn());
}
