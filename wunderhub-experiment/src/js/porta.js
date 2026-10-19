// A Porta: folhas do letreiro abrem na vertical quando o miolo fica 50% visível (inView) ou instantâneo no focusin (gatilho "foco"); revelação única por visita.
// Seção da direção: 5.4. Frente dona: contato.
// STUB da fundação: respeita o contrato e não faz nada; o HTML já funciona sem ele.

/**
 * @param {{ raiz: HTMLElement, estatico: boolean, gatilho: 'imediato'|'vista'|'ponteiro'|'foco', evento: Event|null }} contexto
 * @returns {() => void} limpeza: remove listeners, observers, timers e animações criados aqui
 */
export function init(contexto) {
  void contexto;
  return () => {};
}
