// Cartão de peça (grade da loja e "Combina com"). O HTML estático da loja tem a mesma estrutura;
// aqui ele é criado (Combina com) ou atualizado (variante em destaque quando há filtro de esmalte).
import { ESMALTES, preco, listar, urlProduto } from './dados.js';
import { aplicarFoto } from './imagens.js';

function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

/**
 * Cria o <li class="peca"> de uma peça.
 * @param {object} produto
 * @param {{base:string, sizes:string, variante?:object, lazy?:boolean}} opcoes base = caminho da página de produto ("produto/" ou "./")
 */
export function criarCartao(produto, { base, sizes, variante = produto.variantes[0], lazy = true }) {
  const li = el('li', 'peca');
  li.dataset.peca = produto.id;
  const artigo = el('article', 'peca__cartao');

  const foto = el('div', 'peca__foto');
  const img = document.createElement('img');
  img.width = 1200;
  img.height = 1200;
  img.decoding = 'async';
  if (lazy) img.loading = 'lazy';
  img.dataset.pecaFoto = '';
  aplicarFoto(img, variante.foto, { sizes, alt: '' });
  foto.append(img);

  const info = el('div', 'peca__info');
  const nome = el('h3', 'peca__nome');
  const link = el('a', '', produto.nome);
  link.href = urlProduto(base, produto.id, variante.esmalte);
  link.dataset.pecaLink = '';
  nome.append(link);

  const valor = el('p', 'peca__preco', preco(produto.preco));
  const descricao = el('p', 'peca__descricao', produto.descricao);

  const esmaltes = el('p', 'peca__esmaltes');
  const nomes = produto.variantes.map((v) => ESMALTES[v.esmalte].frase);
  esmaltes.append(el('span', 'sr-only', `${nomes.length > 1 ? 'Esmaltes' : 'Esmalte'}: ${listar(nomes)}.`));
  const bolinhas = el('span', 'bolinhas');
  bolinhas.setAttribute('aria-hidden', 'true');
  for (const v of produto.variantes) {
    const b = el('span', 'bolinha');
    b.dataset.esmalte = v.esmalte;
    bolinhas.append(b);
  }
  esmaltes.append(bolinhas);

  const pronta = el('p', 'peca__pronta', 'Pronta entrega');
  pronta.dataset.pecaPronta = '';
  pronta.hidden = !produto.variantes.some((v) => v.pronta);

  info.append(nome, valor, descricao, esmaltes, pronta);
  artigo.append(foto, info);
  li.append(artigo);
  return li;
}

/**
 * Atualiza um cartão para mostrar uma variante (foto, link, bolinha marcada e "Pronta entrega").
 * @param {HTMLElement} li
 * @param {object} produto
 * @param {{variante:object, marcar:boolean, pronta:boolean, base:string}} opcoes
 * @returns {boolean} true quando a foto mudou
 */
export function atualizarCartao(li, produto, { variante, marcar, pronta, base }) {
  const img = li.querySelector('[data-peca-foto]');
  const link = li.querySelector('[data-peca-link]');
  let mudouFoto = false;
  // data-foto é marcado na carga (foto do HTML estático) e a cada troca
  if (img && img.dataset.foto !== variante.foto) {
    aplicarFoto(img, variante.foto);
    mudouFoto = true;
  }
  if (link) link.href = urlProduto(base, produto.id, variante.esmalte);
  for (const b of li.querySelectorAll('.bolinha')) b.toggleAttribute('data-destaque', marcar && b.dataset.esmalte === variante.esmalte);
  const etiqueta = li.querySelector('[data-peca-pronta]');
  if (etiqueta) etiqueta.hidden = !pronta;
  return mudouFoto;
}
