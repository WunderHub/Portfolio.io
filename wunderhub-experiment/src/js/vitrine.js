// Momento 2, o letreiro se parte (seções 5.2 e 8). Frente dona: trabalhos.
//
// Cada linha de #trabalhos tem um estado numérico (0 = fechada, 1 = aberta) por camada:
//   painel   → grid-template-rows: <v>fr                     480ms --ease-corte / 240ms --ease-saida
//   fenda    → metades do nome (4px fechada, 16px aberta)    240ms --ease-corte / 200ms --ease-saida
//   persiana → persiana de cada quadro e escala da imagem    520ms --ease-corte, stagger 60ms / 200ms
//   marcador → opacidade e y dos marcadores A/B/C            160ms --ease-resposta, atraso 320ms, stagger 60ms
//   texto    → opacidade do objetivo, decisões e "Testar aqui"  180ms, atraso 200ms
// Motion anima só números (animate(de, para, { onUpdate })) e um único escritor, em frame.render,
// transforma o estado em estilos inline. Assim nenhuma propriedade tem dois donos, uma interrupção
// parte do valor atual (stop() e nova animação, sem fila) e o mesmo escritor corrige a rolagem no
// mesmo quadro em que o layout muda (sem um quadro de atraso).
//
// Rolagem: ao abrir uma linha enquanto outra, acima dela, se fecha, a linha escolhida fica parada sob o
// ponteiro (a rolagem compensa o painel que encolhe) e desliza até o enquadramento "nearest" do
// scrollIntoView, na mesma curva do painel. Pelo hash (#conceito-<slug>) o enquadramento é "start".
// Qualquer gesto de rolagem do visitante (roda, toque, teclas) solta o controle na hora.
import { animate, frame, cancelFrame } from 'motion';
import { easeCorte, easeResposta, easeSaida, dur, stagger, PERPENDICULAR } from './motion/tokens.js';
import { preferencias } from './motion/preferencias.js';
import { porSlug, posicoesDecisoes } from '../data/conceitos.js';

const FENDA_FECHADA = 4; // px, só a metade de baixo, na perpendicular
const FENDA_CIMA = 8; // px que a metade de cima sobe ao abrir
const FENDA_BAIXO = 8; // px totais da metade de baixo aberta (4 + 4)
const ESCALA_IMAGEM = 0.04; // 1,04 → 1
const Y_MARCADOR = 8; // px
const LETRAS = ['A', 'B', 'C'];

const px = (n) => `${Math.round(n * 1000) / 1000}px`;
const perpendicular = (d) => `translate(${px(PERPENDICULAR[0] * d)}, ${px(PERPENDICULAR[1] * d)})`;
const arred = (n) => Math.round(n * 10000) / 10000;

/** Escreve só quando o valor muda (evita invalidar estilo à toa a cada quadro). */
function definir(el, prop, valor) {
  const cache = (el.__whEstilo ||= {});
  if (cache[prop] === valor) return;
  cache[prop] = valor;
  el.style[prop] = valor;
}
function limparEstilo(el, props) {
  for (const prop of props) el.style[prop] = '';
  delete el.__whEstilo;
}

function pxDe(valor) {
  const n = parseFloat(valor);
  return Number.isFinite(n) ? n : 0;
}

/**
 * @param {{ raiz: HTMLElement, estatico: boolean, gatilho: string, evento: Event|null }} contexto
 * @returns {() => void}
 */
export function init({ estatico }) {
  const secao = document.getElementById('trabalhos');
  if (!secao) return () => {};

  const linhas = [...secao.querySelectorAll('.conceito[data-conceito]')].map(montarLinha).filter(Boolean);
  if (!linhas.length) return () => {};
  const porId = new Map(linhas.map((l) => [l.li.id, l]));

  const limpezas = [];
  const ouvir = (alvo, tipo, fn, opcoes) => {
    alvo.addEventListener(tipo, fn, opcoes);
    limpezas.push(() => alvo.removeEventListener(tipo, fn, opcoes));
  };

  // ---------- marcadores e falha de imagem (valem também no modo estático) ----------
  for (const l of linhas) {
    for (const q of l.quadros) {
      posicionarMarcadores(l.slug, q);
      const falhou = () => marcarFalha(q);
      if (q.img.complete && q.img.getAttribute('src') && q.img.naturalWidth === 0) falhou();
      ouvir(q.img, 'error', falhou);
    }
  }
  secao.classList.add('marcadores-prontos');

  // Teto de 3s estourado: tudo fica aberto e estático (mesmo estado do HTML sem JS).
  if (estatico) {
    return () => {
      for (const fn of limpezas.splice(0)) fn();
      secao.classList.remove('marcadores-prontos');
    };
  }

  let guia = null; // { linha, topo, deslocamento, p, animacao }: enquadramento em curso

  // ---------- estado inicial, sem animação ----------
  secao.classList.add('vitrine-ativa');
  const alvoHash = porId.get(decodeURIComponent(location.hash.slice(1)));
  const inicial = alvoHash || linhas[0];
  // a linha do hash (ou a primeira que estiver na tela) não pode pular quando as outras fecham
  const ancora = (alvoHash && naTela(alvoHash.li) && alvoHash) || linhas.find((l) => naTela(l.li));
  const topoAntes = ancora?.li.getBoundingClientRect().top;
  for (const l of linhas) {
    l.botao.hidden = false;
    definirAberta(l, l === inicial);
    for (const chave of camadas(l)) definirValor(l, chave, l === inicial ? 1 : 0);
  }
  escrever();
  if (ancora) {
    const desvio = ancora.li.getBoundingClientRect().top - topoAntes;
    if (Math.abs(desvio) > 0.5) window.scrollBy({ top: desvio, behavior: 'instant' });
  }

  // ---------- escritor único ----------

  function agendar() {
    frame.render(escrever);
  }

  function escrever() {
    for (const l of linhas) escreverLinha(l);
    if (guia) {
      const atual = guia.linha.li.getBoundingClientRect().top;
      const desejado = guia.topo - guia.p * guia.deslocamento;
      const diferenca = atual - desejado;
      if (Math.abs(diferenca) >= 0.5) window.scrollBy({ top: diferenca, behavior: 'instant' });
    }
  }

  function escreverLinha(l) {
    const v = l.v;
    definir(l.painel, 'gridTemplateRows', v.painel >= 1 ? '1fr' : `${arred(Math.max(0, v.painel))}fr`);
    definir(l.cima, 'transform', perpendicular(-FENDA_CIMA * v.fenda));
    definir(l.baixo, 'transform', perpendicular(FENDA_FECHADA + (FENDA_BAIXO - FENDA_FECHADA) * v.fenda));
    for (const q of l.quadros) {
      const k = arred(v[`persiana-${q.tipo}`]);
      definir(q.persiana, 'transform', k >= 1 ? '' : `translate(calc(var(--persiana-x) * ${k}), calc(var(--persiana-y) * ${k}))`);
      definir(q.img, 'transform', k >= 1 ? '' : `scale(${arred(1 + ESCALA_IMAGEM * (1 - k))})`);
      q.marcadores.forEach((m, i) => {
        const o = arred(v[`marcador-${q.tipo}-${i}`]);
        definir(m, 'opacity', o >= 1 ? '' : String(o));
        definir(m, 'transform', o >= 1 ? '' : `translateY(${px(Y_MARCADOR * (1 - o))})`);
      });
    }
    const t = arred(v.texto);
    definir(l.texto, 'opacity', t >= 1 ? '' : String(t));
  }

  // ---------- animações ----------
  function camadas(l) {
    const chaves = ['painel', 'fenda', 'texto'];
    for (const q of l.quadros) {
      chaves.push(`persiana-${q.tipo}`);
      q.marcadores.forEach((_, i) => chaves.push(`marcador-${q.tipo}-${i}`));
    }
    return chaves;
  }

  function definirValor(l, chave, valor) {
    l.v[chave] = valor;
  }

  function parar(l) {
    for (const a of l.animacoes) a.stop();
    l.animacoes.clear();
  }

  function tween(l, chave, para, opcoes) {
    if (l.v[chave] === para && !opcoes.delay) return;
    const a = animate(l.v[chave], para, {
      ...opcoes,
      onUpdate: (valor) => {
        l.v[chave] = valor;
        agendar();
      },
      onComplete: () => {
        l.v[chave] = para;
        l.animacoes.delete(a);
        agendar();
      },
    });
    l.animacoes.add(a);
  }

  const instantaneo = () => preferencias.reduzido;

  function definirAberta(l, aberta) {
    l.aberto = aberta;
    l.li.toggleAttribute('data-aberto', aberta);
    l.botao.setAttribute('aria-expanded', String(aberta));
    l.rotulo.textContent = aberta ? 'Fechar decisões' : 'Ver decisões';
    l.painel.inert = !aberta;
  }

  /** Quadros e marcadores que estão de fato na tela neste layout (celular ou desktop + celular). */
  function visiveis(l) {
    const quadros = l.quadros.filter((q) => q.el.offsetParent !== null || getComputedStyle(q.el).position === 'fixed');
    const comMarcadores = quadros.find((q) => q.marcadoresEl.offsetParent !== null);
    return { quadros, comMarcadores };
  }

  function abrir(l, { enquadrar = 'nearest' } = {}) {
    if (l.aberto) return;
    const outras = linhas.filter((o) => o !== l && o.aberto);
    const plano = planejar(l, enquadrar);
    for (const o of outras) fechar(o, { focar: false, mexerNoHash: false });

    definirAberta(l, true); // o inert sai antes da animação
    parar(l);
    if (instantaneo()) {
      for (const chave of camadas(l)) l.v[chave] = 1;
    } else {
      const { quadros, comMarcadores } = visiveis(l);
      tween(l, 'painel', 1, { duration: dur.painel, ease: easeCorte });
      tween(l, 'fenda', 1, { duration: dur.placa, ease: easeCorte });
      for (const q of l.quadros) {
        const i = quadros.indexOf(q);
        if (i < 0) l.v[`persiana-${q.tipo}`] = 1;
        else tween(l, `persiana-${q.tipo}`, 1, { duration: dur.revelacao, ease: easeCorte, delay: i * stagger.captura });
        q.marcadores.forEach((_, j) => {
          const chave = `marcador-${q.tipo}-${j}`;
          if (q !== comMarcadores) l.v[chave] = 1;
          else tween(l, chave, 1, { duration: dur.resposta, ease: easeResposta, delay: 0.32 + j * stagger.captura });
        });
      }
      tween(l, 'texto', 1, { duration: 0.18, ease: easeResposta, delay: 0.2 });
    }
    history.replaceState(history.state, '', `#${l.li.id}`);
    guiar(plano);
    agendar();
  }

  function fechar(l, { focar = true, mexerNoHash = true } = {}) {
    if (!l.aberto) return;
    // o foco sai do painel antes de ele ficar inert
    if (focar) l.botao.focus({ preventScroll: true });
    definirAberta(l, false);
    parar(l);
    if (instantaneo()) {
      for (const chave of camadas(l)) l.v[chave] = 0;
    } else {
      tween(l, 'painel', 0, { duration: dur.saidaLonga, ease: easeSaida });
      tween(l, 'fenda', 0, { duration: dur.saida, ease: easeSaida });
      tween(l, 'texto', 0, { duration: dur.saida, ease: easeSaida });
      for (const q of l.quadros) {
        // a persiana volta pelo mesmo caminho; os marcadores saem antes dela cobrir a imagem
        tween(l, `persiana-${q.tipo}`, 0, { duration: dur.saida, ease: easeSaida });
        q.marcadores.forEach((_, j) => tween(l, `marcador-${q.tipo}-${j}`, 0, { duration: dur.toque, ease: easeSaida }));
      }
    }
    if (mexerNoHash && location.hash === `#${l.li.id}`) {
      history.replaceState(history.state, '', location.pathname + location.search);
    }
    if (focar) {
      // se o topo da linha estiver acima do header, ele volta para a tela junto com o fechamento
      const { topo } = limites();
      const r = l.li.getBoundingClientRect();
      if (r.top < topo) guiar({ linha: l, topo: r.top, deslocamento: r.top - topo });
    }
    agendar();
  }

  // ---------- enquadramento ----------
  function limites() {
    const cs = getComputedStyle(document.documentElement);
    const topo = pxDe(cs.scrollPaddingTop);
    const base = innerHeight - pxDe(cs.scrollPaddingBottom);
    return { topo, base };
  }

  /** Onde a linha deve terminar (enquadramento nearest ou start), calculado com a altura final. */
  function planejar(l, enquadrar) {
    const { topo, base } = limites();
    const r = l.li.getBoundingClientRect();
    const alturaFinal = r.height + Math.max(0, l.interior.offsetHeight - l.miolo.offsetHeight);
    let alvo = r.top;
    if (enquadrar === 'start') {
      alvo = topo;
    } else if (r.top < topo) {
      alvo = topo;
    } else if (r.top + alturaFinal > base) {
      alvo = alturaFinal <= base - topo ? base - alturaFinal : topo;
    }
    return { linha: l, topo: r.top, deslocamento: r.top - alvo };
  }

  let soltarGestos = () => {};
  function guiar(plano) {
    encerrarGuia();
    if (!plano) return;
    const temOutraFechando = linhas.some((o) => o !== plano.linha && o.animacoes.size);
    if (Math.abs(plano.deslocamento) < 1 && !temOutraFechando) return;
    if (instantaneo()) {
      // tudo já está no estado final: escreve, mede e enquadra de uma vez
      guia = { ...plano, p: 1 };
      escrever();
      guia = null;
      return;
    }
    guia = { ...plano, p: 0 };
    guia.animacao = animate(0, 1, {
      duration: dur.painel,
      ease: easeCorte,
      onUpdate: (p) => {
        if (!guia) return;
        guia.p = p;
        agendar();
      },
      onComplete: () => {
        if (guia) guia.p = 1;
        escrever();
        encerrarGuia();
      },
    });
    // o visitante rolando assume o controle na hora
    const soltar = () => encerrarGuia();
    const teclas = (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) encerrarGuia();
    };
    const opcoes = { passive: true, capture: true };
    window.addEventListener('wheel', soltar, opcoes);
    window.addEventListener('touchstart', soltar, opcoes);
    window.addEventListener('keydown', teclas, opcoes);
    soltarGestos = () => {
      window.removeEventListener('wheel', soltar, opcoes);
      window.removeEventListener('touchstart', soltar, opcoes);
      window.removeEventListener('keydown', teclas, opcoes);
    };
  }
  function encerrarGuia() {
    if (!guia) return;
    const g = guia;
    guia = null;
    g.animacao?.stop();
    soltarGestos();
    soltarGestos = () => {};
  }

  // ---------- eventos ----------
  ouvir(secao, 'click', (e) => {
    const botao = e.target.closest('[data-alternar]');
    if (!botao) return;
    const l = linhas.find((x) => x.botao === botao);
    if (!l) return;
    if (l.aberto) fechar(l);
    else abrir(l);
  });

  ouvir(secao, 'keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    const l = linhas.find((x) => x.aberto && x.li.contains(document.activeElement));
    if (!l) return;
    e.preventDefault();
    fechar(l);
  });

  ouvir(window, 'hashchange', () => {
    const l = porId.get(decodeURIComponent(location.hash.slice(1)));
    if (l && !l.aberto) abrir(l, { enquadrar: 'start' });
  });

  return () => {
    encerrarGuia();
    cancelFrame(escrever);
    for (const fn of limpezas.splice(0)) fn();
    for (const l of linhas) {
      parar(l);
      l.botao.hidden = true;
      l.botao.setAttribute('aria-expanded', 'true');
      l.rotulo.textContent = 'Fechar decisões';
      l.painel.inert = false;
      l.li.removeAttribute('data-aberto');
      limparEstilo(l.painel, ['gridTemplateRows']);
      limparEstilo(l.cima, ['transform']);
      limparEstilo(l.baixo, ['transform']);
      limparEstilo(l.texto, ['opacity']);
      for (const q of l.quadros) {
        limparEstilo(q.persiana, ['transform']);
        limparEstilo(q.img, ['transform']);
        for (const m of q.marcadores) limparEstilo(m, ['opacity', 'transform']);
      }
    }
    secao.classList.remove('vitrine-ativa', 'marcadores-prontos');
  };
}

// ---------- montagem ----------
function montarLinha(li) {
  const slug = li.dataset.conceito;
  const botao = li.querySelector('[data-alternar]');
  const painel = li.querySelector('.conceito__painel');
  const miolo = li.querySelector('.conceito__miolo');
  const interior = li.querySelector('.conceito__interior');
  const cima = li.querySelector('.nome__metade--cima');
  const baixo = li.querySelector('.nome__metade--baixo');
  const texto = li.querySelector('.conceito__texto');
  if (!porSlug[slug] || !botao || !painel || !miolo || !interior || !cima || !baixo || !texto) return null;
  const quadros = [...li.querySelectorAll('[data-quadro]')].map((el) => ({
    el,
    tipo: el.dataset.quadro,
    img: el.querySelector('.quadro__img'),
    persiana: el.querySelector('.quadro__persiana'),
    falha: el.querySelector('.quadro__falha'),
    marcadoresEl: el.querySelector('.quadro__marcadores'),
    marcadores: [...el.querySelectorAll('.quadro__marcador')],
  }));
  const v = { painel: 1, fenda: 1, texto: 1 };
  for (const q of quadros) {
    v[`persiana-${q.tipo}`] = 1;
    q.marcadores.forEach((_, i) => (v[`marcador-${q.tipo}-${i}`] = 1));
  }
  return {
    li,
    slug,
    botao,
    rotulo: botao.querySelector('[data-rotulo]') || botao,
    painel,
    miolo,
    interior,
    cima,
    baixo,
    texto,
    quadros,
    aberto: true,
    v,
    animacoes: new Set(),
  };
}

function posicionarMarcadores(slug, q) {
  const posicoes = posicoesDecisoes(slug, q.tipo);
  if (!posicoes) {
    q.marcadoresEl.hidden = true;
    return;
  }
  q.marcadores.forEach((m, i) => {
    const p = posicoes[m.dataset.letra || LETRAS[i]];
    if (!p) {
      m.hidden = true;
      return;
    }
    m.style.setProperty('--x', `${p.x}%`);
    m.style.setProperty('--y', `${p.y}%`);
  });
}

function marcarFalha(q) {
  q.el.classList.add('quadro--falhou');
  if (q.falha) q.falha.hidden = false;
}

function naTela(el) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < innerHeight;
}
