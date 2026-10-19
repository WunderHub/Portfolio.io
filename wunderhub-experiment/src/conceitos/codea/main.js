// Entrada da Côdea, padaria de bairro (seção 7.1). Frente dona: codea.
// Sem backend: a encomenda vive em memória e o resultado se declara demonstração.
import '../comum/selo.css';
import './codea.css';
import { init as iniciarSelo } from '../comum/selo.js';
import { lerCatalogo } from './estado.js';
import { iniciarRelogio, pintarEstado, pintarHorarios } from './relogio.js';
import { iniciarCardapio } from './cardapio.js';
import { iniciarEncomenda } from './encomenda.js';
import { iniciarFornadas } from './fornadas.js';
import { abrirTopo } from './movimento.js';

const raiz = document.documentElement;

function criarAnunciador(regiao) {
  let timer = 0;
  return (texto) => {
    clearTimeout(timer);
    regiao.textContent = '';
    // esvaziar e preencher em outro quadro faz o leitor repetir frases iguais
    timer = setTimeout(() => {
      regiao.textContent = texto;
    }, 60);
  };
}

function iniciar() {
  const limpezas = [iniciarSelo()];
  const corpo = document.body;
  const catalogo = lerCatalogo(corpo.querySelector('[data-lista]'));
  const anunciar = criarAnunciador(corpo.querySelector('[data-anuncio]'));

  const encomenda = iniciarEncomenda({ raiz: corpo, catalogo, anunciar });
  limpezas.push(encomenda.limpar);
  limpezas.push(iniciarCardapio({ raiz: corpo, catalogo, anunciar }));
  const fornadas = iniciarFornadas(corpo.querySelector('[data-fornadas]'));
  limpezas.push(fornadas.limpar);

  const estadoEl = corpo.querySelector('[data-estado]');
  const tabela = corpo.querySelector('[data-horarios]');
  limpezas.push(
    iniciarRelogio((agora) => {
      pintarEstado(estadoEl, agora);
      pintarHorarios(tabela, agora);
      encomenda.atualizarData(agora);
      fornadas.atualizar(agora);
    }),
  );

  abrirTopo(corpo.querySelector('[data-foto-topo]'), corpo.querySelector('[data-etiqueta]'));

  clearTimeout(window.__codea);
  raiz.classList.remove('js-falhou');
  raiz.classList.add('js', 'pronto');
  window.__codea = { desmontar: () => limpezas.forEach((fn) => fn?.()) };
}

try {
  iniciar();
} catch (erro) {
  // a página continua legível no modo sem JS
  console.error(erro);
  raiz.classList.remove('js');
}
