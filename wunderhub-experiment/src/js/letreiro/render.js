// Renderizador do palco: único escritor de transform das metades, opacidade do véu, escala da imagem
// de trás, --peso e --brilho da .fachada, num único frame.render do Motion, só quando um valor
// quantizado muda. Usado por palco.js (não é iniciado pelo main.js).
// Seção da direção: 5.1 (Motores). Frente dona: topo.
// STUB da fundação: a frente topo define a API final.
import { frame, cancelFrame } from 'motion';

/**
 * @param {HTMLElement} fachada
 * @returns {{ escrever: (p: number) => void, destruir: () => void }}
 */
export function criarRenderizador(fachada) {
  let pedido = null;
  let ultimo = -1;
  const desenhar = () => {
    pedido = null;
    void fachada;
  };
  return {
    escrever(p) {
      if (p === ultimo) return;
      ultimo = p;
      if (!pedido) pedido = frame.render(desenhar);
    },
    destruir() {
      if (pedido) cancelFrame(pedido);
      pedido = null;
    },
  };
}
