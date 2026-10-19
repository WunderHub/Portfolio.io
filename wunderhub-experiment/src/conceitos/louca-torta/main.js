// Entrada das páginas da Louça Torta, loja e produto (seção 7.3). Frente dona: louca-torta.
// Sem backend: a sacola fica neste navegador e a finalização se declara demonstração.
import '../comum/selo.css';
import './loja.css';
import { init as iniciarSelo } from '../comum/selo.js';
import { iniciarMenu } from './menu.js';
import { iniciarSacola } from './sacola.js';
import { iniciarLoja } from './loja.js';
import { iniciarProduto } from './produto.js';
import { sincronizarMovimento, abrirLoja } from './movimento.js';

const raiz = document.documentElement;

function iniciar() {
  const corpo = document.body;
  const pagina = corpo.dataset.pagina;
  const limpezas = [iniciarSelo(), sincronizarMovimento(), iniciarMenu(corpo)];

  let loja = null;
  const sacola = iniciarSacola({
    raiz: corpo,
    baseProduto: pagina === 'produto' ? './' : 'produto/',
    aoIrParaPecas: pagina === 'loja' ? () => loja?.irParaPecas() : undefined,
  });
  limpezas.push(sacola.limpar);

  if (pagina === 'loja') {
    loja = iniciarLoja({ raiz: corpo });
    limpezas.push(loja.limpar);
    limpezas.push(
      abrirLoja({
        aneis: [...corpo.querySelectorAll('[data-cabecalho] .anel')],
        foto: corpo.querySelector('[data-foto-topo]'),
      }),
    );
  } else if (pagina === 'produto') {
    limpezas.push(iniciarProduto({ raiz: corpo, sacola }).limpar);
  }

  clearTimeout(window.__loucaTorta);
  raiz.classList.remove('js-falhou');
  raiz.classList.add('js', 'pronto');
  window.__loucaTorta = { sacola, desmontar: () => limpezas.forEach((fn) => fn?.()) };
}

try {
  iniciar();
} catch (erro) {
  // a página continua legível: o HTML estático tem todo o conteúdo
  console.error('Louça Torta: falha ao iniciar', erro);
  clearTimeout(window.__loucaTorta);
  raiz.classList.remove('js');
  raiz.classList.add('js-falhou', 'pronto');
}
