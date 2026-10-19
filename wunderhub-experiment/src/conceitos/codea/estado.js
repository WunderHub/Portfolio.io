// Encomenda em memória (não persiste, seção 7.1) e leitura do cardápio a partir do HTML.
import { MAX_POR_ITEM } from './dados.js';

const quantidades = new Map();
const ouvintes = new Set();

export const qtd = (id) => quantidades.get(id) || 0;

/** Define a quantidade de um item (0 a MAX_POR_ITEM) e avisa os ouvintes. origem: 'adicionar' | 'mais' | 'menos' | 'remover'. */
export function definir(id, n, origem) {
  const depois = Math.max(0, Math.min(MAX_POR_ITEM, n));
  const antes = qtd(id);
  if (depois === antes) return;
  if (depois) quantidades.set(id, depois);
  else quantidades.delete(id);
  for (const fn of [...ouvintes]) fn({ id, antes, depois, origem });
}

export function assinar(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

/** Lê os itens do cardápio do HTML (fonte única). */
export function lerCatalogo(lista) {
  return [...lista.querySelectorAll('[data-id]')].map((el) => ({
    id: el.dataset.id,
    el,
    nome: el.querySelector('.item__nome').textContent.trim(),
    preco: Number(el.dataset.preco),
    categorias: el.dataset.categorias.split(/\s+/),
    curto: el.dataset.curto,
    um: el.dataset.um,
    varios: el.dataset.varios,
    acao: el.querySelector('[data-acao]'),
  }));
}

const numero = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** "R$ 42,00" com espaço inseparável (na tela) ou comum (na mensagem). */
export const moeda = (valor, espaco = ' ') => `R$${espaco}${numero.format(valor)}`;
export const itensTexto = (n) => (n === 1 ? '1 item' : `${n} itens`);
