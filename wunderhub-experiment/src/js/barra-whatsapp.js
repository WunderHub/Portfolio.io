// Barra fixa de WhatsApp no mobile (<768px), seções 5.4 e 2.9. Frente dona: topo.
// Aparece quando #trabalhos chega ao topo da tela (fim do palco), com translateY 100% → 0 em 240ms
// (--ease-corte); some (200ms, --ease-saida) quando o miolo da Porta fica visível ou ao voltar para
// cima do palco. html.com-barra (scroll-padding-bottom do base.css) vale em todo o trecho abaixo do palco
// no mobile, com a barra à vista ou não: se a classe seguisse a barra, o navegador rolaria para revelar
// um foco da Porta sem reserva embaixo (o miolo ainda está à vista, a barra escondida) e a barra voltaria
// depois do scroll, cobrindo o foco (WCAG 2.4.11). Reduced motion alterna sem animação
// (MotionGlobalConfig.skipAnimations).
// Medição: getBoundingClientRect em frame.read a cada rolagem, só abaixo de 768px.
import { animate, frame, cancelFrame } from 'motion';
import { easeCorte, easeSaida, dur } from './motion/tokens.js';

/**
 * @param {{ raiz: HTMLElement }} contexto
 * @returns {() => void}
 */
export function init({ raiz }) {
  const barra = document.querySelector('[data-barra-whatsapp]');
  const trabalhos = document.getElementById('trabalhos');
  if (!barra || !trabalhos) return () => {};

  const estreito = matchMedia('(max-width: 767.98px)');
  let visivel = false;
  let reservado = false;
  let animacao = null;
  let leitura = null;

  function mostrar(sim) {
    if (sim === visivel) return;
    visivel = sim;
    animacao?.stop();
    if (sim) {
      barra.hidden = false;
      barra.inert = false;
      animacao = animate(barra, { transform: ['translateY(100%)', 'translateY(0%)'] }, { duration: dur.placa, ease: easeCorte });
    } else {
      barra.inert = true;
      animacao = animate(barra, { transform: 'translateY(100%)' }, { duration: dur.saida, ease: easeSaida });
      animacao.then(() => {
        if (!visivel) barra.hidden = true;
      });
    }
  }

  // A reserva (html.com-barra) só segue a posição e a largura; a barra segue também a Porta.
  function reservar(sim) {
    if (sim === reservado) return;
    reservado = sim;
    raiz.classList.toggle('com-barra', sim);
  }

  function medir() {
    leitura = null;
    if (!estreito.matches) {
      if (visivel || reservado) {
        frame.render(() => {
          reservar(false);
          mostrar(false);
        });
      }
      return;
    }
    const headerH = parseFloat(getComputedStyle(raiz).getPropertyValue('--header-h')) || 56;
    const passouPalco = trabalhos.getBoundingClientRect().top <= headerH + 1;
    const miolo = document.querySelector('.porta__miolo') || document.getElementById('contato');
    let portaVisivel = false;
    if (miolo) {
      const r = miolo.getBoundingClientRect();
      portaVisivel = r.top < window.innerHeight && r.bottom > headerH;
    }
    const sim = passouPalco && !portaVisivel;
    if (passouPalco !== reservado || sim !== visivel) {
      frame.render(() => {
        reservar(passouPalco);
        mostrar(sim);
      });
    }
  }
  const agendar = () => {
    if (!leitura) leitura = frame.read(medir);
  };

  addEventListener('scroll', agendar, { passive: true });
  addEventListener('resize', agendar);
  estreito.addEventListener('change', agendar);
  agendar();

  return () => {
    removeEventListener('scroll', agendar);
    removeEventListener('resize', agendar);
    estreito.removeEventListener('change', agendar);
    if (leitura) cancelFrame(leitura);
    animacao?.stop();
    barra.hidden = true;
    barra.inert = false;
    barra.style.transform = '';
    raiz.classList.remove('com-barra');
  };
}
