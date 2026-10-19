// Menu do celular (abaixo de 768px): disclosure com aria-expanded. Escape fecha e devolve o foco ao botão;
// clicar num link, fora do cabeçalho ou passar para a tela larga também fecha. Sem JS os links ficam
// visíveis numa segunda linha do cabeçalho.
export function iniciarMenu(raiz) {
  const botao = raiz.querySelector('[data-menu-botao]');
  const menu = raiz.querySelector('[data-menu]');
  const cabecalho = raiz.querySelector('[data-cabecalho]');
  if (!botao || !menu) return () => {};
  const celular = matchMedia('(max-width: 767.98px)');

  const aberto = () => botao.getAttribute('aria-expanded') === 'true';
  function abrir() {
    botao.setAttribute('aria-expanded', 'true');
    menu.setAttribute('data-aberto', '');
  }
  function fechar({ foco = false } = {}) {
    if (!aberto()) return;
    botao.setAttribute('aria-expanded', 'false');
    menu.removeAttribute('data-aberto');
    if (foco) botao.focus();
  }

  const aoClicarBotao = () => (aberto() ? fechar() : abrir());
  const aoTeclar = (e) => {
    if (e.key === 'Escape' && aberto()) {
      e.preventDefault();
      fechar({ foco: true });
    }
  };
  const aoClicarFora = (e) => {
    if (aberto() && !cabecalho.contains(e.target)) fechar();
  };
  const aoClicarLink = (e) => {
    if (e.target.closest('a')) fechar();
  };
  const aoSairFoco = (e) => {
    if (aberto() && e.relatedTarget && !cabecalho.contains(e.relatedTarget)) fechar();
  };
  const aoMudarTela = () => {
    if (!celular.matches) fechar();
  };

  botao.addEventListener('click', aoClicarBotao);
  document.addEventListener('keydown', aoTeclar);
  document.addEventListener('pointerdown', aoClicarFora);
  menu.addEventListener('click', aoClicarLink);
  cabecalho.addEventListener('focusout', aoSairFoco);
  celular.addEventListener('change', aoMudarTela);

  return () => {
    fechar();
    botao.removeEventListener('click', aoClicarBotao);
    document.removeEventListener('keydown', aoTeclar);
    document.removeEventListener('pointerdown', aoClicarFora);
    menu.removeEventListener('click', aoClicarLink);
    cabecalho.removeEventListener('focusout', aoSairFoco);
    celular.removeEventListener('change', aoMudarTela);
  };
}
