// Momento 1, a fachada vira vitrine (seção 5.1). Frente dona: topo.
// - scroll(callback) do Motion entrega p (target: o palco; de 'start <header>px' a 'end end': a pista);
//   render.js escreve tudo num único frame.render.
// - Placas da fachada: entram em p ≥ 0,85 por clip-path ao longo do corte (240ms, --ease-corte,
//   stagger 90ms) e perdem o inert; saem em 200ms (--ease-saida) e voltam a inert. Enquanto o foco
//   estiver dentro delas, não saem.
// - Modo estático (reduced motion, altura < 500px, teto de 3s estourado): sem pista e sem script de
//   desenho; o CSS mostra o estado equivalente a p=0,62 e as placas ficam visíveis e focáveis.
// - Troca de modo em tempo real (preferências e breakpoints de 768/1024) remonta o que for preciso.
// - Falha de imagem: o vão mostra Grafite Parede com o nome do conceito (decorativo).
import { scroll, inView, resize, animate } from 'motion';
import { subscribe } from '../motion/preferencias.js';
import { easeCorte, easeSaida, dur, stagger, CORTE_TAN } from '../motion/tokens.js';
import { criarRenderizador } from './render.js';

const LIMIAR_PLACAS = 0.85;

/**
 * @param {{ raiz: HTMLElement, estatico: boolean }} contexto
 * @returns {() => void}
 */
export function init({ raiz, estatico }) {
  const palco = document.querySelector('[data-palco]');
  const fachada = palco?.querySelector('[data-fachada]');
  const nav = palco?.querySelector('[data-placas]');
  if (!palco || !fachada || !nav) return () => {};
  const placas = [...nav.querySelectorAll('.placa--fachada')];

  // ---------- falha de imagem (vale em todos os modos) ----------
  const limpezasImagem = [...fachada.querySelectorAll('.vao__captura')].map((img) => {
    const fundo = img.closest('.vao__fundo');
    const falhou = () => fundo.classList.add('vao__fundo--falhou');
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) falhou();
    img.addEventListener('error', falhou);
    return () => img.removeEventListener('error', falhou);
  });

  // ---------- placas ----------
  let placasVisiveis = null; // null = ainda não decidido
  let animacoesPlacas = [];
  let ultimoP = 0;

  // Revelação ao longo do corte: a frente é perpendicular a ele (o mesmo recuo de 16° da borda direita
  // da placa) e corre da esquerda para a direita. O polígono sobra 12px para cada lado da placa, então
  // aberto ele não corta o contorno de foco (3px de folga + anel de 7px) e pode ficar aplicado.
  const SOBRA = 12;
  const poligono = (el, frente) => {
    const h = el.offsetHeight || 48;
    const recuo = (h + 2 * SOBRA) * CORTE_TAN;
    const x = (v) => `${v.toFixed(1)}px`;
    return `polygon(${x(-SOBRA)} ${x(-SOBRA)}, ${x(frente)} ${x(-SOBRA)}, ${x(frente - recuo)} ${x(h + SOBRA)}, ${x(-SOBRA)} ${x(h + SOBRA)})`;
  };
  const fechado = (el) => poligono(el, -SOBRA);
  const aberto = (el) => poligono(el, el.offsetWidth + SOBRA + ((el.offsetHeight || 48) + 2 * SOBRA) * CORTE_TAN);

  function pararAnimacoesPlacas() {
    for (const a of animacoesPlacas) a.stop();
    animacoesPlacas = [];
  }

  /** Estado visível/oculto das placas. instantaneo: sem animação (modo estático, montagem). */
  function definirPlacas(visiveis, { instantaneo = false } = {}) {
    if (visiveis === placasVisiveis) return;
    placasVisiveis = visiveis;
    pararAnimacoesPlacas();
    if (visiveis) {
      nav.inert = false;
      nav.dataset.estado = 'visivel';
      if (instantaneo) {
        for (const el of placas) el.style.clipPath = '';
        return;
      }
      placas.forEach((el, i) => {
        if (!el.style.clipPath) el.style.clipPath = fechado(el);
        animacoesPlacas.push(animate(el, { clipPath: aberto(el) }, { duration: dur.placa, ease: easeCorte, delay: i * stagger.vao }));
      });
    } else {
      if (instantaneo) {
        for (const el of placas) el.style.clipPath = fechado(el);
        nav.inert = true;
        nav.dataset.estado = 'oculto';
        return;
      }
      const anims = placas.map((el) => {
        if (!el.style.clipPath) el.style.clipPath = aberto(el);
        return animate(el, { clipPath: fechado(el) }, { duration: dur.saida, ease: easeSaida });
      });
      animacoesPlacas = anims;
      Promise.all(anims).then(() => {
        if (placasVisiveis === false) {
          nav.inert = true;
          nav.dataset.estado = 'oculto';
        }
      });
    }
  }

  const focoNasPlacas = () => nav.contains(document.activeElement);
  const reavaliarPlacas = () => definirPlacas(ultimoP >= LIMIAR_PLACAS || focoNasPlacas());
  // Quando o foco sai das placas, elas voltam a seguir p.
  const aoSairFoco = (evento) => {
    if (!nav.contains(evento.relatedTarget)) requestAnimationFrame(() => vivo && reavaliarPlacas());
  };
  nav.addEventListener('focusout', aoSairFoco);

  // ---------- modo vivo ----------
  let vivo = null; // { desmontar }
  let assinatura = '';

  function montarVivo(pref) {
    const headerH = parseFloat(getComputedStyle(raiz).getPropertyValue('--header-h')) || 64;
    const renderizador = criarRenderizador(fachada, {
      passoPeso: () => pref.passoPeso,
      fonteLenta: () => raiz.classList.contains('fonte-lenta'),
    });
    renderizador.medir();

    placasVisiveis = null;
    definirPlacas(false, { instantaneo: true });

    const pararScroll = scroll(
      (p) => {
        ultimoP = p;
        renderizador.escrever(p);
        reavaliarPlacas();
      },
      { target: palco, offset: [`start ${headerH}px`, 'end end'] },
    );
    const pararVista = inView(
      palco,
      () => {
        palco.classList.add('palco--em-vista');
        return () => palco.classList.remove('palco--em-vista');
      },
      { margin: '50% 0px 50% 0px' },
    );
    const pararResize = resize(() => renderizador.medir());

    return {
      desmontar() {
        pararScroll();
        pararVista();
        pararResize();
        palco.classList.remove('palco--em-vista');
        renderizador.destruir();
      },
    };
  }

  function montarEstatico() {
    pararAnimacoesPlacas();
    placasVisiveis = null;
    definirPlacas(true, { instantaneo: true });
    for (const el of placas) el.style.clipPath = '';
    delete nav.dataset.estado;
    nav.inert = false;
  }

  function aplicar(pref) {
    const emEstatico = estatico || pref.estatico;
    // remonta o modo vivo quando muda algo que entra nas medidas fixas (header, torre/linha, passo)
    const nova = emEstatico ? 'estatico' : `vivo:${pref.navegacao}:${pref.desktop}:${pref.passoPeso}`;
    if (nova === assinatura) return;
    assinatura = nova;
    if (vivo) {
      vivo.desmontar();
      vivo = null;
    }
    if (emEstatico) montarEstatico();
    else vivo = montarVivo(pref);
  }

  const pararPreferencias = subscribe((pref) => aplicar(pref));

  return () => {
    pararPreferencias();
    if (vivo) vivo.desmontar();
    vivo = null;
    pararAnimacoesPlacas();
    nav.removeEventListener('focusout', aoSairFoco);
    for (const limpar of limpezasImagem) limpar();
    for (const el of placas) el.style.clipPath = '';
    delete nav.dataset.estado;
    nav.inert = false;
  };
}
