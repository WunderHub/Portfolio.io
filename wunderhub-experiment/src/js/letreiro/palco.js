// Momento 1, a fachada vira vitrine: scroll(callback) do Motion entrega p; render.js escreve tudo num único frame.render; placas por clip-path em p >= 0,85 com inert; modo estático (reduced motion, altura < 500px, js-falhou) sem pista.
// Seção da direção: 5.1. Frente dona: topo.
// STUB da fundação: respeita o contrato e não faz nada; o HTML já funciona sem ele.

/**
 * @param {{ raiz: HTMLElement, estatico: boolean, gatilho: 'imediato'|'vista'|'ponteiro'|'foco', evento: Event|null }} contexto
 * @returns {() => void} limpeza: remove listeners, observers, timers e animações criados aqui
 */
export function init(contexto) {
  void contexto;
  return () => {};
}
