// Fornadas do dia (seção 7.1): a sequência real, com o trilho preenchido até a hora de agora.
// O marcador "agora" anda entre as fornadas pelo relógio do navegador; a próxima mostra quanto falta.
// A grade de fornadas é a de segunda a sábado; no domingo o trilho fica sem marcação.
import { animate, inView } from 'motion';
import { minutosDoDia, duracao } from './relogio.js';
import { ease, reduzido } from './movimento.js';

export function iniciarFornadas(linha) {
  const itens = [...linha.querySelectorAll('[data-minuto]')];
  const minutos = itens.map((li) => Number(li.dataset.minuto));
  const trilho = linha.querySelector('.fornadas__trilho');
  const feito = linha.querySelector('[data-feito]');
  const agoraEl = linha.querySelector('[data-agora]');
  let centros = [];
  let alvo = { fracao: 0, y: 0, visivel: false };
  let revelado = false;
  let ultimo = null;

  function medir() {
    const topo = linha.getBoundingClientRect().top;
    centros = itens.map((li) => {
      const r = li.querySelector('time').getBoundingClientRect();
      return r.top - topo + r.height / 2;
    });
    trilho.style.setProperty('--trilho-topo', `${centros[0]}px`);
    trilho.style.setProperty('--trilho-altura', `${centros.at(-1) - centros[0]}px`);
  }

  function calcular(agora) {
    const m = minutosDoDia(agora);
    const domingo = agora.getDay() === 0;
    for (const li of itens) {
      li.removeAttribute('data-passou');
      li.querySelector('.fornada__proxima')?.remove();
    }
    if (domingo) return { fracao: 0, y: 0, visivel: false };
    itens.forEach((li, i) => {
      if (minutos[i] <= m) li.dataset.passou = '';
    });
    const proxima = minutos.findIndex((min) => min > m);
    if (proxima !== -1) {
      const pilula = document.createElement('span');
      pilula.className = 'fornada__proxima';
      pilula.textContent = `Daqui a ${duracao(minutos[proxima] - m)}`;
      itens[proxima].querySelector('time').after(pilula);
    }
    const altura = centros.at(-1) - centros[0];
    if (m < minutos[0]) return { fracao: 0, y: 0, visivel: false };
    if (m >= minutos.at(-1)) return { fracao: 1, y: altura, visivel: false };
    const i = proxima - 1;
    const t = (m - minutos[i]) / (minutos[i + 1] - minutos[i]);
    const y = centros[i] + t * (centros[i + 1] - centros[i]) - centros[0];
    return { fracao: altura ? y / altura : 0, y, visivel: true };
  }

  function aplicar(animado) {
    const opcoes = animado && !reduzido() ? { duration: 1.3, ease } : { duration: 0 };
    agoraEl.hidden = !alvo.visivel;
    animate(feito, { scaleY: alvo.fracao }, opcoes);
    animate(agoraEl, { y: alvo.y }, opcoes);
  }

  function atualizar(agora = ultimo || new Date()) {
    ultimo = agora;
    if (!centros.length) medir();
    alvo = calcular(agora);
    if (revelado) aplicar(false);
  }

  // estado inicial: trilho vazio até a seção aparecer
  animate(feito, { scaleY: 0 }, { duration: 0 });
  animate(agoraEl, { y: 0 }, { duration: 0 });

  const pararVista = inView(
    linha,
    () => {
      if (revelado) return;
      revelado = true;
      aplicar(true);
    },
    { amount: 0.35 },
  );

  const observador = new ResizeObserver(() => {
    medir();
    if (ultimo) atualizar(ultimo);
  });
  observador.observe(linha);

  return {
    atualizar,
    limpar() {
      pararVista();
      observador.disconnect();
    },
  };
}
