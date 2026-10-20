// Entrada da home (seção 10). Ordem do CSS: tokens → fontes → base → geometria gerada → um arquivo por frente.
import './styles/tokens.css';
import './styles/fontes.css';
import './styles/base.css';
import './styles/generated/letreiro.css';
import './styles/header.css';
import './styles/abertura.css';
import './styles/palco.css';
import './styles/trabalhos.css';
import './styles/servicos.css';
import './styles/processo.css';
import './styles/sobre.css';
import './styles/contato.css';
import './styles/rodape.css';

import { inView } from 'motion';
import './js/motion/preferencias.js'; // liga MotionGlobalConfig.skipAnimations e html.economia já na carga
import * as menu from './js/menu.js';
import * as palco from './js/letreiro/palco.js';
import * as carga from './js/letreiro/carga.js';
import * as barraWhatsapp from './js/barra-whatsapp.js';

// Contrato de módulo: export function init(contexto) → função de limpeza.
// contexto = { raiz, estatico, gatilho, evento }
//   estatico: o teto de 3s estourou antes deste arquivo rodar (html.js-falhou). Menu, diálogos,
//             copiar e configurador funcionam; palco e Porta ficam no estado final, sem animação.
//   gatilho:  'imediato' | 'vista' (a seção chegou a uma tela de distância) | 'ponteiro' | 'foco'
//   evento:   o PointerEvent/FocusEvent que disparou a carga, quando houver.

const raiz = document.documentElement;
const wh = (window.__wh ||= {});
clearTimeout(wh.teto);
const estatico = raiz.classList.contains('js-falhou');
raiz.classList.add('pronto');

const limpezas = new Map();
wh.modulos = limpezas; // para QA: quais módulos iniciaram

function iniciar(nome, modulo, extra) {
  if (limpezas.has(nome)) return;
  try {
    const limpar = modulo.init({ raiz, estatico, gatilho: 'imediato', evento: null, ...extra });
    limpezas.set(nome, typeof limpar === 'function' ? limpar : () => {});
  } catch (erro) {
    // O HTML continua completo e funcional sem o módulo.
    console.error(`[wunderhub] o módulo ${nome} falhou ao iniciar`, erro);
  }
}

/** Desmonta tudo (testes e troca de modo). Cada limpeza remove listeners, observers, timers e animações. */
export function desmontar() {
  for (const [nome, limpar] of limpezas) {
    try {
      limpar();
    } catch (erro) {
      console.error(`[wunderhub] limpeza de ${nome} falhou`, erro);
    }
  }
  limpezas.clear();
}
wh.desmontar = desmontar;

// Imediatos: header/menu, palco, acontecimento de carga e barra de WhatsApp.
iniciar('menu', menu);
iniciar('palco', palco);
iniciar('carga', carga);
iniciar('barra-whatsapp', barraWhatsapp);

// Sob demanda: carrega quando a seção chega a uma tela de distância (inView com margem de 100%)
// ou no primeiro pointerdown/focusin dentro dela (ex.: Tab chegando à Porta antes da rolagem).
const sobDemanda = [
  {
    secao: '#trabalhos',
    modulos: {
      vitrine: () => import('./js/vitrine.js'),
      'teste-dialog': () => import('./js/teste-dialog.js'),
      filme: () => import('./js/filme.js'),
    },
  },
  {
    secao: '#processo',
    modulos: { processo: () => import('./js/processo.js') },
  },
  {
    secao: '#contato',
    modulos: {
      porta: () => import('./js/porta.js'),
      configurador: () => import('./js/configurador.js'),
      'copiar-email': () => import('./js/copiar-email.js'),
    },
  },
];

for (const { secao, modulos } of sobDemanda) {
  const el = document.querySelector(secao);
  if (!el) continue;
  let feito = false;
  let pararVista = () => {};
  const aoPonteiro = (evento) => carregar('ponteiro', evento);
  const aoFoco = (evento) => carregar('foco', evento);
  function carregar(gatilho, evento = null) {
    if (feito) return;
    feito = true;
    pararVista();
    el.removeEventListener('pointerdown', aoPonteiro, true);
    el.removeEventListener('focusin', aoFoco, true);
    for (const [nome, importar] of Object.entries(modulos)) {
      importar()
        .then((modulo) => iniciar(nome, modulo, { gatilho, evento }))
        .catch((erro) => {
          el.dataset.moduloFalhou = ''; // o CSS da seção solta o espaço reservado para os controles
          console.warn(`[wunderhub] não foi possível carregar ${nome}; a página segue no modo estático`, erro);
        });
    }
  }
  el.addEventListener('pointerdown', aoPonteiro, true);
  el.addEventListener('focusin', aoFoco, true);
  pararVista = inView(el, () => carregar('vista'), { margin: '100% 0px 100% 0px' });
}
