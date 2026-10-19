// Pedir uma avaliação (seção 7.2, decisão C): formulário em 4 passos com validação, datas calculadas,
// horários indisponíveis determinísticos (hash da data), revisão com "Editar" e confirmação declarada
// como demonstração. Nada é enviado: o pedido fica só nesta tela, em memória.
import { animate } from 'motion';
import { EASE, reduzido } from './movimento.js';
import { tratamentos, horarios, diasDaSemana } from './dados.js';

const TOTAL = 4;
const ROTULOS = { 1: 'Tipo', 2: 'Dia', 3: 'Horário', 4: 'Seus dados' };
const MENSAGENS = {
  tipo: 'Escolha o tipo de atendimento.',
  dia: 'Escolha um dia.',
  horario: 'Escolha um horário.',
  nome: 'Escreva seu nome.',
  telefone: 'Digite o telefone com DDD, só números. Exemplo: 11912345678.',
  email: 'Confira o e-mail. Exemplo: nome@email.com.',
};

// ---------- datas e horários ----------
const dois = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
const curto = (d) => `${diasDaSemana[d.getDay()]} ${dois(d.getDate())}/${dois(d.getMonth() + 1)}`;

/** FNV-1a: o mesmo dia e a mesma hora dão sempre o mesmo resultado. */
function hash(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function horasDoDia(data, agora) {
  const lista = data.getDay() === 6 ? horarios.sabado : horarios.semana;
  const hoje = iso(data) === iso(agora);
  const horas = lista.map((hora) => {
    const passou = hoje && hora <= agora.getHours() + 1; // pelo menos uma hora de antecedência
    const ocupado = hash(`${iso(data)}T${hora}`) % 10 < 3;
    return { hora, passou, disponivel: !passou && !ocupado };
  });
  // Um dia futuro nunca fica sem nenhum horário livre.
  if (!hoje && !horas.some((h) => h.disponivel)) horas[hash(iso(data)) % horas.length].disponivel = true;
  return horas;
}

/** Próximos 10 dias de segunda a sábado a partir de hoje (hoje só entra se ainda tiver horário). */
function proximosDias(agora, quantidade = 10) {
  const dias = [];
  const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  while (dias.length < quantidade) {
    if (d.getDay() !== 0) {
      const horas = horasDoDia(d, agora);
      if (horas.some((h) => h.disponivel)) dias.push({ data: new Date(d), chave: iso(d), rotulo: curto(d), horas });
    }
    d.setDate(d.getDate() + 1);
  }
  return dias;
}

const so = (texto) => texto.replace(/\D/g, '');
const emailValido = (texto) => /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(texto);

function formatarTelefone(digitos) {
  if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return digitos;
}

function criar(tag, atributos = {}, filhos = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(atributos)) {
    if (k === 'texto') el.textContent = v;
    else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
  }
  for (const filho of filhos) el.append(filho);
  return el;
}

// ---------- módulo ----------
export function init() {
  const form = document.querySelector('[data-pedido]');
  if (!form) return undefined;

  const el = {
    contador: form.querySelector('[data-contador]'),
    indicadores: [...form.querySelectorAll('[data-indicador]')],
    resumo: form.querySelector('[data-resumo-erros]'),
    resumoLista: form.querySelector('[data-resumo-lista]'),
    passos: Object.fromEntries([...form.querySelectorAll('[data-passo]')].map((p) => [p.dataset.passo, p])),
    dias: form.querySelector('[data-dias]'),
    horas: form.querySelector('[data-horas]'),
    voltar: form.querySelector('[data-voltar]'),
    continuar: form.querySelector('[data-continuar]'),
    continuarTexto: form.querySelector('[data-continuar-texto]'),
    interesse: form.querySelector('[data-interesse]'),
    interesseNome: form.querySelector('[data-interesse-nome]'),
    confirmacao: document.querySelector('[data-confirmacao]'),
    cab: document.querySelector('[data-cab]'),
  };
  const campos = {
    nome: form.elements.nome,
    telefone: form.elements.telefone,
    email: form.elements.email,
    mensagem: form.elements.mensagem,
  };

  const estado = { passo: '1', editando: false, dias: [], tratamento: null };
  let animacao;

  // Tratamento de interesse vindo da página Tratamentos (?tratamento=<slug>)
  const slug = new URLSearchParams(location.search).get('tratamento');
  if (slug && Object.hasOwn(tratamentos, slug)) {
    estado.tratamento = tratamentos[slug];
    el.interesseNome.textContent = estado.tratamento;
    el.interesse.hidden = false;
  }

  // ---------- dias e horários ----------
  function desenharDias() {
    estado.dias = proximosDias(new Date());
    el.dias.replaceChildren(
      ...estado.dias.map((dia) => {
        const [semana, data] = dia.rotulo.split(' ');
        return criar('label', { class: 'ficha' }, [
          criar('input', { type: 'radio', name: 'dia', value: dia.chave, id: `dia-${dia.chave}` }),
          criar('span', { class: 'ficha__pequeno', texto: semana }),
          ' ',
          criar('span', { class: 'ficha__grande', texto: data }),
        ]);
      }),
    );
  }

  function desenharHoras() {
    const dia = diaEscolhido();
    const anterior = form.elements.horario ? valorRadio('horario') : '';
    if (!dia) {
      el.horas.replaceChildren(criar('p', { class: 'passo__nota', texto: 'Escolha um dia no passo anterior para ver os horários.' }));
      return;
    }
    const grupos = [
      ['Manhã', dia.horas.filter((h) => h.hora < 12)],
      ['Tarde e noite', dia.horas.filter((h) => h.hora >= 12)],
    ].filter(([, horas]) => horas.length);
    el.horas.replaceChildren(
      ...grupos.map(([titulo, horas]) =>
        criar('div', { class: 'horas__grupo' }, [
          criar('p', { class: 'horas__titulo', 'aria-hidden': 'true', texto: titulo }),
          criar(
            'div',
            { class: 'horas__fichas' },
            horas.map((h) => {
              const filhos = [
                criar('input', { type: 'radio', name: 'horario', value: `${h.hora}h`, id: `hora-${h.hora}`, disabled: !h.disponivel, checked: h.disponivel && anterior === `${h.hora}h` }),
                criar('span', { class: 'ficha__grande', texto: `${h.hora}h` }),
              ];
              if (!h.disponivel) filhos.push(' ', criar('span', { class: 'ficha__pequeno', texto: 'indisponível' }));
              return criar('label', { class: 'ficha' }, filhos);
            }),
          ),
        ]),
      ),
    );
  }

  const valorRadio = (nome) => {
    const marcado = form.querySelector(`input[name="${nome}"]:checked`);
    return marcado ? marcado.value : '';
  };
  const diaEscolhido = () => estado.dias.find((d) => d.chave === valorRadio('dia'));

  // ---------- erros ----------
  const paragrafoErro = (chave) => form.querySelector(`[data-erro="${chave}"]`);

  function limparErro(chave) {
    const p = paragrafoErro(chave);
    if (p) {
      p.hidden = true;
      p.textContent = '';
    }
    const campo = campos[chave];
    if (campo) {
      campo.removeAttribute('aria-invalid');
      campo.setAttribute('aria-describedby', campo.id === 'campo-telefone' ? 'dica-telefone' : '');
      if (!campo.getAttribute('aria-describedby')) campo.removeAttribute('aria-describedby');
    } else {
      const fs = p?.closest('fieldset');
      if (fs) {
        const ids = (fs.getAttribute('aria-describedby') || '').split(' ').filter((id) => id && id !== p.id);
        if (ids.length) fs.setAttribute('aria-describedby', ids.join(' '));
        else fs.removeAttribute('aria-describedby');
      }
    }
  }

  function mostrarErro({ chave, mensagem }) {
    const p = paragrafoErro(chave);
    if (!p) return;
    p.textContent = mensagem;
    p.hidden = false;
    const campo = campos[chave];
    if (campo) {
      campo.setAttribute('aria-invalid', 'true');
      campo.setAttribute('aria-describedby', [p.id, campo.id === 'campo-telefone' ? 'dica-telefone' : ''].filter(Boolean).join(' '));
    } else {
      const fs = p.closest('fieldset');
      const ids = new Set((fs.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
      ids.add(p.id);
      fs.setAttribute('aria-describedby', [...ids].join(' '));
    }
  }

  function alvoDoErro(chave) {
    if (campos[chave]) return campos[chave];
    const nome = chave === 'dia' ? 'dia' : chave === 'horario' ? 'horario' : 'tipo';
    return form.querySelector(`input[name="${nome}"]:not(:disabled)`);
  }

  function validar(passo, chaves) {
    const erros = [];
    const checar = (chave, ok) => {
      if (chaves && !chaves.includes(chave)) return;
      if (!ok) erros.push({ chave, mensagem: MENSAGENS[chave] });
    };
    if (passo === '1') checar('tipo', Boolean(valorRadio('tipo')));
    if (passo === '2') checar('dia', Boolean(diaEscolhido()));
    if (passo === '3') checar('horario', Boolean(valorRadio('horario')));
    if (passo === '4') {
      checar('nome', campos.nome.value.trim().length > 0);
      const tel = campos.telefone.value.trim();
      checar('telefone', /^[\d\s().+-]*$/.test(tel) && [10, 11].includes(so(tel).length));
      const email = campos.email.value.trim();
      checar('email', email === '' || emailValido(email));
    }
    return erros;
  }

  function limparErrosDoPasso(passo) {
    const chaves = { 1: ['tipo'], 2: ['dia'], 3: ['horario'], 4: ['nome', 'telefone', 'email'] }[passo] || [];
    chaves.forEach(limparErro);
    el.resumo.hidden = true;
    el.resumoLista.replaceChildren();
  }

  function mostrarErros(passo, erros) {
    limparErrosDoPasso(passo);
    erros.forEach(mostrarErro);
    el.resumoLista.replaceChildren(
      ...erros.map((erro) => {
        const alvo = alvoDoErro(erro.chave);
        const link = criar('a', { href: `#${alvo?.id || ''}`, texto: erro.mensagem });
        link.addEventListener('click', (e) => {
          e.preventDefault();
          alvo?.focus();
        });
        return criar('li', {}, [link]);
      }),
    );
    el.resumo.hidden = false;
    el.resumo.focus({ preventScroll: true });
    rolarParaOTopo();
  }

  // ---------- navegação entre passos ----------
  function rolarParaOTopo() {
    const topoCab = el.cab ? el.cab.getBoundingClientRect().bottom : 0;
    const topo = form.getBoundingClientRect().top;
    if (topo < topoCab + 8 || topo > innerHeight * 0.6) {
      const y = scrollY + topo - topoCab - 16;
      scrollTo({ top: Math.max(0, y), behavior: reduzido() ? 'auto' : 'smooth' });
    }
  }

  function mostrar(passo, { foco = true, animar = true } = {}) {
    estado.passo = passo;
    const numero = passo === 'revisao' ? TOTAL + 1 : Number(passo);
    for (const [chave, painel] of Object.entries(el.passos)) painel.hidden = chave !== passo;
    el.resumo.hidden = true;

    el.contador.textContent = passo === 'revisao' ? 'Revisão' : `Passo ${passo} de ${TOTAL}`;
    for (const li of el.indicadores) {
      const n = Number(li.dataset.indicador);
      if (n === numero) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
      li.toggleAttribute('data-feito', n < numero);
      let sr = li.querySelector('.sr-only');
      if (n < numero) {
        if (!sr) li.append((sr = criar('span', { class: 'sr-only' })));
        sr.textContent = ', concluído';
      } else sr?.remove();
    }

    const painel = el.passos[passo];
    const prefixo = painel.querySelector('[data-legenda-prefixo]');
    if (prefixo) prefixo.textContent = `Passo ${passo} de ${TOTAL}: `;

    el.voltar.hidden = passo === '1' || estado.editando;
    el.continuarTexto.textContent = passo === 'revisao' ? 'Enviar pedido' : estado.editando ? 'Voltar à revisão' : 'Continuar';
    el.continuar.classList.toggle('pedido__enviar', passo === 'revisao');

    if (passo === 'revisao') preencherRevisao();
    if (animar) {
      animacao?.stop();
      animacao = animate(painel, { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0px)'] }, { duration: 0.32, ease: EASE });
    }
    if (foco) {
      rolarParaOTopo();
      const alvo = passo === 'revisao' ? painel.querySelector('h2') : painel.querySelector('legend');
      alvo?.focus({ preventScroll: true });
    }
  }

  function preencherRevisao() {
    const dia = diaEscolhido();
    const valores = {
      tipo: valorRadio('tipo'),
      tratamento: estado.tratamento ? `Tratamento de interesse: ${estado.tratamento}` : '',
      dia: dia ? dia.rotulo : '',
      horario: valorRadio('horario'),
      nome: campos.nome.value.trim(),
      telefone: formatarTelefone(so(campos.telefone.value)),
      email: campos.email.value.trim() || 'E-mail não informado',
      mensagem: campos.mensagem.value.trim(),
    };
    for (const [chave, valor] of Object.entries(valores)) {
      const alvo = form.querySelector(`[data-rev="${chave}"]`);
      if (!alvo) continue;
      alvo.textContent = valor;
      alvo.hidden = !valor;
    }
  }

  function enviar() {
    const dia = diaEscolhido();
    const resumo = criar('p', { class: 'confirmacao__resumo' }, [
      criar('strong', { texto: valorRadio('tipo') }),
      criar('span', { texto: `${dia ? dia.rotulo : ''}, às ${valorRadio('horario')}` }),
    ]);
    const selo = criar('span', { class: 'confirmacao__selo', 'aria-hidden': 'true' });
    selo.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const novo = criar('button', { type: 'button', class: 'botao botao--secundario botao--grande', texto: 'Fazer outro pedido' });
    novo.addEventListener('click', recomecar);

    form.hidden = true;
    el.confirmacao.setAttribute('tabindex', '-1');
    el.confirmacao.replaceChildren(
      selo,
      criar('p', { class: 'confirmacao__texto', texto: 'Pedido de demonstração concluído só nesta tela. Nenhum dado foi enviado. Num site real, a clínica receberia este pedido e confirmaria o horário por mensagem.' }),
      resumo,
      novo,
    );
    animate(el.confirmacao, { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0px)'] }, { duration: 0.36, ease: EASE });
    estado.passo = 'feito';
    el.confirmacao.focus({ preventScroll: true });
    const topoCab = el.cab ? el.cab.getBoundingClientRect().bottom : 0;
    const topo = el.confirmacao.getBoundingClientRect().top;
    if (topo < topoCab || topo > innerHeight * 0.7) scrollTo({ top: scrollY + topo - topoCab - 24, behavior: reduzido() ? 'auto' : 'smooth' });
  }

  function recomecar() {
    form.reset();
    for (const chave of Object.keys(MENSAGENS)) limparErro(chave);
    estado.editando = false;
    desenharDias();
    desenharHoras();
    el.confirmacao.replaceChildren();
    el.confirmacao.removeAttribute('tabindex');
    form.hidden = false;
    mostrar('1');
  }

  // ---------- eventos ----------
  const aoEnviar = (e) => {
    e.preventDefault();
    if (estado.passo === 'revisao') return enviar();
    const erros = validar(estado.passo);
    if (erros.length) return mostrarErros(estado.passo, erros);
    limparErrosDoPasso(estado.passo);
    if (estado.editando) {
      // trocou o dia e o horário escolhido não existe nele: passa pelo passo do horário antes da revisão
      if (estado.passo === '2' && !valorRadio('horario')) return mostrar('3');
      estado.editando = false;
      return mostrar('revisao');
    }
    if (estado.passo === '2') desenharHoras();
    return mostrar(estado.passo === String(TOTAL) ? 'revisao' : String(Number(estado.passo) + 1));
  };

  const aoVoltar = () => {
    limparErrosDoPasso(estado.passo);
    mostrar(estado.passo === 'revisao' ? String(TOTAL) : String(Number(estado.passo) - 1));
  };

  const aoEditar = (e) => {
    const botao = e.target.closest('[data-editar]');
    if (!botao) return;
    estado.editando = true;
    const passo = botao.dataset.editar;
    if (passo === '3') desenharHoras();
    mostrar(passo);
  };

  const aoMudar = (e) => {
    const alvo = e.target;
    if (alvo.name === 'dia') {
      limparErro('dia');
      // o horário escolhido continua só se estiver livre no novo dia
      desenharHoras();
    }
    if (alvo.name === 'horario') limparErro('horario');
  };

  // Corrigiu o campo com erro: o erro some na hora (não aparecem erros novos enquanto a pessoa digita).
  const aoDigitar = (e) => {
    const chave = Object.keys(campos).find((k) => campos[k] === e.target);
    if (!chave || e.target.getAttribute('aria-invalid') !== 'true') return;
    if (!validar('4', [chave]).length) limparErro(chave);
  };

  form.addEventListener('submit', aoEnviar);
  form.addEventListener('change', aoMudar);
  form.addEventListener('input', aoDigitar);
  el.voltar.addEventListener('click', aoVoltar);
  el.passos.revisao.addEventListener('click', aoEditar);

  desenharDias();
  desenharHoras();
  mostrar('1', { foco: false, animar: false });

  return () => {
    animacao?.stop();
    form.removeEventListener('submit', aoEnviar);
    form.removeEventListener('change', aoMudar);
    form.removeEventListener('input', aoDigitar);
    el.voltar.removeEventListener('click', aoVoltar);
    el.passos.revisao.removeEventListener('click', aoEditar);
  };
}
