// Entrada das páginas de Junco Fisioterapia (as 4 páginas) (seção 7.2). Frente: junco.
// Selo comum + CSS da marca + interações. Cada página diz quem é em <body data-pagina>.
import '../comum/selo.css';
import './junco.css';
import '../../js/motion/preferencias.js'; // liga MotionGlobalConfig.skipAnimations com prefers-reduced-motion
import { init as iniciarSelo } from '../comum/selo.js';
import { iniciarMenu } from './menu.js';
import { iniciarAcordeoes } from './acordeao.js';

const raiz = document.documentElement;
const junco = (window.__junco ||= {});
clearTimeout(junco.teto);
// Se o teto de 3s estourou (rede lenta), a página já está no modo sem JS. Como o script chegou,
// volta ao modo com JS: as interações valem mais que evitar um rearranjo tardio.
if (raiz.classList.contains('js-falhou')) {
  raiz.classList.remove('js-falhou');
  raiz.classList.add('js');
}

const limpezas = [];
function iniciar(nome, fn) {
  try {
    const limpar = fn();
    if (typeof limpar === 'function') limpezas.push(limpar);
  } catch (erro) {
    console.error(`junco: ${nome} não iniciou`, erro);
  }
}

iniciar('selo', iniciarSelo);
iniciar('menu', iniciarMenu);
iniciar('acordeoes', iniciarAcordeoes);

const paginas = {
  tratamentos: () => import('./tratamentos.js'),
  agendar: () => import('./agendar.js'),
};
const carregar = paginas[document.body.dataset.pagina];
if (carregar) {
  carregar()
    .then((modulo) => iniciar(document.body.dataset.pagina, modulo.init))
    .catch((erro) => console.warn('junco: módulo da página não carregou', erro))
    .finally(() => raiz.classList.add('pronto'));
} else {
  raiz.classList.add('pronto');
}

junco.desmontar = () => limpezas.splice(0).forEach((fn) => fn());
