// Página Tratamentos (seção 7.2): filtros com aria-pressed refletidos em ?para= (replaceState),
// contagem viva (role="status") e estado vazio. Sem JS, a lista completa aparece com os painéis abertos.
import { animate, stagger } from 'motion';
import { EASE } from './movimento.js';
import { filtros as validos } from './dados.js';

export function init() {
  const secao = document.querySelector('[data-tratamentos]');
  if (!secao) return undefined;
  const botoes = [...secao.querySelectorAll('[data-filtros] [data-para]')];
  const lista = secao.querySelector('[data-lista]');
  const itens = [...lista.children];
  const contagem = secao.querySelector('[data-contagem]');
  const vazio = secao.querySelector('[data-vazio]');
  let animacao;

  function aplicar(valor, { animar = true, url = true } = {}) {
    for (const b of botoes) b.setAttribute('aria-pressed', String(b.dataset.para === valor));
    const visiveis = itens.filter((li) => valor === 'todos' || li.dataset.para.split(' ').includes(valor));
    for (const li of itens) li.hidden = !visiveis.includes(li);
    lista.hidden = visiveis.length === 0;
    vazio.hidden = visiveis.length > 0;
    const texto = visiveis.length === 1 ? '1 tratamento' : `${visiveis.length} tratamentos`;
    if (contagem.textContent !== texto) contagem.textContent = texto;

    if (url) {
      const endereco = new URL(location.href);
      if (valor === 'todos') endereco.searchParams.delete('para');
      else endereco.searchParams.set('para', valor);
      history.replaceState(history.state, '', endereco);
    }
    animacao?.stop();
    if (animar && visiveis.length) {
      animacao = animate(visiveis, { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] }, { duration: 0.34, ease: EASE, delay: stagger(0.045) });
    }
  }

  const aoClicar = (e) => {
    const botao = e.target.closest('[data-para]');
    if (!botao || botao.getAttribute('aria-pressed') === 'true') return;
    aplicar(botao.dataset.para);
  };
  secao.querySelector('[data-filtros]').addEventListener('click', aoClicar);

  // Estado inicial pela URL. Valor desconhecido mostra o estado vazio (nenhum filtro marcado).
  const inicial = new URLSearchParams(location.search).get('para');
  if (inicial !== null) aplicar(validos.includes(inicial) ? inicial : inicial.slice(0, 40), { animar: false, url: false });

  return () => {
    animacao?.stop();
    secao.querySelector('[data-filtros]').removeEventListener('click', aoClicar);
  };
}
