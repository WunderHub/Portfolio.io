// Sua encomenda (seção 7.1, decisão C): itens e total, dia e faixa de retirada com datas calculadas,
// validação do nome, mensagem pronta e cópia. Nada é enviado: o resultado diz que é demonstração.
// No celular e no tablet, uma barra fixa embaixo resume a encomenda e leva até ela.
import * as estado from './estado.js';
import { FAIXAS, PRAZO_ENCOMENDA } from './dados.js';
import { minutosDoDia, somarDias, rotuloData, chaveDia } from './relogio.js';
import { aparecer, mostrarBarra, esconderBarra, reduzido } from './movimento.js';

const ICONE_REMOVER = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
const NOTA_DEMO = 'Demonstração: num site real, este botão abriria o WhatsApp da padaria com esta mensagem. Aqui nada é enviado.';
const ERRO_NOME = 'erro-nome';
const ERRO_FAIXA = 'erro-faixa';

const escapar = (t) => t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function iniciarEncomenda({ raiz, catalogo, anunciar }) {
  const html = document.documentElement;
  const secao = raiz.querySelector('#encomenda');
  const titulo = secao.querySelector('#encomenda-titulo');
  const vazia = secao.querySelector('[data-vazia]');
  const form = secao.querySelector('[data-form]');
  const linhas = secao.querySelector('[data-linhas]');
  const notaPrazo = secao.querySelector('[data-nota-prazo]');
  const diasInputs = [...secao.querySelectorAll('input[name="dia"]')];
  const campoFaixa = secao.querySelector('[data-campo-faixa]');
  const faixaTarde = secao.querySelector('[data-faixa-tarde]');
  const notaDomingo = secao.querySelector('[data-nota-domingo]');
  const erroFaixa = secao.querySelector('[data-erro-faixa]');
  const nome = secao.querySelector('#nome');
  const erroNome = secao.querySelector('[data-erro-nome]');
  const totalValor = secao.querySelector('[data-total-valor]');
  const status = secao.querySelector('[data-resultado-status]');
  const copiar = secao.querySelector('[data-copiar]');
  const copiarTexto = secao.querySelector('[data-copiar-texto]');
  const barra = raiz.querySelector('[data-barra-encomenda]');
  const resumo = raiz.querySelector('[data-resumo]');
  const ver = raiz.querySelector('[data-ver-encomenda]');
  const desktop = matchMedia('(min-width: 1024px)');

  let mensagem = '';
  let totalItens = 0;
  let datas = {}; // { '1': Date, '2': Date }
  let diaAtual = '';
  let depoisDoPrazo = null;
  let secaoNaTela = false;
  let barraVisivel = false;
  let timerCopia = 0;

  const escolhidos = () => catalogo.filter((item) => estado.qtd(item.id) > 0);
  const total = () => escolhidos().reduce((soma, item) => soma + item.preco * estado.qtd(item.id), 0);

  // ---------- resultado ----------
  function limparResultado() {
    if (!mensagem && status.childElementCount === 0) return;
    mensagem = '';
    status.replaceChildren();
    copiar.hidden = true;
    restaurarCopiar();
  }
  function restaurarCopiar() {
    clearTimeout(timerCopia);
    delete copiar.dataset.copiado;
    copiarTexto.textContent = 'Copiar mensagem';
  }

  // ---------- itens, total e barra ----------
  function pintarItens() {
    const itens = escolhidos();
    totalItens = itens.reduce((n, item) => n + estado.qtd(item.id), 0);
    const valor = total();
    vazia.hidden = itens.length > 0;
    form.hidden = itens.length === 0;
    linhas.innerHTML = itens
      .map((item) => {
        const q = estado.qtd(item.id);
        return `<li class="linha" data-linha="${item.id}">
          <span class="linha__qtd">${q}×</span>
          <span class="linha__nome">${escapar(item.nome)}</span>
          <span class="linha__preco">${estado.moeda(item.preco * q)}</span>
          <button class="linha__remover" type="button" data-remover aria-label="Remover ${escapar(item.curto)} da encomenda">${ICONE_REMOVER}</button>
        </li>`;
      })
      .join('');
    totalValor.textContent = estado.moeda(valor);
    resumo.textContent = `${estado.itensTexto(totalItens)}, ${estado.moeda(valor)}`;
    atualizarBarra();
  }

  function atualizarBarra() {
    const mostrar = totalItens > 0 && !secaoNaTela && !desktop.matches;
    if (mostrar === barraVisivel) return;
    barraVisivel = mostrar;
    html.classList.toggle('com-barra-encomenda', mostrar);
    if (mostrar) {
      barra.hidden = false;
      mostrarBarra(barra);
    } else {
      if (barra.contains(document.activeElement)) titulo.focus({ preventScroll: true });
      esconderBarra(barra).then(() => {
        if (!barraVisivel) barra.hidden = true;
      });
    }
  }

  // ---------- datas e faixas ----------
  function diaEscolhido() {
    const input = diasInputs.find((i) => i.checked) || diasInputs[0];
    return { n: input.value, data: datas[input.value] };
  }

  function atualizarFaixas() {
    const domingo = diaEscolhido().data?.getDay() === 0;
    const input = faixaTarde.querySelector('input');
    if (domingo && input.checked) input.checked = false;
    input.disabled = domingo;
    faixaTarde.hidden = domingo;
    notaDomingo.hidden = !domingo;
  }

  /** Recalcula as datas de retirada ("Amanhã, sábado 19/10") e o prazo das 18h. */
  function atualizarData(agora) {
    const chave = chaveDia(agora);
    const passou = minutosDoDia(agora) >= PRAZO_ENCOMENDA;
    if (chave === diaAtual && passou === depoisDoPrazo) return;
    const mudouDia = diaAtual && chave !== diaAtual;
    diaAtual = chave;
    depoisDoPrazo = passou;
    for (const input of diasInputs) {
      const n = Number(input.value);
      const data = somarDias(agora, n);
      datas[input.value] = data;
      const rotulo = secao.querySelector(`[data-rotulo-dia="${input.value}"]`);
      rotulo.textContent = `${n === 1 ? 'Amanhã' : 'Depois de amanhã'}, ${rotuloData(data)}`;
    }
    const amanha = diasInputs.find((i) => i.value === '1');
    const depois = diasInputs.find((i) => i.value === '2');
    amanha.disabled = passou;
    notaPrazo.hidden = !passou;
    if (passou && amanha.checked) depois.checked = true;
    if (!passou && !diasInputs.some((i) => i.checked)) amanha.checked = true;
    atualizarFaixas();
    if (mudouDia) limparResultado();
  }

  // ---------- validação ----------
  function marcarErro(campo, erro, idErro, temErro) {
    erro.hidden = !temErro;
    if (temErro) {
      campo.setAttribute('aria-describedby', idErro);
      if (campo === nome) nome.setAttribute('aria-invalid', 'true');
    } else {
      campo.removeAttribute('aria-describedby');
      if (campo === nome) nome.removeAttribute('aria-invalid');
    }
  }

  function montarMensagem(nomeLimpo, faixa) {
    const dia = diaEscolhido();
    const quando = dia.n === '1' ? 'amanhã' : 'depois de amanhã';
    const itens = escolhidos()
      .map((item) => {
        const q = estado.qtd(item.id);
        return `${q} ${q === 1 ? item.um : item.varios}`;
      })
      .join('; ');
    return `Olá, Côdea! Quero encomendar para retirar ${quando}, ${rotuloData(dia.data)}, ${FAIXAS[faixa].mensagem}: ${itens}. Total: ${estado.moeda(total(), ' ')}. Nome: ${nomeLimpo}.`;
  }

  function aoEnviar(e) {
    e.preventDefault();
    const faixa = form.querySelector('input[name="faixa"]:checked');
    const nomeLimpo = nome.value.trim().replace(/\s+/g, ' ').replace(/[.\s]+$/, '');
    marcarErro(campoFaixa, erroFaixa, ERRO_FAIXA, !faixa);
    marcarErro(nome, erroNome, ERRO_NOME, !nomeLimpo);
    if (!faixa || !nomeLimpo) {
      limparResultado();
      (!faixa ? form.querySelector('input[name="faixa"]:not(:disabled)') : nome).focus();
      return;
    }
    mensagem = montarMensagem(nomeLimpo, faixa.value);
    const bolha = document.createElement('p');
    bolha.className = 'resultado__mensagem';
    bolha.textContent = mensagem;
    const nota = document.createElement('p');
    nota.className = 'resultado__nota';
    nota.textContent = NOTA_DEMO;
    status.replaceChildren(bolha, nota);
    restaurarCopiar();
    copiar.hidden = false;
    aparecer(bolha, 12);
    aparecer(nota, 6);
    // mostra o resultado sem roubar o foco (o leitor de tela ouve a mensagem pelo role="status")
    requestAnimationFrame(() => copiar.scrollIntoView({ block: 'nearest', behavior: reduzido() ? 'auto' : 'smooth' }));
  }

  function copiarComSelecao(texto) {
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    copiar.focus();
    return ok;
  }

  async function aoCopiar() {
    if (!mensagem) return;
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(mensagem);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) ok = copiarComSelecao(mensagem);
    clearTimeout(timerCopia);
    if (ok) {
      copiar.dataset.copiado = '';
      copiarTexto.textContent = 'Mensagem copiada';
      anunciar('Mensagem copiada.');
      timerCopia = setTimeout(restaurarCopiar, 4000);
    } else {
      // sem área de transferência: seleciona a mensagem para a pessoa copiar
      const bolha = status.querySelector('.resultado__mensagem');
      const faixa = document.createRange();
      faixa.selectNodeContents(bolha);
      getSelection().removeAllRanges();
      getSelection().addRange(faixa);
      copiarTexto.textContent = 'Mensagem selecionada. Copie com o teclado.';
    }
  }

  // ---------- eventos ----------
  const aoRemover = (e) => {
    const botao = e.target.closest('[data-remover]');
    if (!botao) return;
    const li = botao.closest('[data-linha]');
    const indice = [...linhas.children].indexOf(li);
    estado.definir(li.dataset.linha, 0, 'remover');
    const item = catalogo.find((i) => i.id === li.dataset.linha);
    anunciar(`${item.nome} saiu da encomenda.`);
    const proximo = linhas.children[Math.min(indice, linhas.children.length - 1)];
    (proximo?.querySelector('[data-remover]') || titulo).focus();
  };
  const aoMudarCampo = (e) => {
    if (e.target.name === 'dia') atualizarFaixas();
    if (e.target.name === 'faixa' && !erroFaixa.hidden) marcarErro(campoFaixa, erroFaixa, ERRO_FAIXA, false);
    limparResultado();
  };
  const aoDigitar = () => {
    if (nome.getAttribute('aria-invalid') === 'true' && nome.value.trim()) marcarErro(nome, erroNome, ERRO_NOME, false);
    limparResultado();
  };
  const aoVer = (e) => {
    e.preventDefault();
    titulo.focus({ preventScroll: true });
    secao.scrollIntoView({ block: 'start', behavior: reduzido() ? 'auto' : 'smooth' });
  };

  linhas.addEventListener('click', aoRemover);
  form.addEventListener('change', aoMudarCampo);
  form.addEventListener('submit', aoEnviar);
  nome.addEventListener('input', aoDigitar);
  copiar.addEventListener('click', aoCopiar);
  ver.addEventListener('click', aoVer);
  desktop.addEventListener('change', atualizarBarra);

  const observador = new IntersectionObserver(
    ([entrada]) => {
      secaoNaTela = entrada.isIntersecting;
      atualizarBarra();
    },
    { rootMargin: '0px 0px -96px 0px' }, // a barra some assim que a encomenda aparece acima dela
  );
  observador.observe(secao);

  const parar = estado.assinar(() => {
    pintarItens();
    limparResultado();
  });
  pintarItens();

  return {
    atualizarData,
    limpar() {
      parar();
      observador.disconnect();
      linhas.removeEventListener('click', aoRemover);
      form.removeEventListener('change', aoMudarCampo);
      form.removeEventListener('submit', aoEnviar);
      nome.removeEventListener('input', aoDigitar);
      copiar.removeEventListener('click', aoCopiar);
      ver.removeEventListener('click', aoVer);
      desktop.removeEventListener('change', atualizarBarra);
      clearTimeout(timerCopia);
    },
  };
}
