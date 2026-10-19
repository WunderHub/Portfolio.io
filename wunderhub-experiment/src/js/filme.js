// Fachada de vídeo do showreel: troca o poster por <video> só no clique (WebM/MP4, 1080 ou 720), pausa fora da tela, com a aba oculta e no pagehide; erro devolve o poster.
// Seção da direção: 9.5. Frente dona: trabalhos.
// STUB da fundação: respeita o contrato e não faz nada; o HTML já funciona sem ele.

/**
 * @param {{ raiz: HTMLElement, estatico: boolean, gatilho: 'imediato'|'vista'|'ponteiro'|'foco', evento: Event|null }} contexto
 * @returns {() => void} limpeza: remove listeners, observers, timers e animações criados aqui
 */
export function init(contexto) {
  void contexto;
  return () => {};
}
