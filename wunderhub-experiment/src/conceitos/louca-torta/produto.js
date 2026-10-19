// Página de produto (seção 7.3): /produto/?p=caneca-torta&esmalte=celadon.
// Decisão B: o seletor de esmalte troca a foto principal com crossfade de 200ms (instantâneo com movimento
// reduzido), a disponibilidade e o texto "Sobre o esmalte"; a URL acompanha por replaceState.
// O HTML traz a Caneca Torta em cobalto pronta (página útil sem JS); aqui a página se monta pela URL.
import { porId, ESMALTES, TIPOS, DISPONIBILIDADE, preco, varianteDe, flexao } from './dados.js';
import { aplicarFoto, url, SIZES } from './imagens.js';
import { criarCartao } from './cartao.js';
import { animate, reduzido } from './movimento.js';

const MIN = 1;
const MAX = 10;
const TITULO = (nome) => `${nome} | Louça Torta | Conceito da WunderHub`;

export function iniciarProduto({ raiz, sacola }) {
  const area = raiz.querySelector('[data-produto]');
  const naoEncontrada = raiz.querySelector('[data-nao-encontrada]');
  const params = new URLSearchParams(location.search);
  const produto = porId[params.get('p')];

  if (!produto) {
    area.hidden = true;
    naoEncontrada.hidden = false;
    document.title = TITULO('Peça não encontrada');
    return { limpar() {} };
  }

  let variante = varianteDe(produto, params.get('esmalte'));
  const foto = raiz.querySelector('[data-foto-produto]');
  const form = raiz.querySelector('[data-compra]');
  const opcoes = raiz.querySelector('[data-esmaltes]');
  const disponibilidade = raiz.querySelector('[data-disponibilidade]');
  const sobreNome = raiz.querySelector('[data-sobre-nome]');
  const sobreTexto = raiz.querySelector('[data-sobre-texto]');
  const campo = raiz.querySelector('[data-quantidade]');
  const menos = raiz.querySelector('[data-passo="-1"]');
  const mais = raiz.querySelector('[data-passo="1"]');
  const botaoAdicionar = raiz.querySelector('[data-adicionar]');

  // Textos fixos da peça
  document.title = TITULO(produto.nome);
  raiz.querySelector('[data-nome]').textContent = produto.nome;
  raiz.querySelector('[data-preco]').textContent = preco(produto.preco);
  raiz.querySelector('[data-descricao]').textContent = produto.descricao;
  raiz.querySelector('[data-medidas]').textContent = produto.medidas;
  const trilhaTipo = raiz.querySelector('[data-trilha-tipo]');
  trilhaTipo.textContent = TIPOS[produto.tipo];
  trilhaTipo.href = `../?tipo=${produto.tipo}#pecas`;
  raiz.querySelector('[data-trilha-nome]').textContent = produto.nome;

  // Seletor de esmalte: rádios com swatch e nome visível
  opcoes.replaceChildren(
    ...produto.variantes.map((v) => {
      const rotulo = document.createElement('label');
      rotulo.className = 'amostra';
      rotulo.innerHTML = `<input class="amostra__radio" type="radio" name="esmalte"><span class="amostra__circulo bolinha" aria-hidden="true"></span><span class="amostra__nome"></span>`;
      const radio = rotulo.querySelector('input');
      radio.value = v.esmalte;
      radio.checked = v === variante;
      rotulo.querySelector('.bolinha').dataset.esmalte = v.esmalte;
      rotulo.querySelector('.amostra__nome').textContent = ESMALTES[v.esmalte].nome;
      return rotulo;
    }),
  );

  // Foto principal: a do HTML vira a da variante pedida (sem animação na carga)
  const fotoInicial = foto.querySelector('[data-foto-principal]');
  if (fotoInicial.dataset.foto !== variante.foto) aplicarFoto(fotoInicial, variante.foto, { sizes: SIZES.produto, alt: variante.alt });

  function pintarVariante() {
    disponibilidade.textContent = variante.pronta ? DISPONIBILIDADE.pronta : DISPONIBILIDADE.encomenda;
    disponibilidade.dataset.pronta = String(variante.pronta);
    sobreNome.textContent = `${ESMALTES[variante.esmalte].nome}.`;
    sobreTexto.textContent = ESMALTES[variante.esmalte].sobre;
  }

  function sincronizarUrl() {
    const nova = `?p=${encodeURIComponent(produto.id)}&esmalte=${encodeURIComponent(variante.esmalte)}`;
    if (location.search !== nova) history.replaceState(history.state, '', nova + location.hash);
  }

  // Crossfade de 200ms: a nova foto entra por cima da atual e a atual sai do DOM no fim
  let troca = 0;
  async function trocarFoto() {
    const minha = ++troca;
    const camadas = [...foto.querySelectorAll('img')];
    const atual = camadas.at(-1);
    const nova = document.createElement('img');
    nova.width = 1200;
    nova.height = 1200;
    nova.decoding = 'async';
    nova.dataset.fotoPrincipal = '';
    aplicarFoto(nova, variante.foto, { sizes: SIZES.produto, alt: variante.alt });
    nova.style.opacity = '0';
    foto.append(nova);
    try {
      await nova.decode();
    } catch {
      /* a foto ainda chega; o crossfade segue */
    }
    if (minha !== troca) {
      nova.remove();
      return;
    }
    const fim = () => {
      nova.style.opacity = '';
      for (const c of foto.querySelectorAll('img')) if (c !== nova) c.remove();
    };
    if (reduzido()) {
      fim();
      return;
    }
    // a foto anterior fica marcada como decorativa durante a troca: o leitor só ouve a nova
    atual?.setAttribute('alt', '');
    await animate(nova, { opacity: [0, 1] }, { duration: 0.2, ease: 'linear' }).finished.catch(() => {});
    if (minha === troca) fim();
  }

  const aoTrocarEsmalte = (e) => {
    if (!e.target.matches('input[name="esmalte"]')) return;
    variante = varianteDe(produto, e.target.value);
    pintarVariante();
    sincronizarUrl();
    trocarFoto();
  };
  opcoes.addEventListener('change', aoTrocarEsmalte);

  // Quantidade de 1 a 10
  const lerQtd = () => Math.min(MAX, Math.max(MIN, Math.round(Number(campo.value)) || MIN));
  function pintarQtd(valor) {
    campo.value = String(valor);
    menos.disabled = valor <= MIN;
    mais.disabled = valor >= MAX;
  }
  const aoPasso = (e) => {
    const b = e.currentTarget;
    pintarQtd(Math.min(MAX, Math.max(MIN, lerQtd() + Number(b.dataset.passo))));
    if (b.disabled) (b === menos ? mais : menos).focus();
  };
  menos.addEventListener('click', aoPasso);
  mais.addEventListener('click', aoPasso);
  const aoDigitar = () => {
    if (campo.value === '') return; // deixa a pessoa apagar e digitar de novo
    const v = lerQtd();
    menos.disabled = v <= MIN;
    mais.disabled = v >= MAX;
  };
  const aoSairDoCampo = () => pintarQtd(lerQtd());
  campo.addEventListener('input', aoDigitar);
  campo.addEventListener('change', aoSairDoCampo);

  // Adicionar à sacola: abre a sacola e anuncia
  const aoEnviar = (e) => {
    e.preventDefault();
    const qtd = lerQtd();
    pintarQtd(qtd);
    sacola.adicionar(produto.id, variante.esmalte, qtd);
    sacola.abrir({
      texto: `${produto.nome}, ${ESMALTES[variante.esmalte].frase}, ${flexao(produto, 'adicionada', 'adicionado')} à sacola.`,
      opener: botaoAdicionar,
      destacar: { p: produto.id, esmalte: variante.esmalte },
    });
  };
  form.addEventListener('submit', aoEnviar);

  // Combina com: três peças
  const combina = raiz.querySelector('[data-combina]');
  combina.replaceChildren(...produto.combina.map((id) => criarCartao(porId[id], { base: './', sizes: SIZES.combina })));

  // As outras variantes ficam no cache quando o navegador estiver livre: a troca de esmalte fica imediata
  const ocioso = window.requestIdleCallback || ((fn) => setTimeout(fn, 600));
  const cancelarOcioso = window.cancelIdleCallback || clearTimeout;
  const preCarga = ocioso(() => {
    const largura = matchMedia('(min-width: 1024px)').matches ? 1200 : window.devicePixelRatio > 1.5 ? 1200 : 600;
    for (const v of produto.variantes) {
      if (v === variante) continue;
      const img = new Image();
      img.decoding = 'async';
      img.src = url(v.foto, largura);
    }
  });

  pintarVariante();
  pintarQtd(lerQtd());
  sincronizarUrl();

  return {
    limpar() {
      opcoes.removeEventListener('change', aoTrocarEsmalte);
      menos.removeEventListener('click', aoPasso);
      mais.removeEventListener('click', aoPasso);
      campo.removeEventListener('input', aoDigitar);
      campo.removeEventListener('change', aoSairDoCampo);
      form.removeEventListener('submit', aoEnviar);
      cancelarOcioso(preCarga);
    },
  };
}
