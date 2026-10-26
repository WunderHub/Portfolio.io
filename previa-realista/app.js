// Prévia realista da WunderHub: abertura com o W acendendo, vídeo dos cabos atrás da página
// inteira, luz que segue o mouse, textos que acendem com a rolagem, chão de colmeia no fim
// e painel de orçamento pelo WhatsApp.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const retrato = matchMedia('(orientation: portrait)');
  const mouseFino = matchMedia('(hover: hover) and (pointer: fine)');
  const comAbertura = !reduce.matches && !!document.querySelector('.abertura');

  /* Título: cada palavra sobe quando a abertura termina */
  document.querySelectorAll('[data-words]').forEach((el) => {
    const out = document.createDocumentFragment();
    let i = 0;
    el.childNodes.forEach((n) => {
      const isEm = n.nodeName === 'EM';
      n.textContent.trim().split(/\s+/).filter(Boolean).forEach((t) => {
        const w = document.createElement('span');
        w.className = 'w';
        const inner = document.createElement('span');
        inner.style.transitionDelay = `${0.1 + i++ * 0.07}s`;
        if (isEm) { const em = document.createElement('em'); em.textContent = t; inner.append(em); } else inner.textContent = t;
        w.append(inner);
        out.append(w, document.createTextNode(' '));
      });
    });
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    el.textContent = '';
    el.append(out);
    [...el.children].forEach((c) => c.setAttribute('aria-hidden', 'true'));
  });

  /* Abertura: dura 2,6 s; clique, tecla, toque ou rolagem pulam */
  let pronto = false;
  function mostrarTitulo() {
    if (pronto) return;
    pronto = true;
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));
  }
  if (comAbertura) {
    const pular = () => { root.classList.add('pular'); mostrarTitulo(); };
    const timer = setTimeout(mostrarTitulo, 1750);
    const fim = new AbortController();
    setTimeout(() => fim.abort(), 2700);
    const opts = { once: true, passive: true, signal: fim.signal };
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) => addEventListener(ev, () => { clearTimeout(timer); fim.abort(); pular(); }, opts));
  } else {
    mostrarTitulo();
  }

  /* Texto que acende: separa as palavras para acender uma a uma */
  const acesos = [...document.querySelectorAll('[data-acende]')].map((el) => {
    const palavras = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    const spans = palavras.map((t, i) => {
      const s = document.createElement('span');
      s.className = 'p';
      s.textContent = t;
      el.append(s, i < palavras.length - 1 ? ' ' : '');
      return s;
    });
    return { el, spans, n: -1 };
  });
  function acender() {
    const h = innerHeight;
    acesos.forEach((a) => {
      let n;
      if (reduce.matches) n = a.spans.length;
      else {
        const r = a.el.getBoundingClientRect();
        // acende do momento em que o texto entra pelos 90% da tela até chegar nos 40%;
        // se a página acaba antes disso (texto no fim), termina de acender no fim da rolagem
        const max = root.scrollHeight - h;
        const topoNoFim = r.top - (max - scrollY);
        const ini = h * 0.9;
        const fim = Math.max(h * 0.4, topoNoFim + 2);
        const t = ini > fim ? (ini - r.top) / (ini - fim) : 1;
        n = Math.round(Math.min(1, Math.max(0, t)) * a.spans.length);
      }
      if (n === a.n) return;
      a.n = n;
      a.spans.forEach((s, i) => {
        s.classList.toggle('on', i < n);
        s.classList.toggle('frente', i === n - 1 && n < a.spans.length);
      });
    });
  }

  /* Cena de fundo: vídeo dos cabos o tempo todo; o chão de colmeia sobe no fim da página */
  const cena = document.querySelector('.cena');
  const vCabos = document.querySelector('.cabos video');
  const vChao = document.querySelector('.chao video');
  const economia = navigator.connection && navigator.connection.saveData;
  const podeVideo = () => !reduce.matches && !economia;

  function carregar(v) {
    const src = retrato.matches ? v.dataset.srcM : v.dataset.src;
    if (v.getAttribute('src') !== src) {
      v.classList.remove('tocando');
      v.src = src;
      v.addEventListener('playing', () => v.classList.add('tocando'), { once: true });
    }
  }
  function tocar(v, sim) {
    if (!v) return;
    if (sim && podeVideo()) { carregar(v); if (v.paused) v.play().catch(() => {}); }
    else if (!v.paused) v.pause();
  }

  /* Descida: o vídeo da câmera é baixado inteiro e a rolagem escolhe o quadro */
  const vDesc = document.querySelector('.descida video');
  const DESC_FIM = 0.9;            // a câmera chega ao chão em 90% da rolagem
  let modoDescida = false, alvo = 0, mostrado = 0, rafD = null, ultimo = 0, buscando = false, pendente = null;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  // até 62% da rolagem a câmera passeia entre os cabos (início do vídeo, sem chão);
  // dali até 90% ela desce e o chão de colmeia aparece
  const tempoDe = (p) => (p < 0.62 ? (p / 0.62) * 0.28 : 0.28 + clamp((p - 0.62) / (DESC_FIM - 0.62)) * 0.72);

  function buscar(t) {
    if (!vDesc.duration) return;
    if (buscando) { pendente = t; return; }
    buscando = true;
    vDesc.currentTime = t;
  }
  vDesc.addEventListener('seeked', () => {
    buscando = false;
    if (pendente !== null) { const t = pendente; pendente = null; buscar(t); }
  });
  function passoDesc(agora) {
    const dt = Math.min(100, agora - (ultimo || agora));
    ultimo = agora;
    mostrado += (alvo - mostrado) * (1 - Math.pow(1 - 0.14, dt / 16.667));
    if (Math.abs(alvo - mostrado) < 0.0005) { mostrado = alvo; rafD = null; ultimo = 0; }
    else rafD = requestAnimationFrame(passoDesc);
    buscar(mostrado * (vDesc.duration - 0.05));
  }
  async function carregarDescida() {
    if (vDesc.dataset.carregando || !podeVideo()) return;
    vDesc.dataset.carregando = '1';
    try {
      const url = retrato.matches ? vDesc.dataset.srcM : vDesc.dataset.src;
      const res = await fetch(url);
      if (!res.ok) throw new Error('descida');
      vDesc.src = URL.createObjectURL(await res.blob());
      vDesc.load();
      await new Promise((ok, erro) => {
        vDesc.addEventListener('loadeddata', ok, { once: true });
        vDesc.addEventListener('error', erro, { once: true });
      });
      modoDescida = true;
      atualizar();
    } catch (e) {
      // sem a descida a página continua com os loops e o chão subindo
    }
  }

  let pousou = false;
  function atualizar() {
    const max = root.scrollHeight - innerHeight;
    const y = scrollY;
    const p = max > 0 ? clamp(y / max) : 0;
    root.style.setProperty('--p', p.toFixed(4));
    const desc = modoDescida && podeVideo();
    cena.classList.toggle('descendo', desc);
    let chao, cobreCabos;
    if (desc) {
      // topo: loop dos cabos; meio: descida guiada pela rolagem; fim: loop do chão.
      // as trocas entre eles são dissolvências curtas (CSS), nunca uma mistura parada no meio
      const naDescida = p > 0.004;
      const noChao = p >= DESC_FIM + 0.006;
      cena.classList.toggle('na-descida', naDescida);
      cena.classList.toggle('no-chao', noChao);
      alvo = tempoDe(p);
      if (rafD === null) rafD = requestAnimationFrame(passoDesc);
      chao = noChao ? 1 : 0;
      cobreCabos = naDescida;
    } else {
      cena.classList.remove('na-descida', 'no-chao');
      // o chão começa a subir quando falta 1,3 tela para o fim
      const faixa = innerHeight * 1.3;
      chao = clamp((y - (max - faixa)) / faixa);
      cena.style.setProperty('--chao', (1 - Math.pow(1 - chao, 2)).toFixed(4));
      cobreCabos = chao >= 1;
    }
    if (chao > 0.97 && !pousou) { pousou = true; cena.classList.add('pousou'); }
    if (chao < 0.6 && pousou) { pousou = false; cena.classList.remove('pousou'); }
    tocar(vChao, chao > 0);
    tocar(vCabos, !cobreCabos);
    acender();
  }
  // baixa a descida depois da abertura (ou na primeira rolagem), sem disputar com o começo
  setTimeout(carregarDescida, comAbertura ? 2600 : 600);
  addEventListener('scroll', carregarDescida, { once: true, passive: true });
  let pedido = false;
  addEventListener('scroll', () => {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(() => { pedido = false; atualizar(); });
  }, { passive: true });
  addEventListener('resize', atualizar);
  reduce.addEventListener('change', atualizar);
  retrato.addEventListener('change', atualizar);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { vCabos.pause(); vChao.pause(); } else atualizar();
  });
  atualizar();

  /* Lanterna: no computador segue o mouse com um leve atraso; no celular passeia sozinha */
  const luzes = [...document.querySelectorAll('.lanterna, .nucleo')];
  if (luzes.length && !reduce.matches) {
    if (mouseFino.matches) {
      let alvoX = innerWidth * 0.7, alvoY = innerHeight * 0.4, x = alvoX, y = alvoY, rodando = false;
      const passo = () => {
        x += (alvoX - x) * 0.12;
        y += (alvoY - y) * 0.12;
        const tr = `translate3d(${x}px, ${y}px, 0)`;
        luzes.forEach((l) => { l.style.transform = tr; });
        if (Math.abs(alvoX - x) + Math.abs(alvoY - y) > 0.5) requestAnimationFrame(passo);
        else rodando = false;
      };
      addEventListener('pointermove', (ev) => {
        if (ev.pointerType !== 'mouse') return;
        alvoX = ev.clientX; alvoY = ev.clientY;
        root.classList.add('mouse');
        if (!rodando) { rodando = true; requestAnimationFrame(passo); }
      }, { passive: true });
      document.addEventListener('pointerleave', () => root.classList.remove('mouse'));
    } else {
      root.classList.add('toque');
    }
  }

  /* Cartões: a faísca dá uma volta na borda quando o cartão entra na tela */
  if ('IntersectionObserver' in window && !reduce.matches) {
    const io = new IntersectionObserver((itens) => itens.forEach((it) => {
      if (!it.isIntersecting) return;
      const card = it.target;
      io.unobserve(card);
      setTimeout(() => {
        card.classList.add('viva');
        setTimeout(() => card.classList.remove('viva'), 2200);
      }, [...card.parentNode.children].indexOf(card) * 250);
    }), { threshold: 0.6 });
    document.querySelectorAll('.card').forEach((c) => io.observe(c));
  }

  /* Painel de orçamento: monta a mensagem do WhatsApp */
  const dialog = document.getElementById('orcamento');
  const form = document.querySelector('[data-form]');
  const enviar = document.querySelector('[data-enviar]');
  function montarLink() {
    const f = new FormData(form);
    const nome = (f.get('nome') || '').trim();
    const negocio = (f.get('negocio') || '').trim();
    const tipo = f.get('tipo') || 'ajuda para escolher o formato';
    const msg = (f.get('msg') || '').trim();
    let t = 'Olá, Kauê! Vi o site da WunderHub.';
    if (nome) t += ` Sou ${nome}${negocio ? `, de ${negocio}` : ''}.`;
    else if (negocio) t += ` Tenho ${negocio}.`;
    t += ` Quero ${tipo}.`;
    if (msg) t += ` ${msg}`;
    enviar.href = `https://wa.me/5511959300903?text=${encodeURIComponent(t)}`;
  }
  if (dialog && typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-open-orcamento]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      montarLink();
      dialog.showModal();
    }));
    form.addEventListener('input', montarLink);
    enviar.addEventListener('click', () => setTimeout(() => dialog.close(), 300));
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  }
})();
