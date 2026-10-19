// Relógio da padaria: aberto ou fechado pelo relógio do navegador, datas de retirada e o dia de hoje na tabela.
import { DIAS, HORARIO } from './dados.js';

export const minutosDoDia = (d) => d.getHours() * 60 + d.getMinutes();
export const horarioDo = (diaSemana) => (diaSemana === 0 ? HORARIO.domingo : HORARIO.semana);

/** Frases da barra de estado para o instante d. */
export function estadoDaLoja(d) {
  const dia = d.getDay();
  const m = minutosDoDia(d);
  const h = horarioDo(dia);
  if (m >= h.abre && m < h.fecha) return { aberto: true, frase1: 'Aberto agora.', frase2: `Fecha às ${h.fechaTexto}.` };
  if (m < h.abre) return { aberto: false, frase1: 'Fechado agora.', frase2: `Abre hoje às ${h.abreTexto}.` };
  if (dia === 0) return { aberto: false, frase1: 'Fechado agora.', frase2: 'Abre segunda às 6h30.' };
  return { aberto: false, frase1: 'Fechado agora.', frase2: `Abre amanhã às ${horarioDo((dia + 1) % 7).abreTexto}.` };
}

/** Data n dias depois de d (meio-dia, para não tropeçar no horário de verão). */
export const somarDias = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12);

const dois = (n) => String(n).padStart(2, '0');
/** "sábado 19/10" */
export const rotuloData = (d) => `${DIAS[d.getDay()]} ${dois(d.getDate())}/${dois(d.getMonth() + 1)}`;
/** Chave do dia, para saber quando a data muda. */
export const chaveDia = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** "35 min", "2h", "2h15" */
export function duracao(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r ? `${h}h${dois(r)}` : `${h}h`;
}

export function pintarEstado(el, agora) {
  const e = estadoDaLoja(agora);
  el.dataset.aberto = String(e.aberto);
  el.querySelector('[data-estado-1]').textContent = e.frase1;
  el.querySelector('[data-estado-2]').textContent = e.frase2;
}

export function pintarHorarios(tabela, agora) {
  const hoje = String(agora.getDay());
  for (const tr of tabela.querySelectorAll('tbody tr')) {
    const eHoje = tr.dataset.dia === hoje;
    const pilula = tr.querySelector('.hoje');
    if (eHoje) {
      tr.setAttribute('aria-current', 'date');
      if (!pilula) {
        const span = document.createElement('span');
        span.className = 'hoje';
        span.textContent = 'Hoje';
        tr.querySelector('th').append(' ', span);
      }
    } else {
      tr.removeAttribute('aria-current');
      if (pilula) {
        pilula.previousSibling?.nodeType === 3 && pilula.previousSibling.remove();
        pilula.remove();
      }
    }
  }
}

/**
 * Chama aoTique(agora) já e depois a cada virada de minuto. Volta a conferir quando a aba fica visível
 * (o timer pode ter sido adiado com a aba em segundo plano). Devolve a limpeza.
 */
export function iniciarRelogio(aoTique) {
  let timer = 0;
  const tique = () => {
    const agora = new Date();
    aoTique(agora);
    clearTimeout(timer);
    timer = setTimeout(tique, 60000 - (agora.getSeconds() * 1000 + agora.getMilliseconds()) + 50);
  };
  const aoVoltar = () => {
    if (document.visibilityState === 'visible') tique();
  };
  document.addEventListener('visibilitychange', aoVoltar);
  tique();
  return () => {
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', aoVoltar);
  };
}
