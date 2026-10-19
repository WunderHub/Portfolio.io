// Fachada de vídeo do showreel (seção 9.5). Frente dona: trabalhos.
// Nenhum byte de vídeo antes do clique. No clique o botão vira <video controls muted playsinline
// preload="auto" poster> com <source> WebM e MP4 (1080 com largura ≥ 1024px e sem saveData; 720 nos
// demais), play() logo em seguida e o foco vai para o vídeo. Pausa ao sair da tela, com a aba oculta e
// no pagehide. Falha (fonte inexistente, rede, formato): o poster e o botão voltam com o aviso
// "Não foi possível carregar o filme. Tente de novo." numa região role="status".
// URLs com import.meta.env.BASE_URL (arquivos em public/media/), então funcionam sob qualquer base path.
import { inView } from 'motion';
import { preferencias } from './motion/preferencias.js';

const AVISO_FALHA = 'Não foi possível carregar o filme. Tente de novo.';

/**
 * @param {{ raiz: HTMLElement, estatico: boolean, gatilho: string, evento: Event|null }} contexto
 * @returns {() => void}
 */
export function init() {
  const figura = document.querySelector('[data-filme]');
  const quadro = figura?.querySelector('[data-filme-quadro]');
  const botao = figura?.querySelector('[data-filme-abrir]');
  const aviso = figura?.querySelector('[data-filme-aviso]');
  if (!figura || !quadro || !botao || !aviso || typeof HTMLVideoElement === 'undefined') return () => {};

  const media = (nome) => `${import.meta.env.BASE_URL}media/${nome}`;
  let video = null;
  let pararVista = () => {};
  let soltarVideo = () => {};

  figura.hidden = false;

  function fontes() {
    const grande = matchMedia('(min-width: 1024px)').matches && !preferencias.saveData && !preferencias.economia;
    return grande
      ? [
          { src: media('showreel-1080.webm'), type: 'video/webm' },
          { src: media('showreel-1080.mp4'), type: 'video/mp4' },
        ]
      : [{ src: media('showreel-720.mp4'), type: 'video/mp4' }];
  }

  function abrir() {
    if (video) return;
    aviso.textContent = '';
    const v = document.createElement('video');
    v.className = 'filme__video';
    v.controls = true;
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.preload = 'auto';
    v.width = 1280;
    v.height = 720;
    v.poster = media(matchMedia('(min-width: 640px)').matches ? 'showreel-poster-1280.webp' : 'showreel-poster-640.webp');
    const lista = fontes();
    const elementos = lista.map(({ src, type }) => {
      const s = document.createElement('source');
      s.src = src;
      s.type = type;
      v.append(s);
      return s;
    });

    // o erro de rede de cada <source> não borbulha: a última fonte que falha (ou o erro do próprio
    // vídeo, ou o play() recusado por falta de fonte suportada) devolve a fachada
    let falhou = false;
    const falhar = () => {
      if (falhou || video !== v) return;
      falhou = true;
      restaurar({ mensagem: AVISO_FALHA });
    };
    const ultima = elementos.at(-1);
    ultima.addEventListener('error', falhar);
    v.addEventListener('error', falhar);
    soltarVideo = () => {
      ultima.removeEventListener('error', falhar);
      v.removeEventListener('error', falhar);
    };

    video = v;
    botao.replaceWith(v);
    v.focus();
    const tocando = v.play();
    tocando?.catch?.((erro) => {
      if (erro?.name === 'NotSupportedError') falhar();
      // AbortError (pausa ou troca antes de começar) e NotAllowedError não são falha de carga
    });

    // pausa quando sai da tela (o retorno do inView é chamado na saída)
    pararVista = inView(figura, () => () => v.pause(), { amount: 0.25 });
  }

  function restaurar({ mensagem = '' } = {}) {
    if (!video) return;
    const v = video;
    video = null;
    soltarVideo();
    soltarVideo = () => {};
    pararVista();
    pararVista = () => {};
    v.pause();
    v.removeAttribute('src');
    for (const s of v.querySelectorAll('source')) s.remove();
    v.load(); // solta a conexão de mídia
    v.replaceWith(botao);
    aviso.textContent = mensagem;
    if (mensagem) botao.focus();
  }

  const pausar = () => video?.pause();
  const aoVisibilidade = () => {
    if (document.visibilityState === 'hidden') pausar();
  };

  botao.addEventListener('click', abrir);
  document.addEventListener('visibilitychange', aoVisibilidade);
  window.addEventListener('pagehide', pausar);

  return () => {
    botao.removeEventListener('click', abrir);
    document.removeEventListener('visibilitychange', aoVisibilidade);
    window.removeEventListener('pagehide', pausar);
    restaurar();
    aviso.textContent = '';
    figura.hidden = true;
  };
}
