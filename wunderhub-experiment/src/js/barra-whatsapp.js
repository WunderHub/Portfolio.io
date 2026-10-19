// Barra fixa de WhatsApp no mobile: aparece quando #trabalhos chega ao topo, some quando o miolo da Porta fica visível; põe e tira html.com-barra (scroll-padding-bottom).
// Seção da direção: 5.4 (barra) e 2.9. Frente dona: topo.
// STUB da fundação: respeita o contrato e não faz nada; o HTML já funciona sem ele.

/**
 * @param {{ raiz: HTMLElement, estatico: boolean, gatilho: 'imediato'|'vista'|'ponteiro'|'foco', evento: Event|null }} contexto
 * @returns {() => void} limpeza: remove listeners, observers, timers e animações criados aqui
 */
export function init(contexto) {
  void contexto;
  return () => {};
}
