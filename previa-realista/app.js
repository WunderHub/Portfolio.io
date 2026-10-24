// Prévia realista da WunderHub: título que entra palavra por palavra,
// vídeo em loop no topo (só quando o movimento está liberado) e painel de orçamento.
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

  /* Vídeo do topo: a foto aparece na hora; o vídeo entra por cima quando estiver pronto */
  const video = document.querySelector('.hero video');
  const economia = navigator.connection && navigator.connection.saveData;
  function ligarVideo() {
    if (!video || reduce.matches || economia) return;
    const src = retrato.matches ? video.dataset.srcM : video.dataset.src;
    if (video.getAttribute('src') !== src) video.src = src;
    video.addEventListener('playing', () => video.classList.add('tocando'), { once: true });
    video.play().catch(() => {});
  }
  function desligarVideo() {
    if (!video) return;
    video.pause();
    video.classList.remove('tocando');
  }
  ligarVideo();
  reduce.addEventListener('change', () => (reduce.matches ? desligarVideo() : ligarVideo()));
  retrato.addEventListener('change', () => { if (!reduce.matches) { desligarVideo(); ligarVideo(); } });
  // pausa o vídeo quando o topo sai da tela, para não gastar bateria
  if (video && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (reduce.matches || economia) return;
      e.isIntersecting ? video.play().catch(() => {}) : video.pause();
    }).observe(video.closest('.hero'));
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
