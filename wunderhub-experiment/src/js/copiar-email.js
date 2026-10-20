// "Copiar e-mail" (seção 3.4, Contato). Frente dona: contato.
// O botão nasce hidden e só aparece se a Clipboard API existir (contexto seguro). Ao copiar:
//   - o rótulo troca para "E-mail copiado" por 2s (crossfade de 160ms feito em CSS) e volta;
//   - a região role="status" anuncia "E-mail copiado".
// Se a cópia falhar (permissão negada, página sem foco), a mensagem de falha aparece e é anunciada, e o
// endereço do link é selecionado para o visitante copiar com o teclado. O endereço vem de src/config.js.
import { contato } from '../config.js';
import { suporta } from './motion/preferencias.js';

const TEMPO_CONFIRMACAO = 2000;
const TEXTO_OK = 'E-mail copiado';
const TEXTO_FALHA = 'Não deu para copiar. Selecione o endereço acima e copie.';

/**
 * @param {{ raiz: HTMLElement, estatico: boolean, gatilho: 'imediato'|'vista'|'ponteiro'|'foco', evento: Event|null }} contexto
 * @returns {() => void} limpeza: remove listeners, observers, timers e animações criados aqui
 */
export function init() {
  const botao = document.querySelector('[data-copiar-email]');
  const link = document.querySelector('[data-email]');
  const status = document.querySelector('[data-copiar-status]');
  if (!botao || !status) return () => {};
  // sem Clipboard API o botão continua hidden: o endereço está à vista e é um link mailto
  if (!suporta.clipboard) return () => {};

  const rotuloCopiar = botao.querySelector('[data-rotulo="copiar"]');
  const rotuloCopiado = botao.querySelector('[data-rotulo="copiado"]');
  let voltar = 0;
  let anunciar = 0;

  /** Anuncia na região role="status": esvazia e escreve de novo, para repetir o anúncio de um segundo clique. */
  function dizer(texto, { visivel = false } = {}) {
    clearTimeout(anunciar);
    status.textContent = '';
    status.classList.toggle('sr-only', !visivel);
    status.classList.toggle('porta__status--visivel', visivel);
    if (!texto) return;
    anunciar = setTimeout(() => {
      status.textContent = texto;
    }, 60);
  }

  function mostrar(copiado) {
    botao.dataset.estado = copiado ? 'copiado' : 'copiar';
    // o rótulo que não está à vista sai da árvore de acessibilidade: o nome do botão é só o do estado atual
    if (copiado) {
      rotuloCopiar?.setAttribute('aria-hidden', 'true');
      rotuloCopiado?.removeAttribute('aria-hidden');
    } else {
      rotuloCopiar?.removeAttribute('aria-hidden');
      rotuloCopiado?.setAttribute('aria-hidden', 'true');
    }
  }

  function selecionarEndereco() {
    if (!link) return;
    const selecao = getSelection();
    if (!selecao) return;
    const faixa = document.createRange();
    faixa.selectNodeContents(link);
    selecao.removeAllRanges();
    selecao.addRange(faixa);
  }

  async function copiar() {
    clearTimeout(voltar);
    try {
      await navigator.clipboard.writeText(contato.email);
    } catch {
      mostrar(false);
      dizer(TEXTO_FALHA, { visivel: true });
      selecionarEndereco();
      return;
    }
    mostrar(true);
    dizer(TEXTO_OK);
    voltar = setTimeout(() => mostrar(false), TEMPO_CONFIRMACAO);
  }

  mostrar(false);
  botao.addEventListener('click', copiar);
  botao.hidden = false;

  return () => {
    clearTimeout(voltar);
    clearTimeout(anunciar);
    botao.removeEventListener('click', copiar);
    botao.hidden = true;
    delete botao.dataset.estado;
    rotuloCopiar?.removeAttribute('aria-hidden');
    rotuloCopiado?.setAttribute('aria-hidden', 'true');
    status.textContent = '';
    status.classList.add('sr-only');
    status.classList.remove('porta__status--visivel');
  };
}
