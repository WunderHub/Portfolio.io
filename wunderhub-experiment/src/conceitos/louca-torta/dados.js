// Dados da Louça Torta (seção 7.3). Única fonte para a loja, a página de produto e a sacola.
// Frente dona: louca-torta. Textos da especificação; medidas e "sobre o esmalte" (exceto o celadon,
// que vem da especificação) foram escritos para esta demo e estão registrados no relatório da frente.

/** Esmaltes: slug de URL → nome visível, nome na frase ("Caneca Torta, celadon, adicionada…"), cor do swatch. */
export const ESMALTES = {
  cobalto: {
    nome: 'Cobalto',
    frase: 'cobalto',
    cor: '#1F3E9C',
    sobre: 'Esmalte azul intenso e brilhante. Nas bordas, onde a camada fica mais fina, aparece o tom da argila.',
  },
  celadon: {
    nome: 'Celadon',
    frase: 'celadon',
    cor: '#9DBFAE',
    sobre: 'Esmalte verde-claro e translúcido. Onde ele acumula, a cor fica mais intensa.',
  },
  'branco-giz': {
    nome: 'Branco giz',
    frase: 'branco giz',
    cor: '#FFFFFF',
    sobre: 'Esmalte branco e fosco, com pintas escuras que vêm do ferro da argila. Cada peça tem as suas.',
  },
  'preto-fosco': {
    nome: 'Preto fosco',
    frase: 'preto fosco',
    cor: '#222326',
    sobre: 'Esmalte preto e fosco, macio ao toque. Deixa à mostra as marcas do torno.',
  },
};

/** Tipos de peça: slug (filtro e ?tipo= da loja) → nome visível. */
export const TIPOS = {
  canecas: 'Canecas e xícaras',
  tigelas: 'Tigelas',
  pratos: 'Pratos',
  vasos: 'Vasos',
  travessas: 'Travessas e potes',
};

export const DISPONIBILIDADE = {
  pronta: 'Pronta entrega. Enviamos em até 2 dias úteis.',
  encomenda: 'Sob encomenda. Fica pronta em até 20 dias.',
};

export const CUIDADOS = [
  'Pode ir à lava-louças e ao micro-ondas.',
  'Evite choque térmico: não leve do congelador direto ao forno.',
  'Pequenas variações de cor e de forma fazem parte de cada peça.',
];

/**
 * Peças, na ordem de "Novidades". Preço em centavos. Cada variante aponta para a foto (img/<foto>-<largura>.webp).
 * @type {Array<{id:string,genero:'f'|'m',nome:string,preco:number,tipo:keyof typeof TIPOS,descricao:string,medidas:string,
 *   variantes:Array<{esmalte:keyof typeof ESMALTES,pronta:boolean,foto:string,alt:string}>,combina:string[]}>}
 */
export const PRODUTOS = [
  {
    id: 'caneca-torta',
    genero: 'f',
    nome: 'Caneca Torta',
    preco: 8900,
    tipo: 'canecas',
    descricao: '350 ml. A borda ondulada é feita à mão, uma por uma.',
    medidas: 'Altura de 9 cm, boca de 8,5 cm, 350 ml.',
    variantes: [
      { esmalte: 'cobalto', pronta: true, foto: 'lt-caneca-cobalto', alt: 'Caneca Torta em esmalte cobalto brilhante, com a borda ondulada e a alça grossa.' },
      { esmalte: 'celadon', pronta: false, foto: 'lt-caneca-celadon', alt: 'Caneca Torta em esmalte celadon, verde-claro e translúcido, mais escuro nas marcas do torno.' },
      { esmalte: 'branco-giz', pronta: true, foto: 'lt-caneca-giz', alt: 'Caneca Torta em esmalte branco giz fosco, com pintas escuras.' },
    ],
    combina: ['prato-sobremesa', 'tigela-funda', 'pote-tampa'],
  },
  {
    id: 'tigela-funda',
    genero: 'f',
    nome: 'Tigela Funda',
    preco: 12000,
    tipo: 'tigelas',
    descricao: '16 cm de diâmetro, para caldos e saladas.',
    medidas: '16 cm de diâmetro e 7 cm de altura, 650 ml.',
    variantes: [
      { esmalte: 'celadon', pronta: true, foto: 'lt-tigela-celadon', alt: 'Tigela Funda em esmalte celadon, com a borda irregular.' },
      { esmalte: 'preto-fosco', pronta: false, foto: 'lt-tigela-preto', alt: 'Tigela Funda em esmalte preto fosco, com as marcas do torno aparentes.' },
    ],
    combina: ['prato-raso', 'travessa-oval', 'caneca-torta'],
  },
  {
    id: 'prato-raso',
    genero: 'm',
    nome: 'Prato Raso 26 cm',
    preco: 9800,
    tipo: 'pratos',
    descricao: 'Borda irregular e fundo liso, para o dia a dia.',
    medidas: '26 cm de diâmetro e 2,5 cm de altura.',
    variantes: [
      { esmalte: 'cobalto', pronta: true, foto: 'lt-prato-raso-cobalto', alt: 'Prato Raso de 26 cm em esmalte cobalto, com a borda irregular.' },
    ],
    combina: ['tigela-funda', 'prato-sobremesa', 'travessa-oval'],
  },
  {
    id: 'prato-sobremesa',
    genero: 'm',
    nome: 'Prato de Sobremesa 19 cm',
    preco: 7200,
    tipo: 'pratos',
    descricao: 'Do tamanho certo para bolo e fruta.',
    medidas: '19 cm de diâmetro e 2 cm de altura.',
    variantes: [
      { esmalte: 'branco-giz', pronta: true, foto: 'lt-prato-sobremesa-giz', alt: 'Prato de Sobremesa de 19 cm em esmalte branco giz com pintas.' },
    ],
    combina: ['caneca-torta', 'xicara-pires', 'prato-raso'],
  },
  {
    id: 'vaso-alto',
    genero: 'm',
    nome: 'Vaso Alto',
    preco: 16000,
    tipo: 'vasos',
    descricao: '28 cm de altura, com as marcas do torno aparentes.',
    medidas: '28 cm de altura e 9 cm de diâmetro na boca.',
    variantes: [
      { esmalte: 'branco-giz', pronta: false, foto: 'lt-vaso-giz', alt: 'Vaso Alto cilíndrico em esmalte branco giz, com os anéis do torno aparentes.' },
    ],
    combina: ['pote-tampa', 'travessa-oval', 'caneca-torta'],
  },
  {
    id: 'travessa-oval',
    genero: 'f',
    nome: 'Travessa Oval',
    preco: 18000,
    tipo: 'travessas',
    descricao: '32 cm. Vai ao forno.',
    medidas: '32 cm de comprimento, 22 cm de largura e 5 cm de altura.',
    variantes: [
      { esmalte: 'celadon', pronta: true, foto: 'lt-travessa-celadon', alt: 'Travessa Oval de 32 cm em esmalte celadon.' },
    ],
    combina: ['prato-raso', 'tigela-funda', 'vaso-alto'],
  },
  {
    id: 'xicara-pires',
    genero: 'f',
    nome: 'Xícara com Pires',
    preco: 9500,
    tipo: 'canecas',
    descricao: '150 ml, para café coado.',
    medidas: 'Xícara de 6 cm de altura e 150 ml. Pires de 13 cm de diâmetro.',
    variantes: [
      { esmalte: 'preto-fosco', pronta: true, foto: 'lt-xicara-preto', alt: 'Xícara com Pires em esmalte preto fosco.' },
    ],
    combina: ['prato-sobremesa', 'caneca-torta', 'pote-tampa'],
  },
  {
    id: 'pote-tampa',
    genero: 'm',
    nome: 'Pote com Tampa',
    preco: 11000,
    tipo: 'travessas',
    descricao: 'Para açúcar, sal ou o que você quiser guardar.',
    medidas: 'Altura de 13 cm com a tampa, boca de 9 cm, 500 ml.',
    variantes: [
      { esmalte: 'cobalto', pronta: false, foto: 'lt-pote-cobalto', alt: 'Pote com Tampa em esmalte cobalto, redondo, com a tampa de pegador pequeno.' },
    ],
    combina: ['xicara-pires', 'caneca-torta', 'vaso-alto'],
  },
];

export const porId = Object.fromEntries(PRODUTOS.map((p) => [p.id, p]));

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
/** 8900 → "R$ 89,00" (espaço não separável entre o símbolo e o valor). */
export const preco = (centavos) => moeda.format(centavos / 100);

/** "8 peças", "1 peça". */
export const contarPecas = (n) => `${n} ${n === 1 ? 'peça' : 'peças'}`;

/** Lista em português: ["a","b","c"] → "a, b e c". */
export function listar(itens) {
  if (itens.length < 2) return itens.join('');
  return `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`;
}

/** Variante pelo slug do esmalte (ou a primeira, quando o slug não existe na peça). */
export function varianteDe(produto, esmalte) {
  return produto.variantes.find((v) => v.esmalte === esmalte) ?? produto.variantes[0];
}

/** URL relativa da página de produto a partir de uma página na mesma pasta de produto/ ou na loja. */
export const urlProduto = (base, id, esmalte) => `${base}?p=${encodeURIComponent(id)}&esmalte=${encodeURIComponent(esmalte)}`;

/** Concordância: "adicionada" (f) ou "adicionado" (m). */
export const flexao = (produto, feminino, masculino) => (produto.genero === 'f' ? feminino : masculino);
