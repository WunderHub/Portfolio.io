// A Porta (seção 5.4). Frente dona: contato.
// O letreiro WUNDERHUB fecha o miolo do contato como uma porta de duas folhas (.porta__cima e .porta__baixo).
// Fechada (só com .js, movimento permitido e sem falha de módulo; o CSS desenha isso desde o primeiro quadro),
// as folhas se encontram no meio do miolo e o cobrem, com a fenda de 6px. Aqui:
//   gatilho   inView no miolo (50% visível, com uma folga de 12% na base da tela, para o nome inteiro ser visto
//             antes de abrir; ou a ponta do miolo nos 60% de cima da tela, para telas baixas) ou focusin dentro do miolo. O focusin abre na hora, sem animação, para o foco
//             nunca ficar sob as folhas; as duas vias param a outra.
//   abertura  fenda 6px → 14px em 120ms (--ease-resposta), depois as folhas voltam à posição de layout em 720ms
//             (--ease-corte), na vertical pura: a de cima sobe, a de baixo desce. Total 840ms. Só transform.
//             A faixa especular das letras corre junto (transform das cópias de brilho, mesma montagem do palco).
//   uma vez   não fecha de novo (rolar para cima não fecha).
//   estático  reduced motion, teto de 3s estourado, teto de carga do módulo estourado (main.js, 4s), foco: aberta na hora,
//             sem animação.
// Uma propriedade, um dono: o transform das folhas e das cópias de brilho é escrito só aqui, só durante a
// abertura (inline). Antes e depois quem manda é o CSS, pelo atributo data-estado (fechada, abrindo, aberta).
import { animate, inView } from 'motion';
import { easeCorte, easeResposta, dur, distancia } from './motion/tokens.js';
import { preferencias, subscribe } from './motion/preferencias.js';

const FENDA_REPOUSO = distancia.fendaLetreiro; // 6px: 3px para cada folha
const FENDA_ABERTA = 14; // 14px: a fenda se alarga antes de as folhas correrem
const ABRE_POR_FOLHA = (FENDA_ABERTA - FENDA_REPOUSO) / 2; // 4px para cada folha
const BRILHO_FECHADA = -0.1; // faixa especular fora da placa (nada de luz com a porta fechada)
const BRILHO_ABERTA = 0.62; // onde a luz para (a mesma do CSS aberto)
const EM_LINHA = 3.5756; // largura do letreiro em em
const EM_ALTURA = 0.74; // altura da linha em em
const CURSO_EM = EM_LINHA + 0.2493 * EM_ALTURA; // curso da faixa por unidade de --brilho (em em)

/**
 * @param {{ raiz: HTMLElement, estatico: boolean, gatilho: 'imediato'|'vista'|'ponteiro'|'foco', evento: Event|null }} contexto
 * @returns {() => void} limpeza: remove listeners, observers, timers e animações criados aqui
 */
export function init({ estatico, gatilho }) {
  const porta = document.querySelector('[data-porta]');
  const miolo = porta?.querySelector('.porta__miolo');
  const cima = porta?.querySelector('.porta__cima');
  const baixo = porta?.querySelector('.porta__baixo');
  if (!porta || !miolo || !cima || !baixo) return () => {};
  const brilhos = [...porta.querySelectorAll('.porta__brilho')];
  const contras = [...porta.querySelectorAll('.porta__contra')];
  const chapas = [...porta.querySelectorAll('.porta__chapa')];

  let animacao = null; // controles Motion da etapa em curso
  let pararVista = [];
  let pararPreferencias = () => {};

  const estado = () => porta.dataset.estado;

  function pararGatilhos() {
    for (const parar of pararVista) parar();
    pararVista = [];
    miolo.removeEventListener('focusin', aoFoco);
    for (const c of chapas) c.removeEventListener('pointerdown', aoToque);
  }

  function limparEscrita() {
    cima.style.transform = '';
    baixo.style.transform = '';
    for (const el of brilhos) el.style.transform = '';
    for (const el of contras) el.style.transform = '';
  }

  /** Aberta na hora (foco, reduced motion, estático, limpeza): sem animação. */
  function abrirJa() {
    pararGatilhos();
    animacao?.stop();
    animacao = null;
    limparEscrita();
    delete porta.dataset.animando;
    porta.dataset.estado = 'aberta';
  }

  /** Deslocamento vertical da folha, em px, no estado em que ela está agora (o CSS fechado, calc com %). */
  function deslocamento(folha) {
    const m = getComputedStyle(folha).transform;
    if (!m || m === 'none') return 0;
    return new DOMMatrixReadOnly(m).m42;
  }

  /** Abertura com animação (fenda, depois as folhas). */
  function abrir() {
    if (estado() !== 'fechada' || animacao) return;
    pararGatilhos();
    const yCima = deslocamento(cima);
    const yBaixo = deslocamento(baixo);
    if (preferencias.reduzido || (Math.abs(yCima) < 1 && Math.abs(yBaixo) < 1)) return abrirJa();

    const corpo = parseFloat(getComputedStyle(cima).fontSize) || 100;
    const curso = CURSO_EM * corpo;
    const escrever = (a, b, luz) => {
      cima.style.transform = `translate3d(0, ${a}px, 0)`;
      baixo.style.transform = `translate3d(0, ${b}px, 0)`;
      const x = (luz - 0.5) * curso;
      for (const el of brilhos) el.style.transform = `translate3d(${x}px, 0, 0)`;
      for (const el of contras) el.style.transform = `translate3d(${-x}px, 0, 0)`;
    };

    // escreve o quadro da posição fechada (inline vence o CSS fechado): nenhum quadro intermediário.
    // Na etapa 1 o estado segue "fechada" (a veda preta cobre a fenda); na etapa 2 passa a "abrindo".
    escrever(yCima, yBaixo, BRILHO_FECHADA);
    porta.dataset.animando = '';

    const fim = () => {
      if (estado() !== 'abrindo') return;
      limparEscrita();
      delete porta.dataset.animando;
      porta.dataset.estado = 'aberta';
      animacao = null;
    };

    // etapa 1: a fenda de 6px vai a 14px
    animacao = animate(0, 1, {
      duration: dur.toque,
      ease: easeResposta,
      onUpdate: (u) => escrever(yCima - ABRE_POR_FOLHA * u, yBaixo + ABRE_POR_FOLHA * u, BRILHO_FECHADA),
      onComplete: () => {
        if (estado() === 'aberta') return;
        porta.dataset.estado = 'abrindo';
        const c0 = yCima - ABRE_POR_FOLHA;
        const b0 = yBaixo + ABRE_POR_FOLHA;
        // etapa 2: as folhas voltam ao layout, a luz corre pelo aço e para
        animacao = animate(0, 1, {
          duration: dur.porta,
          ease: easeCorte,
          onUpdate: (v) => escrever(c0 * (1 - v), b0 * (1 - v), BRILHO_FECHADA + (BRILHO_ABERTA - BRILHO_FECHADA) * v),
          onComplete: fim,
        });
      },
    });
  }

  function aoFoco() {
    abrirJa();
  }
  function aoToque() {
    abrir();
  }

  // ---------- preferências em tempo real: reduced motion ligado com a porta fechada abre na hora ----------
  pararPreferencias = subscribe((p) => {
    if (p.reduzido && estado() !== 'aberta') abrirJa();
  });

  // ---------- liga ----------
  const jaComFoco = miolo.contains(document.activeElement);
  // moduloAtrasado: main.js estourou o teto de carga (chunk pendente, rede travada) e a seção já foi para o modo
  // estático (Porta aberta pelo CSS); o módulo chegou tarde, então não fecha nem anima nada
  const moduloAtrasado = porta.closest('[data-contato]')?.hasAttribute('data-modulo-falhou');
  if (estatico || moduloAtrasado || gatilho === 'foco' || jaComFoco || preferencias.reduzido || estado() === 'aberta') {
    abrirJa();
  } else {
    miolo.addEventListener('focusin', aoFoco);
    for (const c of chapas) c.addEventListener('pointerdown', aoToque);
    // a folga de 12% na base da tela adia a abertura até o nome inteiro ter sido visto fechado
    pararVista.push(inView(miolo, () => abrir(), { amount: 0.5, margin: '0px 0px -12% 0px' }));
    // telas muito baixas (celular deitado): 50% do miolo pode não caber nunca; aí vale a ponta dele entrar na
    // parte de cima de 60% da tela
    pararVista.push(inView(miolo, () => abrir(), { amount: 'some', margin: '0px 0px -40% 0px' }));
  }

  return () => {
    pararPreferencias();
    // sem o módulo a Porta nunca fica fechada: a limpeza devolve o estado aberto de layout
    abrirJa();
  };
}
