// Loja: filtros combinados (tipo, esmalte, só pronta entrega), ordenação, contagem viva e estado vazio
// (seção 7.3, decisão A). Abaixo de 1024px os mesmos controles vão para um <dialog> aberto por "Filtrar (n)".
// Com filtro de esmalte, cada cartão mostra a foto e o link da variante que combina com o filtro.
// A nota do ateliê fecha a grade só quando completa uma linha (nunca abre uma linha sozinha).
// A grade se reorganiza com FLIP (Motion); com movimento reduzido a troca é instantânea.
import { PRODUTOS, TIPOS, contarPecas } from './dados.js';
import { SIZES } from './imagens.js';
import { atualizarCartao } from './cartao.js';
import { animate, reduzido, EASE_SAIDA, surgir } from './movimento.js';

const BASE_PRODUTO = 'produto/';
const ORDEM_ORIGINAL = new Map(PRODUTOS.map((p, i) => [p.id, i]));

export function iniciarLoja({ raiz }) {
  const secao = raiz.querySelector('#pecas');
  const form = raiz.querySelector('[data-filtros-form]');
  const lateral = raiz.querySelector('[data-filtros-lateral]');
  const dialogo = raiz.querySelector('[data-filtros-dialogo]');
  const destino = dialogo.querySelector('[data-filtros-destino]');
  const grade = raiz.querySelector('[data-grade]');
  const vazio = raiz.querySelector('[data-vazio]');
  const contagem = raiz.querySelector('[data-contagem]');
  const contagemDialogo = dialogo.querySelector('[data-contagem-dialogo]');
  const verResultado = dialogo.querySelector('[data-ver-resultado]');
  const ordem = raiz.querySelector('[data-ordem]');
  const pronta = form.querySelector('[data-pronta]');
  const botaoFiltrar = raiz.querySelector('[data-abrir-filtros]');
  const rotuloFiltrar = botaoFiltrar.querySelector('[data-filtrar-rotulo]');
  const tituloDialogo = dialogo.querySelector('#filtros-dialogo-titulo');
  const telaLarga = matchMedia('(min-width: 1024px)');

  const cartoes = new Map([...grade.querySelectorAll(':scope > [data-peca]')].map((li) => [li.dataset.peca, li]));
  const nota = grade.querySelector('[data-grade-nota]');
  let totalVisivel = cartoes.size;
  // foto que o HTML estático trouxe em cada cartão (variante padrão)
  for (const p of PRODUTOS) {
    const img = cartoes.get(p.id)?.querySelector('[data-peca-foto]');
    if (img) img.dataset.foto = p.variantes[0].foto;
  }

  const animacoes = new Set();
  let ultimaContagem = contagem.textContent;

  function lerFiltros() {
    const marcados = (nome) => new Set([...form.querySelectorAll(`input[name="${nome}"]:checked`)].map((i) => i.value));
    return {
      tipos: marcados('tipo'),
      esmaltes: marcados('esmalte'),
      pronta: pronta.getAttribute('aria-checked') === 'true',
      ordem: ordem.value,
    };
  }

  const filtrosAtivos = (f) => f.tipos.size + f.esmaltes.size + (f.pronta ? 1 : 0);

  /** Primeira variante que atende aos filtros de esmalte e de pronta entrega (ou nenhuma). */
  const varianteQueCombina = (p, f) =>
    p.variantes.find((v) => (!f.esmaltes.size || f.esmaltes.has(v.esmalte)) && (!f.pronta || v.pronta));

  function resultado(f) {
    const lista = [];
    for (const p of PRODUTOS) {
      if (f.tipos.size && !f.tipos.has(p.tipo)) continue;
      const variante = varianteQueCombina(p, f);
      if (variante) lista.push({ produto: p, variante });
    }
    const porPreco = (a, b) => a.produto.preco - b.produto.preco || ORDEM_ORIGINAL.get(a.produto.id) - ORDEM_ORIGINAL.get(b.produto.id);
    if (f.ordem === 'menor') lista.sort(porPreco);
    else if (f.ordem === 'maior') lista.sort((a, b) => -porPreco(a, b));
    return lista;
  }

  function medir() {
    const r = new Map();
    for (const [id, li] of cartoes) if (!li.hidden) r.set(id, li.getBoundingClientRect());
    if (nota && !nota.hidden) r.set('nota', nota.getBoundingClientRect());
    return r;
  }

  /** A nota entra na última casa livre; se ela fosse abrir uma linha nova sozinha, fica escondida. */
  function posicionarNota() {
    if (!nota) return;
    nota.hidden = totalVisivel === 0;
    if (nota.hidden) return;
    const inicioDaLinha = Math.abs(nota.getBoundingClientRect().left - grade.getBoundingClientRect().left) < 2;
    if (inicioDaLinha) nota.hidden = true;
  }

  function aplicar({ animar = true, rolar = false } = {}) {
    const f = lerFiltros();
    const lista = resultado(f);
    const comMovimento = animar && !reduzido();

    // FLIP: posição visual antes (inclui animações em curso), depois cancela e muda o DOM
    const antes = comMovimento ? medir() : null;
    for (const a of animacoes) a.cancel();
    animacoes.clear();

    const visiveis = new Set(lista.map((r) => r.produto.id));
    const destaqueAntes = grade.querySelector('.peca--destaque')?.dataset.peca;
    const marcarVariante = f.esmaltes.size > 0 || f.pronta;
    const fotosNovas = [];

    lista.forEach(({ produto, variante }, i) => {
      const li = cartoes.get(produto.id);
      li.hidden = false;
      const destaque = i === 0;
      li.classList.toggle('peca--destaque', destaque);
      const img = li.querySelector('[data-peca-foto]');
      const sizes = destaque ? SIZES.destaque : SIZES.peca;
      if (img.getAttribute('sizes') !== sizes) img.sizes = sizes;
      const temPronta = marcarVariante ? variante.pronta : produto.variantes.some((v) => v.pronta);
      const mudou = atualizarCartao(li, produto, {
        variante,
        marcar: marcarVariante && produto.variantes.length > 1,
        pronta: temPronta,
        base: BASE_PRODUTO,
      });
      if (mudou) fotosNovas.push(img);
      grade.append(li); // ordem do DOM = ordem visual (Tab segue a grade)
    });
    if (nota) grade.append(nota);
    for (const [id, li] of cartoes) {
      if (visiveis.has(id)) continue;
      li.hidden = true;
      li.classList.remove('peca--destaque');
      grade.append(li);
    }
    totalVisivel = lista.length;
    posicionarNota();

    // Contagem, vazio, rótulos
    const texto = contarPecas(lista.length);
    if (texto !== ultimaContagem) {
      contagem.textContent = texto;
      contagemDialogo.textContent = dialogo.open ? texto : '';
      ultimaContagem = texto;
    }
    vazio.hidden = lista.length > 0;
    verResultado.textContent = lista.length ? `Ver ${texto}` : 'Fechar filtros';
    const n = filtrosAtivos(f);
    rotuloFiltrar.textContent = n ? `Filtrar (${n})` : 'Filtrar';
    botaoFiltrar.toggleAttribute('data-ativos', n > 0);
    for (const b of raiz.querySelectorAll('[data-limpar]')) b.disabled = n === 0;

    // Animação: quem já estava visível e manteve o tamanho desliza; o resto aparece
    if (comMovimento) {
      const destaqueDepois = lista[0]?.produto.id;
      lista.forEach(({ produto }, i) => {
        const li = cartoes.get(produto.id);
        const r0 = antes.get(produto.id);
        const r1 = li.getBoundingClientRect();
        const mesmoTamanho = r0 && Math.abs(r0.width - r1.width) < 1 && Math.abs(r0.height - r1.height) < 2;
        const trocouDestaque = (produto.id === destaqueAntes) !== (produto.id === destaqueDepois);
        if (r0 && mesmoTamanho && !trocouDestaque) {
          const dx = r0.left - r1.left;
          const dy = r0.top - r1.top;
          if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
          animacoes.add(
            animate(li, { transform: [`translate(${dx}px, ${dy}px)`, 'translate(0px, 0px)'] }, { duration: 0.42, ease: EASE_SAIDA }),
          );
        } else {
          animacoes.add(
            animate(li, { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] }, { duration: 0.32, delay: Math.min(i, 6) * 0.03, ease: EASE_SAIDA }),
          );
        }
      });
      if (nota && !nota.hidden) {
        const r0 = antes.get('nota');
        const r1 = nota.getBoundingClientRect();
        if (!r0) {
          animacoes.add(animate(nota, { opacity: [0, 1] }, { duration: 0.32, delay: Math.min(lista.length, 6) * 0.03, ease: EASE_SAIDA }));
        } else if (Math.abs(r0.left - r1.left) > 0.5 || Math.abs(r0.top - r1.top) > 0.5) {
          const dx = r0.left - r1.left;
          const dy = r0.top - r1.top;
          animacoes.add(animate(nota, { transform: [`translate(${dx}px, ${dy}px)`, 'translate(0px, 0px)'] }, { duration: 0.42, ease: EASE_SAIDA }));
        }
      }
      for (const img of fotosNovas) {
        const a = surgir(img);
        if (a) animacoes.add(a);
      }
    }

    if (rolar) rolarParaResultado();
  }

  function rolarParaResultado() {
    const topo = secao.getBoundingClientRect().top;
    if (topo < 0) secao.scrollIntoView({ block: 'start', behavior: reduzido() ? 'auto' : 'smooth' });
  }

  function limpar() {
    for (const i of form.querySelectorAll('input[type="checkbox"]')) i.checked = false;
    pronta.setAttribute('aria-checked', 'false');
    aplicar({ rolar: !dialogo.open });
  }

  // Mudanças nos controles
  const aoMudar = () => aplicar({ rolar: !dialogo.open });
  form.addEventListener('change', aoMudar);
  const aoAlternarPronta = () => {
    pronta.setAttribute('aria-checked', String(pronta.getAttribute('aria-checked') !== 'true'));
    aplicar({ rolar: !dialogo.open });
  };
  pronta.addEventListener('click', aoAlternarPronta);
  const aoOrdenar = () => aplicar();
  ordem.addEventListener('change', aoOrdenar);

  const aoClicar = (e) => {
    const alvo = e.target.closest('[data-limpar]');
    if (!alvo) return;
    limpar();
    // o botão de dentro do estado vazio some: o foco vai para o primeiro filtro
    if (!dialogo.open && alvo.closest('[data-vazio]')) (telaLarga.matches ? form.querySelector('input') : botaoFiltrar).focus();
  };
  raiz.addEventListener('click', aoClicar);

  // Folha de filtros (abaixo de 1024px)
  function abrirFolha() {
    destino.append(form);
    contagemDialogo.textContent = '';
    dialogo.showModal();
    tituloDialogo.focus();
  }
  function fecharFolha() {
    if (dialogo.open) dialogo.close();
  }
  const aoFecharFolha = () => {
    lateral.append(form);
    if (!telaLarga.matches) {
      botaoFiltrar.focus({ preventScroll: true });
      rolarParaResultado();
    }
  };
  botaoFiltrar.addEventListener('click', abrirFolha);
  dialogo.addEventListener('close', aoFecharFolha);
  const aoClicarFolha = (e) => {
    if (e.target === dialogo || e.target.closest('[data-fechar-filtros]')) fecharFolha();
  };
  dialogo.addEventListener('click', aoClicarFolha);
  const aoMudarTela = () => {
    if (telaLarga.matches) fecharFolha();
  };
  telaLarga.addEventListener('change', aoMudarTela);

  // A largura da grade muda o número de colunas: a nota se reposiciona (só largura; esconder a nota muda a altura)
  let larguraGrade = 0;
  const observador = new ResizeObserver(([entrada]) => {
    const largura = Math.round(entrada.contentRect.width);
    if (largura === larguraGrade) return;
    larguraGrade = largura;
    posicionarNota();
  });
  observador.observe(grade);

  // ?tipo=canecas (vem da trilha da página de produto)
  const tipoUrl = new URLSearchParams(location.search).get('tipo');
  if (tipoUrl && TIPOS[tipoUrl]) {
    const caixa = form.querySelector(`input[name="tipo"][value="${CSS.escape(tipoUrl)}"]`);
    if (caixa) caixa.checked = true;
  }
  aplicar({ animar: false });

  return {
    /** Usado pela sacola vazia: "Ver as peças" leva até a grade. */
    irParaPecas() {
      secao.scrollIntoView({ block: 'start', behavior: reduzido() ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#pecas');
      raiz.querySelector('#pecas-titulo')?.setAttribute('tabindex', '-1');
      raiz.querySelector('#pecas-titulo')?.focus({ preventScroll: true });
    },
    limpar() {
      form.removeEventListener('change', aoMudar);
      pronta.removeEventListener('click', aoAlternarPronta);
      ordem.removeEventListener('change', aoOrdenar);
      raiz.removeEventListener('click', aoClicar);
      botaoFiltrar.removeEventListener('click', abrirFolha);
      dialogo.removeEventListener('close', aoFecharFolha);
      dialogo.removeEventListener('click', aoClicarFolha);
      telaLarga.removeEventListener('change', aoMudarTela);
      observador.disconnect();
      for (const a of animacoes) a.cancel();
    },
  };
}
