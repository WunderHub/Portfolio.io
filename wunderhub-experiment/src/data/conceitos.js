// Dados da vitrine (seções 3.4, 5.1, 5.2 e 8). Textos finais da direção, sem alteração.
// Capturas: src/assets/capturas/<slug>-desktop-{480,960,1440}.webp e <slug>-celular-{390,780}.webp,
// geradas por `npm run capturas` (até lá, placeholders neutros com os mesmos nomes e dimensões).
// Posições dos marcadores A/B/C: src/generated/decisoes.json (em % da captura).
import decisoes from '../generated/decisoes.json';

const arquivos = import.meta.glob('../assets/capturas/*.webp', { eager: true, query: '?url', import: 'default' });
const captura = (nome) => arquivos[`../assets/capturas/${nome}.webp`];

const capturasDe = (slug) => ({
  desktop: { 480: captura(`${slug}-desktop-480`), 960: captura(`${slug}-desktop-960`), 1440: captura(`${slug}-desktop-1440`) },
  celular: { 390: captura(`${slug}-celular-390`), 780: captura(`${slug}-celular-780`) },
  dimensoes: { desktop: [1440, 900], celular: [390, 844] },
});

export const conceitos = [
  {
    slug: 'codea',
    nome: 'Côdea',
    vao: 'WUN',
    indiceVao: 0,
    eixos: { wdth: 150, wght: 850 },
    placa: 'Côdea, padaria de bairro',
    linhaDeTipo: 'Padaria de bairro. Landing page de uma página.',
    objetivo: 'Fazer quem passa ver o que saiu do forno hoje e encomendar para retirar.',
    decisoes: [
      { letra: 'A', texto: 'Horário e aviso de aberto ou fechado no topo, porque a primeira dúvida de quem passa é se a padaria está aberta.' },
      { letra: 'B', texto: 'Cardápio do dia com filtros e preço visível, para escolher sem precisar perguntar.' },
      { letra: 'C', texto: 'A encomenda monta a mensagem pronta, então o pedido chega organizado para quem atende.' },
    ],
    formato: 'Landing page',
    url: 'conceitos/codea/', // relativo à home; funciona sob qualquer base path
    ancora: 'conceito-codea',
    painel: 'painel-codea',
    capturas: capturasDe('codea'),
  },
  {
    slug: 'junco',
    nome: 'Junco',
    vao: 'DER',
    indiceVao: 1,
    eixos: { wdth: 62, wght: 400 },
    placa: 'Junco, fisioterapia',
    linhaDeTipo: 'Clínica de fisioterapia. Site institucional com quatro páginas.',
    objetivo: 'Explicar os tratamentos com calma e levar a pessoa a pedir a primeira avaliação.',
    decisoes: [
      { letra: 'A', texto: 'A primeira pergunta do site é o que a pessoa sente, como dor nas costas ou volta ao treino. O nome técnico do tratamento aparece depois dessa escolha.' },
      { letra: 'B', texto: 'Uma página só para explicar a primeira consulta, que é onde aparecem as dúvidas.' },
      { letra: 'C', texto: 'Pedido de horário em quatro passos curtos, com resumo antes de enviar.' },
    ],
    formato: 'Site institucional',
    url: 'conceitos/junco/',
    ancora: 'conceito-junco',
    painel: 'painel-junco',
    capturas: capturasDe('junco'),
  },
  {
    slug: 'louca-torta',
    nome: 'Louça Torta',
    vao: 'HUB',
    indiceVao: 2,
    eixos: { wdth: 125, wght: 250 },
    placa: 'Louça Torta, cerâmica',
    linhaDeTipo: 'Cerâmica feita à mão. Loja virtual.',
    objetivo: 'Mostrar cada peça de perto e deixar a compra simples.',
    decisoes: [
      { letra: 'A', texto: 'Filtros por tipo de peça, cor do esmalte e pronta entrega.' },
      { letra: 'B', texto: 'Na página do produto, trocar o esmalte troca a foto, para ver a cor antes de comprar.' },
      { letra: 'C', texto: 'Sacola lateral com subtotal e prazo, sem tirar a pessoa da página.' },
    ],
    formato: 'Loja virtual',
    url: 'conceitos/louca-torta/',
    ancora: 'conceito-louca-torta',
    painel: 'painel-louca-torta',
    capturas: capturasDe('louca-torta'),
  },
];

export const porSlug = Object.fromEntries(conceitos.map((c) => [c.slug, c]));

/**
 * Posições dos elementos [data-decisao] na captura, em % (x e y do canto superior esquerdo, w e h).
 * @param {string} slug
 * @param {'desktop'|'celular'} tela
 * @returns {{A:{x:number,y:number,w:number,h:number},B:object,C:object}|undefined}
 */
export const posicoesDecisoes = (slug, tela) => decisoes.conceitos?.[slug]?.[tela];
export const decisoesProvisorias = Boolean(decisoes.provisorio);
