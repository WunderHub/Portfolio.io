// Configurador "Monte um rascunho do pedido" (seção 3.4, Configurador). Frente dona: contato.
// Tira o hidden do bloco, monta a mensagem pelas regras da especificação e mantém os dois links de envio
// (wa.me e mailto, sempre via src/config.js). Nada é enviado: o WhatsApp ou o e-mail do visitante abre com a
// mensagem pronta e ele revisa antes de mandar.
//   mensagem  "Oi, Kauê! Vim pelo site da WunderHub.{ Meu negócio se chama NOME.}{ Preciso de TIPO.}
//             { O site precisa ter: ITEM1, ITEM2 e ITEM3.} Podemos conversar?" (cada trecho só entra se preenchido;
//             "Ainda não sei" vira "Ainda não sei qual tipo de site preciso.")
//   prévia    <output> com a mensagem, atualizada a cada mudança, sem animação
//   resumo    região aria-live="polite" atualizada 500ms depois da última mudança:
//             "Rascunho com 4 itens: landing page, botão de WhatsApp, cardápio ou catálogo, mapa e endereço."
import { contato, whatsappUrl, mailtoUrl } from '../config.js';

const ESPERA_RESUMO = 500;
const PRIMEIRO_NOME = contato.nome.split(' ')[0];

/** "a", "a e b", "a, b e c" */
export function juntar(lista) {
  if (lista.length <= 1) return lista.join('');
  return `${lista.slice(0, -1).join(', ')} e ${lista[lista.length - 1]}`;
}

/** Nome do negócio: espaços colapsados e sem pontuação final (a frase põe o próprio ponto). */
export function limparNome(valor) {
  return valor
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[\s.,;:!?…]+$/u, '');
}

/**
 * @param {{ nome: string, tipo: { mensagem: string, indefinido: boolean } | null, itens: string[] }} rascunho
 */
export function montarMensagem({ nome, tipo, itens }) {
  let m = `Oi, ${PRIMEIRO_NOME}! Vim pelo site da ${contato.marca}.`;
  if (nome) m += ` Meu negócio se chama ${nome}.`;
  if (tipo) m += tipo.indefinido ? ` ${tipo.mensagem}` : ` Preciso de ${tipo.mensagem}.`;
  if (itens.length) m += ` O site precisa ter: ${juntar(itens)}.`;
  return `${m} Podemos conversar?`;
}

/** "Rascunho com 4 itens: landing page, botão de WhatsApp, ..." */
export function montarResumo({ tipoResumo, itens }) {
  const todos = [...(tipoResumo ? [tipoResumo] : []), ...itens];
  if (!todos.length) return 'Rascunho sem itens marcados.';
  return `Rascunho com ${todos.length} ${todos.length === 1 ? 'item' : 'itens'}: ${todos.join(', ')}.`;
}

/**
 * @param {{ raiz: HTMLElement, estatico: boolean, gatilho: 'imediato'|'vista'|'ponteiro'|'foco', evento: Event|null }} contexto
 * @returns {() => void} limpeza: remove listeners, observers, timers e animações criados aqui
 */
export function init() {
  const bloco = document.querySelector('[data-configurador]');
  const form = bloco?.querySelector('[data-formulario]');
  const previa = bloco?.querySelector('[data-previa]');
  const campoNome = bloco?.querySelector('[data-nome]');
  const linkWhatsapp = bloco?.querySelector('[data-enviar-whatsapp]');
  const linkEmail = bloco?.querySelector('[data-enviar-email]');
  const resumo = bloco?.querySelector('[data-resumo]');
  if (!bloco || !form || !previa || !campoNome || !linkWhatsapp || !linkEmail || !resumo) return () => {};

  let esperaResumo = 0;

  function ler() {
    const marcado = form.querySelector('input[name="tipo"]:checked');
    const tipo = marcado
      ? { mensagem: marcado.dataset.mensagem, resumo: marcado.dataset.textoResumo, indefinido: marcado.value === 'indefinido' }
      : null;
    const itens = [...form.querySelectorAll('input[name="item"]:checked')].map((i) => i.dataset.texto);
    return { nome: limparNome(campoNome.value), tipo, itens };
  }

  /** Prévia e links na hora; o resumo anunciado espera 500ms sem novas mudanças. */
  function atualizar({ anunciar }) {
    const rascunho = ler();
    const mensagem = montarMensagem(rascunho);
    previa.textContent = mensagem;
    linkWhatsapp.href = whatsappUrl(mensagem);
    linkEmail.href = mailtoUrl(contato.assuntoEmail, mensagem);
    if (!anunciar) return;
    clearTimeout(esperaResumo);
    esperaResumo = setTimeout(() => {
      resumo.textContent = montarResumo({ tipoResumo: rascunho.tipo?.resumo, itens: rascunho.itens });
    }, ESPERA_RESUMO);
  }

  const aoMudar = () => atualizar({ anunciar: true });
  // Enter no campo de nome não envia nada: o formulário não tem destino
  const aoEnviar = (e) => e.preventDefault();

  // Num campo de texto o navegador rola só até o cursor, não até a caixa: no celular, com a barra de WhatsApp
  // visível, o campo podia ficar com o anel de foco sob a barra (12.7). Pedir o enquadramento da caixa inteira
  // respeita o scroll-padding de html.com-barra e o scroll-margin do campo; se já cabe, não rola.
  const aoFocarNome = () => campoNome.scrollIntoView({ block: 'nearest', inline: 'nearest' });

  form.addEventListener('input', aoMudar);
  form.addEventListener('change', aoMudar);
  form.addEventListener('submit', aoEnviar);
  campoNome.addEventListener('focus', aoFocarNome);

  atualizar({ anunciar: false });
  bloco.hidden = false;

  return () => {
    clearTimeout(esperaResumo);
    form.removeEventListener('input', aoMudar);
    form.removeEventListener('change', aoMudar);
    form.removeEventListener('submit', aoEnviar);
    campoNome.removeEventListener('focus', aoFocarNome);
    resumo.textContent = '';
    bloco.hidden = true;
  };
}
