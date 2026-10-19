// Movimento da Côdea (Motion 14.3.0). Um momento de carga (a foto do topo cresce como massa no forno);
// o resto só responde ao que a pessoa faz. Com prefers-reduced-motion tudo vai direto ao estado final.
import { animate, inView, stagger, MotionGlobalConfig } from 'motion';

const consulta = matchMedia('(prefers-reduced-motion: reduce)');
export const reduzido = () => consulta.matches;
const sincronizar = () => {
  MotionGlobalConfig.skipAnimations = consulta.matches;
};
sincronizar();
consulta.addEventListener('change', sincronizar);

export const ease = [0.22, 1, 0.36, 1];

/** A foto do topo sai de uma pílula (a forma do pão) para o retângulo de raio 12. */
export function abrirTopo(figura, etiqueta) {
  if (!figura) return;
  const img = figura.querySelector('img');
  const final = 'inset(0% 0% 0% 0% round 12px)';
  if (reduzido()) {
    figura.style.clipPath = final;
    if (etiqueta) etiqueta.style.opacity = '1';
    return;
  }
  const tocar = () => {
    animate(figura, { clipPath: ['inset(7% 9% 7% 9% round 240px)', final] }, { duration: 1.05, ease });
    animate(img, { scale: [1.14, 1] }, { duration: 1.4, ease });
    // a etiqueta cai e balança até parar no prego da vitrine
    if (etiqueta) {
      animate(etiqueta, { opacity: [0, 1], y: [-28, 0], rotate: [-16, -4] }, { delay: 0.6, type: 'spring', stiffness: 260, damping: 14, opacity: { duration: 0.2, delay: 0.6 } });
    }
  };
  // Começa quando a foto entra na tela (no celular ela fica abaixo da dobra) e espera a imagem
  // decodificar, com teto, para o crescimento acontecer sobre a foto e não sobre o fundo.
  let feito = false;
  const uma = () => {
    if (feito) return;
    feito = true;
    tocar();
  };
  inView(
    figura,
    () => {
      if (img.complete && img.naturalWidth) uma();
      else {
        img.decode?.().then(uma, uma);
        img.addEventListener('load', uma, { once: true });
        setTimeout(uma, 900);
      }
    },
    { amount: 0.25 },
  );
}

/** Linhas que voltam a aparecer depois de trocar o filtro. */
export function entrarLinhas(els) {
  if (!els.length || reduzido()) return;
  animate(els, { opacity: [0, 1], y: [14, 0] }, { duration: 0.36, delay: stagger(0.045), ease });
}

/** Número do contador ao mudar. */
export function pular(el, direcao = 1) {
  if (reduzido()) return;
  animate(el, { y: [8 * direcao, 0], opacity: [0.2, 1] }, { duration: 0.22, ease });
}

/** O botão "Adicionar" vira contador. */
export function abrirContador(el) {
  if (reduzido()) return;
  animate(el, { scale: [0.86, 1], opacity: [0, 1] }, { type: 'spring', stiffness: 520, damping: 30 });
}

export function aparecer(el, y = 10) {
  if (reduzido()) return;
  animate(el, { opacity: [0, 1], y: [y, 0] }, { duration: 0.34, ease });
}

export function mostrarBarra(el) {
  return animate(el, { y: [110, 0], opacity: [0, 1] }, { type: 'spring', stiffness: 380, damping: 34 });
}

export function esconderBarra(el) {
  return animate(el, { y: [0, 110], opacity: [1, 0] }, { duration: 0.2, ease: 'easeIn' });
}

export { animate };
