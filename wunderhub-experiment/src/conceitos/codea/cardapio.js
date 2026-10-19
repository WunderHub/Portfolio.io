// Cardápio do dia (seção 7.1, decisão B): filtros em pílula com contagem viva e estado vazio,
// botão "Adicionar" que vira contador (−, quantidade, +).
import * as estado from './estado.js';
import { MAX_POR_ITEM } from './dados.js';
import { entrarLinhas, pular, abrirContador } from './movimento.js';

const ICONE_MAIS = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
const ICONE_MENOS = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';

const primeiraMaiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

export function iniciarCardapio({ raiz, catalogo, anunciar }) {
  const lista = raiz.querySelector('[data-lista]');
  const filtros = [...raiz.querySelectorAll('[data-filtro]')];
  const contagem = raiz.querySelector('[data-contagem]');
  const vazio = raiz.querySelector('[data-vazio]');
  const porId = new Map(catalogo.map((item) => [item.id, item]));

  // Os controles só existem com JS: sem ele a lista mostra nome, descrição e preço.
  for (const item of catalogo) {
    item.acao.innerHTML = `
      <button class="adicionar" type="button" data-adicionar>${ICONE_MAIS}<span>Adicionar</span><span class="sr-only"> ${item.curto}</span></button>
      <div class="contador" role="group" aria-label="Quantidade de ${item.curto}" hidden>
        <button class="contador__botao" type="button" data-menos aria-label="Diminuir ${item.curto}">${ICONE_MENOS}</button>
        <span class="contador__qtd" data-qtd>0</span>
        <button class="contador__botao" type="button" data-mais aria-label="Aumentar ${item.curto}">${ICONE_MAIS}</button>
      </div>`;
    item.ui = {
      adicionar: item.acao.querySelector('[data-adicionar]'),
      contador: item.acao.querySelector('.contador'),
      qtd: item.acao.querySelector('[data-qtd]'),
      mais: item.acao.querySelector('[data-mais]'),
      menos: item.acao.querySelector('[data-menos]'),
    };
  }

  const aoClicar = (e) => {
    const botao = e.target.closest('button');
    if (!botao || !lista.contains(botao)) return;
    const item = porId.get(botao.closest('[data-id]')?.dataset.id);
    if (!item) return;
    if (botao.hasAttribute('data-adicionar')) estado.definir(item.id, 1, 'adicionar');
    else if (botao.hasAttribute('data-mais')) {
      if (botao.getAttribute('aria-disabled') !== 'true') estado.definir(item.id, estado.qtd(item.id) + 1, 'mais');
    } else if (botao.hasAttribute('data-menos')) estado.definir(item.id, estado.qtd(item.id) - 1, 'menos');
  };
  lista.addEventListener('click', aoClicar);

  const parar = estado.assinar(({ id, antes, depois, origem }) => {
    const item = porId.get(id);
    if (!item) return;
    const { adicionar, contador, qtd, mais } = item.ui;
    const focoNoItem = item.acao.contains(document.activeElement);
    qtd.textContent = String(depois);
    // no máximo o "+" fica aria-disabled (não disabled), para o foco não cair no body
    mais.setAttribute('aria-disabled', String(depois >= MAX_POR_ITEM));
    adicionar.hidden = depois > 0;
    contador.hidden = depois === 0;

    if (antes === 0 && depois > 0) {
      abrirContador(contador);
      if (origem === 'adicionar') mais.focus();
    } else if (depois > 0) {
      pular(qtd, depois > antes ? 1 : -1);
    } else if (focoNoItem) {
      adicionar.focus();
    }

    if (origem !== 'remover') {
      anunciar(depois > 0 ? `${primeiraMaiuscula(item.curto)}: ${depois} na encomenda.` : `${primeiraMaiuscula(item.curto)} saiu da encomenda.`);
    }
  });

  function filtrar(filtro) {
    for (const b of filtros) b.setAttribute('aria-pressed', String(b.dataset.filtro === filtro));
    let visiveis = 0;
    const voltaram = [];
    for (const item of catalogo) {
      const mostra = filtro === 'tudo' || item.categorias.includes(filtro);
      if (mostra) {
        visiveis += 1;
        if (item.el.hidden) voltaram.push(item.el);
      }
      item.el.hidden = !mostra;
    }
    contagem.textContent = estado.itensTexto(visiveis);
    vazio.hidden = visiveis > 0;
    entrarLinhas(voltaram);
  }
  const aoFiltrar = (e) => {
    const b = e.target.closest('[data-filtro]');
    if (b) filtrar(b.dataset.filtro);
  };
  const grupo = filtros[0]?.parentElement;
  grupo?.addEventListener('click', aoFiltrar);

  return () => {
    lista.removeEventListener('click', aoClicar);
    grupo?.removeEventListener('click', aoFiltrar);
    parar();
  };
}
