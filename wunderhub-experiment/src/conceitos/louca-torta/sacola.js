// Sacola da Louça Torta (seção 7.3, decisão C): <dialog> lateral com itens, contadores, subtotal e prazo,
// guardada em localStorage ("louca-torta:sacola", sempre em try/catch; sem storage, fica em memória e avisa).
// Finalizar compra abre um segundo <dialog> que declara a demonstração: nada é processado nem salvo.
import { porId, ESMALTES, DISPONIBILIDADE, preco, varianteDe, urlProduto, flexao } from './dados.js';
import { aplicarFoto, SIZES } from './imagens.js';
import { pular } from './movimento.js';

const CHAVE = 'louca-torta:sacola';
const MAXIMO = 10;

function storage() {
  try {
    const teste = '__louca-torta-teste';
    window.localStorage.setItem(teste, '1');
    window.localStorage.removeItem(teste);
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Lê e valida a sacola guardada (ignora peças ou esmaltes que não existem mais). */
function lerGuardada(armazem) {
  if (!armazem) return [];
  try {
    const bruto = JSON.parse(armazem.getItem(CHAVE) || '[]');
    if (!Array.isArray(bruto)) return [];
    return bruto
      .filter((i) => i && porId[i.p] && porId[i.p].variantes.some((v) => v.esmalte === i.esmalte))
      .map((i) => ({ p: i.p, esmalte: i.esmalte, qtd: Math.min(MAXIMO, Math.max(1, Math.round(Number(i.qtd)) || 1)) }));
  } catch {
    return [];
  }
}

const chaveDe = (i) => `${i.p}|${i.esmalte}`;
const nomeCompleto = (i) => `${porId[i.p].nome}, ${ESMALTES[i.esmalte].frase}`;

const ICONE_MENOS = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M6 12h12"/></svg>';
const ICONE_MAIS = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M6 12h12M12 6v12"/></svg>';

/**
 * @param {{raiz:HTMLElement, baseProduto:string, aoIrParaPecas?:()=>void}} opcoes
 *   baseProduto: caminho relativo da página de produto a partir da página atual ("produto/" na loja, "./" no produto)
 */
export function iniciarSacola({ raiz, baseProduto, aoIrParaPecas }) {
  const dialogo = raiz.querySelector('[data-sacola]');
  const finalizacao = raiz.querySelector('[data-finalizacao]');
  const lista = dialogo.querySelector('[data-sacola-itens]');
  const anuncio = dialogo.querySelector('[data-sacola-anuncio]');
  const memoria = dialogo.querySelector('[data-sacola-memoria]');
  const rodape = dialogo.querySelector('[data-sacola-rodape]');
  const subtotal = dialogo.querySelector('[data-sacola-subtotal]');
  const titulo = dialogo.querySelector('#sacola-titulo');
  const contagens = [...raiz.querySelectorAll('[data-sacola-contagem]')];
  const botoesAbrir = [...raiz.querySelectorAll('[data-abrir-sacola]')];

  let armazem = storage();
  let itens = lerGuardada(armazem);
  let quemAbriu = null;
  let timerAnuncio = 0;

  function avisarMemoria() {
    memoria.hidden = Boolean(armazem);
    const guarda = finalizacao.querySelector('[data-finalizar-guarda]');
    if (guarda) guarda.textContent = armazem ? 'A sacola fica guardada só neste navegador.' : 'A sacola não fica salva neste navegador.';
  }

  function salvar() {
    if (!armazem) return;
    try {
      armazem.setItem(CHAVE, JSON.stringify(itens));
    } catch {
      armazem = null; // cota cheia ou storage bloqueado no meio do caminho: segue em memória
      avisarMemoria();
    }
  }

  function anunciar(texto) {
    clearTimeout(timerAnuncio);
    anuncio.textContent = '';
    // esvaziar e preencher em outro quadro faz o leitor de tela repetir frases iguais
    timerAnuncio = setTimeout(() => {
      anuncio.textContent = texto;
    }, 80);
  }

  const totalPecas = () => itens.reduce((s, i) => s + i.qtd, 0);

  function pintarContagem(animar) {
    const n = totalPecas();
    for (const c of contagens) {
      const antes = c.textContent;
      c.textContent = `(${n})`;
      if (animar && antes !== c.textContent) pular(c);
    }
  }

  function criarItem(i) {
    const produto = porId[i.p];
    const variante = varianteDe(produto, i.esmalte);
    const nome = nomeCompleto(i);
    const li = document.createElement('li');
    li.className = 'item';
    li.dataset.chave = chaveDe(i);
    li.innerHTML = `
      <div class="item__foto"><img width="1200" height="1200" alt="" decoding="async"></div>
      <div class="item__info">
        <div class="item__topo">
          <p class="item__nome"><a></a></p>
          <p class="item__total" data-item-total></p>
        </div>
        <p class="item__esmalte"></p>
        <p class="item__prazo"></p>
        <div class="item__acoes">
          <div class="contador" role="group">
            <button type="button" data-passo="-1">${ICONE_MENOS}</button>
            <output data-item-qtd></output>
            <button type="button" data-passo="1">${ICONE_MAIS}</button>
          </div>
          <button class="item__remover" type="button" data-remover>Remover<span class="sr-only"> ${nome}</span></button>
        </div>
      </div>`;
    aplicarFoto(li.querySelector('img'), variante.foto, { sizes: SIZES.sacola, alt: '' });
    const link = li.querySelector('.item__nome a');
    link.textContent = produto.nome;
    link.href = urlProduto(baseProduto, produto.id, variante.esmalte);
    li.querySelector('.item__esmalte').textContent = `${ESMALTES[variante.esmalte].nome}, ${preco(produto.preco)} cada`;
    li.querySelector('.item__prazo').textContent = variante.pronta ? DISPONIBILIDADE.pronta : DISPONIBILIDADE.encomenda;
    li.querySelector('.contador').setAttribute('aria-label', `Quantidade de ${nome}`);
    li.querySelector('[data-passo="-1"]').setAttribute('aria-label', `Diminuir ${nome}`);
    li.querySelector('[data-passo="1"]').setAttribute('aria-label', `Aumentar ${nome}`);
    return li;
  }

  function atualizarItem(li, i) {
    const produto = porId[i.p];
    li.querySelector('[data-item-qtd]').textContent = String(i.qtd);
    li.querySelector('[data-item-total]').textContent = preco(produto.preco * i.qtd);
    li.querySelector('[data-passo="-1"]').disabled = i.qtd <= 1;
    li.querySelector('[data-passo="1"]').disabled = i.qtd >= MAXIMO;
  }

  /** Reconciliação por chave: preserva o foco nos contadores enquanto a pessoa ajusta a quantidade. */
  function pintar({ animarContagem = false } = {}) {
    const existentes = new Map([...lista.children].map((li) => [li.dataset.chave, li]));
    let anterior = null;
    for (const i of itens) {
      const chave = chaveDe(i);
      let li = existentes.get(chave);
      if (!li) li = criarItem(i);
      existentes.delete(chave);
      atualizarItem(li, i);
      const esperado = anterior ? anterior.nextElementSibling : lista.firstElementChild;
      if (esperado !== li) lista.insertBefore(li, esperado);
      anterior = li;
    }
    for (const li of existentes.values()) li.remove();
    const total = itens.reduce((s, i) => s + porId[i.p].preco * i.qtd, 0);
    subtotal.textContent = preco(total);
    rodape.hidden = itens.length === 0;
    pintarContagem(animarContagem);
  }

  function mudar(novos, opcoes) {
    itens = novos;
    salvar();
    pintar(opcoes);
  }

  /** Adiciona uma peça (soma à linha que já existe, até 10). Devolve a quantidade final da linha. */
  function adicionar(id, esmalte, qtd = 1) {
    const existente = itens.find((i) => i.p === id && i.esmalte === esmalte);
    if (existente) {
      mudar(itens.map((i) => (i === existente ? { ...i, qtd: Math.min(MAXIMO, i.qtd + qtd) } : i)), { animarContagem: true });
    } else {
      mudar([...itens, { p: id, esmalte, qtd: Math.min(MAXIMO, qtd) }], { animarContagem: true });
    }
    return itens.find((i) => i.p === id && i.esmalte === esmalte).qtd;
  }

  function marcarItem(id, esmalte) {
    const li = lista.querySelector(`[data-chave="${CSS.escape(`${id}|${esmalte}`)}"]`);
    if (!li) return;
    li.classList.remove('item--novo');
    void li.offsetWidth;
    li.classList.add('item--novo');
    li.scrollIntoView({ block: 'nearest' });
  }

  function abrir({ texto, opener, destacar } = {}) {
    quemAbriu = opener || document.activeElement;
    anuncio.textContent = '';
    if (!dialogo.open) dialogo.showModal();
    titulo.focus();
    if (texto) anunciar(texto);
    if (destacar) marcarItem(destacar.p, destacar.esmalte);
  }

  function fechar() {
    if (finalizacao.open) finalizacao.close();
    if (dialogo.open) dialogo.close();
  }

  // Abrir pelo cabeçalho
  const aoAbrir = (e) => abrir({ opener: e.currentTarget });
  for (const b of botoesAbrir) b.addEventListener('click', aoAbrir);

  // Fechar: botão, "Continuar olhando", clique no fundo; Escape é nativo do <dialog>
  const aoClicar = (e) => {
    if (e.target === dialogo) {
      fechar();
      return;
    }
    const alvo = e.target.closest('button, a');
    if (!alvo || !dialogo.contains(alvo)) return;
    if (alvo.matches('[data-fechar-sacola]')) {
      fechar();
    } else if (alvo.matches('[data-finalizar]')) {
      finalizacao.showModal();
      finalizacao.querySelector('#finalizar-titulo').focus();
    } else if (alvo.matches('[data-ver-pecas]') && aoIrParaPecas) {
      e.preventDefault();
      fechar();
      aoIrParaPecas();
    } else if (alvo.matches('[data-remover]')) {
      const li = alvo.closest('.item');
      const chave = li.dataset.chave;
      const item = itens.find((i) => chaveDe(i) === chave);
      const vizinho = li.nextElementSibling || li.previousElementSibling;
      mudar(itens.filter((i) => chaveDe(i) !== chave), { animarContagem: true });
      const produto = porId[item.p];
      anunciar(`${nomeCompleto(item)}, ${flexao(produto, 'removida', 'removido')} da sacola.`);
      (vizinho?.querySelector('[data-remover]') || titulo).focus();
    } else if (alvo.matches('[data-passo]')) {
      const chave = alvo.closest('.item').dataset.chave;
      const passo = Number(alvo.dataset.passo);
      mudar(
        itens.map((i) => (chaveDe(i) === chave ? { ...i, qtd: Math.min(MAXIMO, Math.max(1, i.qtd + passo)) } : i)),
        { animarContagem: true },
      );
      // no limite o botão fica desativado: o foco passa para o outro lado do contador
      if (alvo.disabled) alvo.parentElement.querySelector(`[data-passo="${-passo}"]`)?.focus();
    }
  };
  dialogo.addEventListener('click', aoClicar);

  const aoFecharSacola = () => {
    const destino = quemAbriu && quemAbriu.isConnected && quemAbriu.offsetParent !== null ? quemAbriu : botoesAbrir.find((b) => b.offsetParent !== null);
    quemAbriu = null;
    destino?.focus({ preventScroll: true });
  };
  dialogo.addEventListener('close', aoFecharSacola);

  // Finalização declarada
  const aoClicarFinal = (e) => {
    const alvo = e.target.closest('button');
    if (e.target === finalizacao) {
      finalizacao.close();
      return;
    }
    if (!alvo) return;
    if (alvo.matches('[data-esvaziar]')) {
      mudar([], { animarContagem: true });
      finalizacao.close();
      anunciar('Sacola esvaziada.');
      titulo.focus();
    } else if (alvo.matches('[data-voltar-loja]')) {
      fechar();
    }
  };
  finalizacao.addEventListener('click', aoClicarFinal);
  const aoFecharFinal = () => {
    if (dialogo.open && !dialogo.contains(document.activeElement)) dialogo.querySelector('[data-finalizar]')?.focus();
  };
  finalizacao.addEventListener('close', aoFecharFinal);

  // Outra aba (ou a outra página, ao voltar pelo histórico) mudou a sacola
  const aoMudarStorage = (e) => {
    if (e.key !== CHAVE) return;
    itens = lerGuardada(armazem);
    pintar({ animarContagem: true });
  };
  const aoMostrar = (e) => {
    if (!e.persisted) return;
    if (armazem) itens = lerGuardada(armazem);
    pintar();
  };
  window.addEventListener('storage', aoMudarStorage);
  window.addEventListener('pageshow', aoMostrar);

  avisarMemoria();
  pintar();

  return {
    adicionar,
    abrir,
    fechar,
    get itens() {
      return itens.map((i) => ({ ...i }));
    },
    limpar() {
      for (const b of botoesAbrir) b.removeEventListener('click', aoAbrir);
      dialogo.removeEventListener('click', aoClicar);
      dialogo.removeEventListener('close', aoFecharSacola);
      finalizacao.removeEventListener('click', aoClicarFinal);
      finalizacao.removeEventListener('close', aoFecharFinal);
      window.removeEventListener('storage', aoMudarStorage);
      window.removeEventListener('pageshow', aoMostrar);
      clearTimeout(timerAnuncio);
    },
  };
}
