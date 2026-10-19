// Movimento da Louça Torta. Um só momento na carga (o anel da marca se desenha, a foto do topo assenta e a
// palavra "torta" do título entorta);
// o resto só responde à pessoa: grade que se reorganiza ao filtrar, troca de esmalte, contagem da sacola.
// Com prefers-reduced-motion tudo vira estado final (MotionGlobalConfig.skipAnimations, em tempo real).
import { animate, spring, MotionGlobalConfig } from 'motion';

const consulta = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

export const reduzido = () => Boolean(consulta?.matches);

/** Mantém o Motion em sincronia com a preferência do sistema. Devolve a limpeza. */
export function sincronizarMovimento() {
  const aplicar = () => {
    MotionGlobalConfig.skipAnimations = reduzido();
  };
  aplicar();
  consulta?.addEventListener('change', aplicar);
  return () => consulta?.removeEventListener('change', aplicar);
}

export const EASE_SAIDA = [0.2, 0.7, 0.2, 1];

/**
 * Abertura da loja: o anel da marca se desenha (como a borda no torno) e a foto do topo assenta.
 * O CSS esconde os dois só quando há JS e movimento permitido; aqui eles sempre terminam visíveis.
 */
export function abrirLoja({ aneis = [], foto, torta }) {
  const animacoes = [];
  if (torta) {
    // a palavra chega reta e entorta com um balanço curto, como peça que assenta no torno
    const a = animate(torta, { rotate: [0, -4] }, { type: spring, visualDuration: 0.55, bounce: 0.5, delay: 0.95 });
    a.finished.then(() => { torta.style.transform = 'rotate(-4deg)'; }, () => {});
    animacoes.push(a);
  }
  aneis.forEach((anel, i) => {
    const a = animate(anel, { strokeDashoffset: [1, 0] }, { duration: i ? 0.9 : 1.15, delay: 0.1 + i * 0.32, ease: [0.45, 0, 0.2, 1] });
    a.finished.then(() => { anel.style.strokeDashoffset = '0'; }, () => {});
    animacoes.push(a);
  });
  if (foto) {
    const img = foto.querySelector('img');
    const revelar = () => {
      const a = animate(
        img,
        { opacity: [0, 1], clipPath: ['inset(5% 0% 5% 6%)', 'inset(0% 0% 0% 0%)'], scale: [1.035, 1] },
        { duration: 1.05, ease: EASE_SAIDA },
      );
      // estado final explícito: a foto nunca fica presa no quadro inicial
      a.finished.then(() => Object.assign(img.style, { opacity: '1', clipPath: 'none', transform: 'none' }), () => {});
      animacoes.push(a);
    };
    const pronta = img.complete && img.naturalWidth ? Promise.resolve() : img.decode().catch(() => {});
    // nunca esperar mais que 700ms pela foto: depois disso ela entra assim que puder
    Promise.race([pronta, new Promise((r) => setTimeout(r, 700))]).then(revelar);
  }
  return () => animacoes.forEach((a) => a.complete?.());
}

/** Pequeno pulo na contagem da sacola quando ela muda. */
export function pular(el) {
  if (!el || reduzido()) return;
  animate(el, { scale: [1, 1.28, 1], y: [0, -2, 0] }, { duration: 0.42, ease: 'easeOut' });
}

/** Faz uma foto aparecer (troca de variante na grade). */
export function surgir(el, duracao = 0.24) {
  if (!el || reduzido()) return null;
  return animate(el, { opacity: [0, 1] }, { duration: duracao, ease: 'linear' });
}

export { animate };
