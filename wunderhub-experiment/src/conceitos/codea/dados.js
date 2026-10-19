// Dados fixos da Côdea (seção 7.1): horário de funcionamento, prazo e faixas de retirada.
// Os itens do cardápio ficam no HTML (data-*), que é a fonte única: sem JS a lista e os preços aparecem iguais.

export const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

// Minutos desde a meia-noite.
export const HORARIO = {
  semana: { abre: 6 * 60 + 30, fecha: 19 * 60, abreTexto: '6h30', fechaTexto: '19h' },
  domingo: { abre: 7 * 60, fecha: 13 * 60, abreTexto: '7h', fechaTexto: '13h' },
};

// "Encomende até as 18h e retire no dia seguinte."
export const PRAZO_ENCOMENDA = 18 * 60;

// Faixas de retirada; no domingo só as duas primeiras (a padaria fecha às 13h).
export const FAIXAS = {
  '7-9': { mensagem: 'entre 7h e 9h', domingo: true },
  '9-12': { mensagem: 'entre 9h e 12h', domingo: true },
  '16-18': { mensagem: 'entre 16h e 18h', domingo: false },
};

export const MAX_POR_ITEM = 20;
