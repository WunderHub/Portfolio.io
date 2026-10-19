// URLs das fotos (WebP em três larguras, seção 7.4) com hash e base path resolvidos pelo Vite.
// Só os arquivos de img/ (a pasta img/originais/ fica de fora do glob).
const arquivos = import.meta.glob('./img/*.webp', { eager: true, query: '?url', import: 'default' });

const LARGURAS_PECA = [300, 600, 1200];

/** URL de uma foto numa largura: url('lt-caneca-cobalto', 600). */
export function url(foto, largura) {
  const caminho = arquivos[`./img/${foto}-${largura}.webp`];
  if (!caminho) throw new Error(`Foto não encontrada: ${foto}-${largura}.webp`);
  return caminho;
}

/** srcset das peças (1:1): "…-300.webp 300w, …-600.webp 600w, …-1200.webp 1200w". */
export const srcsetPeca = (foto) => LARGURAS_PECA.map((l) => `${url(foto, l)} ${l}w`).join(', ');

/** Aplica foto, srcset, sizes e alt num <img> de peça. */
export function aplicarFoto(img, foto, { sizes, alt } = {}) {
  img.srcset = srcsetPeca(foto);
  img.src = url(foto, 600);
  if (sizes) img.sizes = sizes;
  if (alt !== undefined) img.alt = alt;
  img.dataset.foto = foto;
}

/** Tamanhos exibidos (atributo sizes) dos quadros de peça em cada layout. */
export const SIZES = {
  destaque: '(min-width: 1024px) 46vw, (min-width: 768px) 62vw, calc(100vw - 32px)',
  peca: '(min-width: 1024px) 23vw, (min-width: 768px) 31vw, calc(50vw - 24px)',
  combina: '(min-width: 1024px) 30vw, (min-width: 768px) 31vw, 68vw',
  produto: '(min-width: 1024px) 56vw, 100vw',
  sacola: '88px',
};
