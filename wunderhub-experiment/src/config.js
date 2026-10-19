// Única fonte de contato e marca (seção 3.3 da direção).
// Usado no build pelo vite.config.js (marcadores {{...}} no HTML) e em runtime pelos módulos.
export const contato = {
  marca: 'WunderHub',
  nome: 'Kauê Ribeiro',
  whatsappNumero: '5511959300903',
  whatsappExibicao: '+55 (11) 95930-0903',
  email: 'kaueribeiro12@gmail.com',
  mensagemPadrao: 'Oi, Kauê! Vim pelo site da WunderHub e quero conversar sobre um site para o meu negócio.',
  assuntoEmail: 'Site para o meu negócio',
};

export const whatsappUrl = (texto = contato.mensagemPadrao) =>
  `https://wa.me/${contato.whatsappNumero}?text=${encodeURIComponent(texto)}`;

export const mailtoUrl = (assunto = contato.assuntoEmail, corpo = '') =>
  `mailto:${contato.email}?subject=${encodeURIComponent(assunto)}${corpo ? `&body=${encodeURIComponent(corpo)}` : ''}`;
