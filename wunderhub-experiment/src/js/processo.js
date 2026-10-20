// Momento 3, o projeto ganha peso (seção 5.3). Frente dona: meio.
// O range nativo (1..5, passos inteiros) é a fonte de verdade para o leitor de tela e o teclado;
// o valor visual e ∈ [1, 5] é contínuo (MotionValue) e anda até o inteiro com Motion:
//   teclado e botões: 420ms --ease-corte; soltar o polegar: mola `encaixe`; dica de primeira entrada:
//   1 → 1,18 → 1 em 700ms. Reduced motion (ou teto estourado): e salta, as guias aparecem prontas.
// Motores (seção 5): este módulo é o único escritor de --w, --s, --e e data-etapa do .m3, num único
// frame.render; o Motion anima e, as guias (stroke-dashoffset) e o clip-path da placa "No ar";
// o CSS faz as cores e as camadas.
import { animate, motionValue, frame, cancelFrame, inView } from 'motion';
import { subscribe } from './motion/preferencias.js';
import { easeCorte, easeSaida, dur, encaixe, CORTE_TAN } from './motion/tokens.js';

// Eixos de cada etapa (wght, wdth): os estados parados ficam nos extremos de largura (50, 62, 150).
const ETAPAS = [
  null,
  { w: 100, s: 50, nome: 'Conversa' },
  { w: 300, s: 50, nome: 'Mapa' },
  { w: 560, s: 62, nome: 'Desenho' },
  { w: 850, s: 62, nome: 'Construção' },
  { w: 900, s: 150, nome: 'No ar' },
];
const DUR_TECLADO = 0.42; // tabela 6: M3 teclado e botões
const DUR_GUIAS = 0.4; // M3 guias, stagger 40ms
const STAGGER_GUIAS = 0.04;
const DUR_GUIAS_SAIDA = dur.saida; // reverso: 200ms
const DUR_DICA = 0.7;
const POLEGAR = 48; // largura do polegar (px): igual no CSS
const LIMIAR_TOQUE = 6; // px até um toque virar arraste horizontal

const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
const comGuias = (n) => n === 2 || n === 3;

/**
 * @param {{ raiz: HTMLElement, estatico: boolean, gatilho: 'imediato'|'vista'|'ponteiro'|'foco', evento: Event|null }} contexto
 * @returns {() => void} limpeza: remove listeners, observers, timers e animações criados aqui
 */
export function init({ estatico = false } = {}) {
  const secao = document.getElementById('processo');
  const m3 = secao?.querySelector('[data-processo-controles]');
  const range = m3?.querySelector('#etapa');
  if (!secao || !m3 || !range) return () => {};

  const trilho = m3.querySelector('.m3__trilho');
  const botoes = [...m3.querySelectorAll('.m3__botao')];
  const itens = [...secao.querySelectorAll('.etapas > .etapa')];
  const guias = [0, 1, 2].map((g) => [...m3.querySelectorAll(`.m3__guia[data-grupo="${g}"]`)]);
  const placa = m3.querySelector('.m3__no-ar');
  const leituraNumero = m3.querySelector('[data-m3-numero]');
  const leituraNome = m3.querySelector('[data-m3-nome]');

  // ---------- estado ----------
  let semMovimento = estatico;
  const inicial = limitar(Math.round(Number(range.value) || 1), 1, 5); // o navegador pode restaurar o valor
  const e = motionValue(inicial);
  let animE = null;
  let animGuias = [];
  let animPlaca = null;
  let etapaVisual = 0; // etapa arredondada desenhada (camadas)
  let interagiu = false;
  let pedido = null;

  const pararPreferencias = subscribe((p) => {
    semMovimento = estatico || p.reduzido || p.jsFalhou;
    if (semMovimento) {
      // salta para o estado final de tudo o que estiver andando
      animE?.complete();
      for (const a of animGuias) a.complete();
      animPlaca?.complete();
    }
  });

  // ---------- desenho (único escritor de --w, --s, --e e data-etapa) ----------
  function desenhar() {
    pedido = null;
    const v = limitar(e.get(), 1, 5);
    const i = Math.min(4, Math.floor(v));
    const t = v - i;
    const a = ETAPAS[i];
    const b = ETAPAS[i + 1];
    const w = a.w + (b.w - a.w) * t;
    const s = a.s + (b.s - a.s) * t;
    m3.style.setProperty('--w', w.toFixed(1));
    m3.style.setProperty('--s', s.toFixed(2));
    m3.style.setProperty('--e', v.toFixed(4));
    const r = Math.round(v);
    if (r !== etapaVisual) trocarCamadas(r, etapaVisual);
  }
  function agendar() {
    if (!pedido) pedido = frame.render(desenhar);
  }
  const pararMudanca = e.on('change', agendar);

  // ---------- camadas: guias e placa (Motion); cores pelo CSS a partir de data-etapa ----------
  function trocarCamadas(r, anterior) {
    etapaVisual = r;
    m3.dataset.etapa = String(r);
    const primeira = anterior === 0;

    if (comGuias(r) !== comGuias(anterior) || primeira) desenharGuias(comGuias(r), primeira);
    if ((r === 5) !== (anterior === 5) || primeira) mostrarPlaca(r === 5, primeira);
  }

  function desenharGuias(entrar, instantaneo) {
    for (const a of animGuias) a.stop();
    animGuias = [];
    const alvo = entrar ? 0 : 1;
    if (instantaneo || semMovimento) {
      for (const grupo of guias) for (const g of grupo) g.style.strokeDashoffset = String(alvo);
      return;
    }
    guias.forEach((grupo, k) => {
      if (!grupo.length) return;
      animGuias.push(
        animate(
          grupo,
          { strokeDashoffset: alvo },
          entrar
            ? { duration: DUR_GUIAS, ease: easeCorte, delay: k * STAGGER_GUIAS }
            : { duration: DUR_GUIAS_SAIDA, ease: easeSaida },
        ),
      );
    });
  }

  function poligonoPlaca(r) {
    const w = placa.offsetWidth;
    const h = placa.offsetHeight;
    const x = r * w;
    return `polygon(0px 0px, ${x.toFixed(1)}px 0px, ${(x - h * CORTE_TAN).toFixed(1)}px ${h}px, 0px ${h}px)`;
  }
  function mostrarPlaca(entrar, instantaneo) {
    if (!placa) return;
    animPlaca?.stop();
    animPlaca = null;
    if (instantaneo || semMovimento) {
      // aberta: a forma da placa (::before) basta; fechada: largura zero ao longo do corte
      placa.style.clipPath = entrar ? 'none' : poligonoPlaca(0);
      return;
    }
    const de = placa.style.clipPath === 'none' ? poligonoPlaca(1) : placa.style.clipPath || poligonoPlaca(0);
    const ate = poligonoPlaca(entrar ? 1 : 0);
    const anim = animate(
      placa,
      { clipPath: [de, ate] },
      entrar ? { duration: dur.placa, ease: easeCorte } : { duration: dur.saida, ease: easeSaida },
    );
    animPlaca = anim;
    anim.finished.then(() => {
      if (animPlaca !== anim) return;
      animPlaca = null;
      // aberta, solta o recorte (a largura da placa muda com a tela); fechada, mantém largura zero.
      // No quadro seguinte: o Motion grava o último quadro no style depois de resolver.
      frame.postRender(() => {
        if (animPlaca) return;
        placa.style.clipPath = entrar ? 'none' : poligonoPlaca(0);
      });
    });
  }

  // ---------- leitura acessível e estados dos controles (seguem o valor nativo) ----------
  let valorAtual = 1; // último valor anunciado
  function sincronizar(n) {
    valorAtual = n;
    const { nome } = ETAPAS[n];
    range.setAttribute('aria-valuetext', `Etapa ${n} de 5: ${nome}`);
    if (leituraNumero) leituraNumero.textContent = String(n);
    if (leituraNome) leituraNome.textContent = nome;
    for (const b of botoes) b.setAttribute('aria-pressed', String(Number(b.dataset.etapa) === n));
    for (const li of itens) li.toggleAttribute('data-ativa', Number(li.dataset.etapa) === n);
  }

  function irPara(n, opcoes) {
    animE?.stop();
    if (semMovimento) {
      animE = null;
      e.jump(n);
      return;
    }
    animE = animate(e, n, opcoes || { duration: DUR_TECLADO, ease: easeCorte });
  }

  // ---------- teclado e botões ----------
  let arrastando = false;
  let ponteiro = null; // { id, x0, y0, tipo }
  function aoInput() {
    const n = limitar(Math.round(Number(range.value) || 1), 1, 5);
    if (ponteiro?.tipo === 'touch' && !arrastando) {
      // toque ainda indefinido (pode virar rolagem): o nativo não muda a etapa; o toque é tratado ao soltar
      range.value = String(valorAtual);
      return;
    }
    interagiu = true;
    if (arrastando) {
      // o arraste manda: o nativo acompanha a posição do ponteiro arredondada
      const r = Math.round(limitar(e.get(), 1, 5));
      if (r !== n) range.value = String(r);
      sincronizar(r);
      return;
    }
    sincronizar(n);
    irPara(n);
  }
  range.addEventListener('input', aoInput);

  function aoBotao(evento) {
    const n = Number(evento.currentTarget.dataset.etapa);
    if (!n) return;
    range.value = String(n);
    range.dispatchEvent(new Event('input', { bubbles: true }));
    range.dispatchEvent(new Event('change', { bubbles: true }));
  }
  for (const b of botoes) b.addEventListener('click', aoBotao);

  // ---------- arraste contínuo ----------
  function valorNoPonteiro(x) {
    const caixa = range.getBoundingClientRect();
    const util = Math.max(1, caixa.width - POLEGAR);
    return 1 + 4 * limitar((x - caixa.left - POLEGAR / 2) / util, 0, 1);
  }
  function seguir(x) {
    const v = valorNoPonteiro(x);
    e.set(v);
    const n = Math.round(v);
    if (Number(range.value) !== n) {
      range.value = String(n);
      sincronizar(n);
    }
  }
  function comecarArraste(evento) {
    arrastando = true;
    animE?.stop();
    animE = null;
    try {
      range.setPointerCapture(evento.pointerId);
    } catch {
      /* ponteiro já liberado */
    }
    seguir(evento.clientX);
  }
  function aoPointerDown(evento) {
    if (evento.button !== 0 || !evento.isPrimary) return;
    interagiu = true;
    pararDica();
    ponteiro = { id: evento.pointerId, x0: evento.clientX, y0: evento.clientY, tipo: evento.pointerType };
    if (evento.pointerType === 'touch') return; // espera saber se é arraste horizontal ou rolagem
    // sem preventDefault: o range recebe o foco do clique (sem anel de foco), e o valor que o
    // arraste nativo grava é corrigido em aoInput para a posição arredondada do ponteiro
    comecarArraste(evento);
  }
  function aoPointerMove(evento) {
    if (!ponteiro || evento.pointerId !== ponteiro.id) return;
    if (!arrastando) {
      const dx = evento.clientX - ponteiro.x0;
      const dy = evento.clientY - ponteiro.y0;
      if (Math.abs(dx) < LIMIAR_TOQUE || Math.abs(dx) < Math.abs(dy)) return;
      comecarArraste(evento);
      return;
    }
    seguir(evento.clientX);
  }
  function soltar(evento, cancelado) {
    if (!ponteiro || evento.pointerId !== ponteiro.id) return;
    const eraToque = !arrastando;
    ponteiro = null;
    if (eraToque) {
      // toque sem arraste: vai à etapa tocada como um botão (a rolagem que começou no trilho é ignorada)
      if (cancelado) return;
      const n = Math.round(valorNoPonteiro(evento.clientX));
      range.value = String(n);
      sincronizar(n);
      irPara(n);
      return;
    }
    arrastando = false;
    try {
      range.releasePointerCapture(evento.pointerId);
    } catch {
      /* já liberado */
    }
    const n = limitar(Math.round(e.get()), 1, 5);
    range.value = String(n);
    sincronizar(n);
    irPara(n, encaixe);
  }
  const aoPointerUp = (evento) => soltar(evento, false);
  const aoPointerCancel = (evento) => soltar(evento, true);
  range.addEventListener('pointerdown', aoPointerDown);
  range.addEventListener('pointermove', aoPointerMove);
  range.addEventListener('pointerup', aoPointerUp);
  range.addEventListener('pointercancel', aoPointerCancel);
  const marcarInteracao = () => {
    interagiu = true;
    pararDica();
  };
  m3.addEventListener('keydown', marcarInteracao);

  // ---------- dica de primeira entrada (uma vez, nunca com reduced motion nem depois de interagir) ----------
  let pararVista = () => {};
  let dicaFeita = false;
  function pararDica() {
    pararVista();
    pararVista = () => {};
  }
  if (!semMovimento) {
    pararVista = inView(
      trilho,
      () => {
        if (dicaFeita) return;
        dicaFeita = true;
        pararDica();
        if (interagiu || semMovimento || Number(range.value) !== 1 || animE) return;
        animE = animate(e, [1, 1.18, 1], { duration: DUR_DICA, ease: easeCorte, times: [0, 0.5, 1] });
        animE.then(() => {
          animE = null;
        });
      },
      { amount: 0.6 },
    );
  }

  // ---------- liga ----------
  sincronizar(inicial);
  desenhar(); // primeiro quadro síncrono: camadas no estado certo antes de aparecer
  m3.hidden = false;

  return () => {
    pararDica();
    pararPreferencias();
    pararMudanca();
    if (pedido) cancelFrame(pedido);
    pedido = null;
    animE?.stop();
    for (const a of animGuias) a.stop();
    animPlaca?.stop();
    e.destroy();
    range.removeEventListener('input', aoInput);
    range.removeEventListener('pointerdown', aoPointerDown);
    range.removeEventListener('pointermove', aoPointerMove);
    range.removeEventListener('pointerup', aoPointerUp);
    range.removeEventListener('pointercancel', aoPointerCancel);
    m3.removeEventListener('keydown', marcarInteracao);
    for (const b of botoes) b.removeEventListener('click', aoBotao);
    // volta ao HTML de partida: controles escondidos, lista sem etapa ativa
    m3.hidden = true;
    m3.dataset.etapa = '1';
    for (const p of ['--w', '--s', '--e']) m3.style.removeProperty(p);
    for (const grupo of guias) for (const g of grupo) g.style.removeProperty('stroke-dashoffset');
    placa?.style.removeProperty('clip-path');
    for (const li of itens) li.removeAttribute('data-ativa');
  };
}
