// Prévia realista da WunderHub: título que entra palavra por palavra,
// vídeo dos cabos atrás da página inteira, chão de colmeia no fim e painel de orçamento.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const retrato = matchMedia('(orientation: portrait)');

  /* Título: cada palavra sobe ao carregar */
  document.querySelectorAll('[data-words]').forEach((el) => {
    const out = document.createDocumentFragment();
    let i = 0;
    el.childNodes.forEach((n) => {
      const isEm = n.nodeName === 'EM';
      n.textContent.trim().split(/\s+/).filter(Boolean).forEach((t) => {
        const w = document.createElement('span');
        w.className = 'w';
        const inner = document.createElement('span');
        inner.style.transitionDelay = `${0.15 + i++ * 0.07}s`;
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
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));

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

  let chao = 0;
  function atualizar() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const y = scrollY;
    const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    // o chão começa a subir quando falta 1,3 tela para o fim
    const faixa = innerHeight * 1.3;
    chao = Math.min(1, Math.max(0, (y - (max - faixa)) / faixa));
    const e = 1 - Math.pow(1 - chao, 2);
    cena.style.setProperty('--p', p.toFixed(4));
    cena.style.setProperty('--chao', e.toFixed(4));
    tocar(vChao, chao > 0);
    tocar(vCabos, chao < 1);
  }
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
