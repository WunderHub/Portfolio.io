// Menu do celular (seção 7.2): disclosure com aria-expanded. Escape fecha e devolve o foco ao botão.
// Abaixo de 960px; acima disso a navegação fica visível e o botão some (CSS).
import { animate } from 'motion';
import { EASE } from './movimento.js';

export function iniciarMenu() {
  const cab = document.querySelector('[data-cab]');
  const botao = cab?.querySelector('[data-menu-botao]');
  const nav = cab?.querySelector('[data-menu]');
  if (!botao || !nav) return undefined;

  const largo = matchMedia('(min-width: 960px)');
  let aberto = false;
  let animacao;

  function abrir() {
    aberto = true;
    cab.toggleAttribute('data-aberto', true);
    botao.setAttribute('aria-expanded', 'true');
    animacao?.stop();
    animacao = animate(nav, { opacity: [0, 1], transform: ['translateY(-8px)', 'translateY(0px)'] }, { duration: 0.24, ease: EASE });
  }

  function fechar({ devolverFoco = false } = {}) {
    if (!aberto) return;
    aberto = false;
    animacao?.stop();
    nav.style.opacity = '';
    nav.style.transform = '';
    cab.toggleAttribute('data-aberto', false);
    botao.setAttribute('aria-expanded', 'false');
    if (devolverFoco) botao.focus();
  }

  const aoClicarBotao = () => (aberto ? fechar() : abrir());
  const aoTeclar = (e) => {
    if (e.key === 'Escape' && aberto) {
      e.preventDefault();
      fechar({ devolverFoco: true });
    }
  };
  const aoClicarFora = (e) => {
    if (aberto && !cab.contains(e.target)) fechar();
  };
  const aoSairFoco = (e) => {
    if (aberto && e.relatedTarget && !cab.contains(e.relatedTarget)) fechar();
  };
  const aoClicarLink = (e) => {
    if (e.target.closest('a')) fechar();
  };
  const aoMudarLargura = () => {
    if (largo.matches) fechar();
  };

  botao.addEventListener('click', aoClicarBotao);
  document.addEventListener('keydown', aoTeclar);
  document.addEventListener('click', aoClicarFora);
  cab.addEventListener('focusout', aoSairFoco);
  nav.addEventListener('click', aoClicarLink);
  largo.addEventListener('change', aoMudarLargura);

  return () => {
    fechar();
    botao.removeEventListener('click', aoClicarBotao);
    document.removeEventListener('keydown', aoTeclar);
    document.removeEventListener('click', aoClicarFora);
    cab.removeEventListener('focusout', aoSairFoco);
    nav.removeEventListener('click', aoClicarLink);
    largo.removeEventListener('change', aoMudarLargura);
  };
}
