// Acontecimento de carga, o corte: varredura especular por vão e descida de 6px da metade de baixo quando a Anybody fica pronta em até 900ms, só em p=0 e sem reduced motion; interrompe na rolagem; estado final direto no bfcache.
// Seção da direção: 5.0. Frente dona: topo.
// STUB da fundação: respeita o contrato e não faz nada; o HTML já funciona sem ele.

/**
 * @param {{ raiz: HTMLElement, estatico: boolean, gatilho: 'imediato'|'vista'|'ponteiro'|'foco', evento: Event|null }} contexto
 * @returns {() => void} limpeza: remove listeners, observers, timers e animações criados aqui
 */
export function init(contexto) {
  void contexto;
  return () => {};
}
