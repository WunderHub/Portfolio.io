// Menu mobile (<768px): troca o link "Menu" (#mapa) por botão que abre o <dialog id="menu"> com showModal(); Escape, Fechar, destinos, volta do foco, fecha sem animação ao passar de 767px.
// Seção da direção: 3.4 (Menu mobile) e 6. Frente dona: topo.
// STUB da fundação: respeita o contrato e não faz nada; o HTML já funciona sem ele.

/**
 * @param {{ raiz: HTMLElement, estatico: boolean, gatilho: 'imediato'|'vista'|'ponteiro'|'foco', evento: Event|null }} contexto
 * @returns {() => void} limpeza: remove listeners, observers, timers e animações criados aqui
 */
export function init(contexto) {
  void contexto;
  return () => {};
}
