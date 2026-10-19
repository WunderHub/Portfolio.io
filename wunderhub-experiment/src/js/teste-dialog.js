// "Testar aqui" (seção 8). Frente dona: trabalhos.
// Só com pointer: fine e largura ≥ 1024px (preferencias.testarAqui; os botões nascem hidden).
// <dialog> com showModal(): foco preso, fundo inert e Escape nativos. O iframe só ganha src ao abrir e é
// trocado por um iframe novo ao fechar (volta a about:blank e leva junto o histórico navegado dentro
// dele, que senão ficaria preso no botão Voltar). Larguras 390, 768 e 1280: se não couber, a moldura
// aplica scale() a partir do canto superior esquerdo e o rótulo informa a escala.
//   abrir: 280ms --ease-corte (y 24px, opacidade); fechar: 200ms --ease-saida; troca de largura: 240ms --ease-corte.
import { animate, resize } from 'motion';
import { easeCorte, easeSaida, dur, distancia } from './motion/tokens.js';
import { preferencias, subscribe, suporta } from './motion/preferencias.js';
import { porSlug } from '../data/conceitos.js';

const LARGURA_PADRAO = 1280;

/**
 * @param {{ raiz: HTMLElement, estatico: boolean, gatilho: string, evento: Event|null }} contexto
 * @returns {() => void}
 */
export function init() {
  const dialogo = document.querySelector('[data-teste]');
  const botoes = [...document.querySelectorAll('[data-testar]')];
  if (!dialogo || !botoes.length || !suporta.dialog) return () => {};

  const marca = dialogo.querySelector('[data-teste-marca]');
  const titulo = dialogo.querySelector('#teste-titulo');
  const escalaEl = dialogo.querySelector('[data-teste-escala]');
  const inteira = dialogo.querySelector('[data-teste-inteira]');
  const botaoFechar = dialogo.querySelector('[data-teste-fechar]');
  const palco = dialogo.querySelector('[data-teste-palco]');
  const moldura = dialogo.querySelector('[data-teste-moldura]');
  const radios = [...dialogo.querySelectorAll('input[name="teste-largura"]')];
  let iframe = dialogo.querySelector('[data-teste-iframe]');

  let abridor = null; // botão "Testar aqui" que abriu
  let emUso = false; // entre showModal() e a limpeza do fechamento
  let fechando = null; // animação de saída em curso
  let entrada = null;
  let tamanho = null; // { mw, h, w, s } escrito na moldura e no iframe
  let troca = null; // animação da troca de largura
  let soltarTeclaIframe = () => {};

  const limpezas = [];
  const ouvir = (alvo, tipo, fn, opcoes) => {
    alvo.addEventListener(tipo, fn, opcoes);
    limpezas.push(() => alvo.removeEventListener(tipo, fn, opcoes));
  };

  // ---------- disponibilidade ----------
  const pararPreferencias = subscribe((p) => {
    for (const b of botoes) b.hidden = !p.testarAqui;
    if (!p.testarAqui && dialogo.open) fechar({ animar: false });
  });

  // ---------- tamanho do iframe ----------
  const larguraEscolhida = () => Number(radios.find((r) => r.checked)?.value) || LARGURA_PADRAO;

  function medir(largura) {
    const cs = getComputedStyle(palco);
    const livreL = palco.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const livreA = palco.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const s = Math.min(1, Math.max(0.1, livreL / largura));
    return { mw: largura * s, h: Math.max(0, livreA), w: largura, s };
  }

  function escreverTamanho(t) {
    tamanho = t;
    moldura.style.width = `${t.mw}px`;
    moldura.style.height = `${t.h}px`;
    iframe.style.width = `${t.w}px`;
    iframe.style.height = `${t.h / t.s}px`;
    iframe.style.transform = t.s === 1 ? '' : `scale(${t.s})`;
  }

  function aplicarLargura({ animar }) {
    const alvo = medir(larguraEscolhida());
    escalaEl.textContent = `Escala ${Math.round(alvo.s * 100)}%`;
    troca?.stop();
    troca = null;
    if (!animar || !tamanho || preferencias.reduzido) {
      escreverTamanho(alvo);
      return;
    }
    const de = { ...tamanho };
    const mistura = (a, b, k) => a + (b - a) * k;
    troca = animate(0, 1, {
      duration: dur.placa,
      ease: easeCorte,
      onUpdate: (k) =>
        escreverTamanho({
          mw: mistura(de.mw, alvo.mw, k),
          h: mistura(de.h, alvo.h, k),
          w: mistura(de.w, alvo.w, k),
          s: mistura(de.s, alvo.s, k),
        }),
      onComplete: () => escreverTamanho(alvo),
    });
  }

  // ---------- abrir ----------
  function abrir(botao) {
    const conceito = porSlug[botao.dataset.testar];
    if (!conceito || dialogo.open) return;
    abridor = botao;
    marca.textContent = conceito.nome;
    iframe.title = `Demonstração de ${conceito.nome}`;
    inteira.setAttribute('href', conceito.url);
    fechando?.stop();
    fechando = null;

    dialogo.showModal();
    emUso = true;
    tamanho = null;
    aplicarLargura({ animar: false });
    iframe.setAttribute('src', conceito.url); // só agora: nenhum byte da demo antes do clique
    titulo.focus();

    entrada?.stop();
    entrada = animate(
      dialogo,
      { opacity: [0, 1], transform: [`translateY(${distancia.menu}px)`, 'translateY(0px)'] },
      { duration: 0.28, ease: easeCorte },
    );
  }

  // ---------- fechar ----------
  function fechar({ animar = true } = {}) {
    if (!dialogo.open || fechando) return;
    entrada?.stop();
    if (!animar || preferencias.reduzido) {
      dialogo.close();
      aoFechar();
      return;
    }
    fechando = animate(
      dialogo,
      { opacity: 0, transform: `translateY(${distancia.menu}px)` },
      { duration: dur.saida, ease: easeSaida },
    );
    fechando.finished.then(() => {
      if (!fechando) return;
      fechando = null;
      dialogo.close();
      aoFechar();
    });
  }

  // tudo o que acontece ao fechar, venha de onde vier (botão, Escape, fundo, pagehide, close nativo)
  function aoFechar() {
    if (!emUso) return;
    emUso = false;
    fechando = null;
    troca?.stop();
    troca = null;
    soltarTeclaIframe();
    // iframe novo, sem src: volta a about:blank e descarta o histórico navegado dentro da demo
    const novo = iframe.cloneNode(false);
    novo.removeAttribute('src');
    novo.removeAttribute('style');
    iframe.replaceWith(novo);
    iframe = novo;
    dialogo.style.opacity = '';
    dialogo.style.transform = '';
    const voltar = abridor;
    abridor = null;
    // o foco volta ao botão que abriu (explícito, além do comportamento nativo)
    if (voltar?.isConnected && !voltar.hidden) voltar.focus({ preventScroll: true });
  }

  // Escape com o foco dentro da demo: o evento nasce no documento do iframe, não no diálogo.
  // Se a demo tiver algo aberto (diálogo, menu, filtro), o Escape é dela.
  function ouvirTeclaIframe() {
    soltarTeclaIframe();
    let janela;
    try {
      janela = iframe.contentWindow;
      void janela.document; // mesma origem; em outra origem lança e o Escape fica só com o diálogo
    } catch {
      return;
    }
    const tecla = (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      const doc = janela.document;
      if (doc.querySelector('dialog[open]')) return;
      const ativo = doc.activeElement;
      for (const t of doc.querySelectorAll('[aria-expanded="true"]')) {
        const regiao = t.getAttribute('aria-controls') && doc.getElementById(t.getAttribute('aria-controls'));
        if (t === ativo || t.contains(ativo) || regiao?.contains(ativo)) return;
      }
      e.preventDefault();
      fechar();
    };
    janela.addEventListener('keydown', tecla, true);
    soltarTeclaIframe = () => {
      try {
        janela.removeEventListener('keydown', tecla, true);
      } catch {
        /* janela já descartada */
      }
      soltarTeclaIframe = () => {};
    };
  }

  // ---------- eventos ----------
  for (const b of botoes) ouvir(b, 'click', () => abrir(b));
  ouvir(botaoFechar, 'click', () => fechar());
  ouvir(dialogo, 'cancel', (e) => {
    e.preventDefault();
    fechar();
  });
  ouvir(dialogo, 'close', aoFechar);
  // clique no fundo: o ::backdrop é alvo do próprio <dialog>; exige que o gesto comece e termine nele
  let comecouNoFundo = false;
  ouvir(dialogo, 'pointerdown', (e) => {
    comecouNoFundo = e.target === dialogo;
  });
  ouvir(dialogo, 'click', (e) => {
    if (e.target === dialogo && comecouNoFundo) fechar();
    comecouNoFundo = false;
  });
  for (const r of radios) ouvir(r, 'change', () => aplicarLargura({ animar: true }));
  // o listener do iframe é refeito a cada carga (a demo pode navegar entre páginas)
  ouvir(dialogo, 'load', (e) => {
    if (e.target === iframe) ouvirTeclaIframe();
  }, true);
  ouvir(window, 'pagehide', () => {
    if (dialogo.open) fechar({ animar: false });
  });
  const pararResize = resize(() => {
    if (dialogo.open && !fechando) aplicarLargura({ animar: false });
  });

  return () => {
    pararPreferencias();
    pararResize();
    entrada?.stop();
    troca?.stop();
    if (dialogo.open) dialogo.close();
    aoFechar();
    for (const fn of limpezas.splice(0)) fn();
    soltarTeclaIframe();
    for (const b of botoes) b.hidden = true;
  };
}
