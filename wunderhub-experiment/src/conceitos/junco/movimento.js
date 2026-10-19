// Movimento da Junco: calmo, sem quique. Uma curva de saída longa e durações curtas.
// Com prefers-reduced-motion, MotionGlobalConfig.skipAnimations (ligado por preferencias.js) pula tudo.
export const EASE = [0.22, 1, 0.36, 1];
export const EASE_SAIDA = [0.4, 0, 1, 1];

export const reduzido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
