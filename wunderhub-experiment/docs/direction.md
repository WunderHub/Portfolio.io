# Direção: Letra-Caixa, a fachada que vira vitrine

Especificação implementável do novo portfólio da WunderHub (Kauê Ribeiro). Outros agentes implementam exatamente a partir deste documento. Quando algo aqui conflitar com a hipótese original (`docs/hypotheses.md`), vale este documento.

Fontes desta especificação: briefing do dono, `docs/research/resource-audit.md`, skills `frontend-design` e `motion` (lidas), os três julgamentos do júri e medições feitas para este documento (Chromium 141 headless, Playwright 1.56.1, fontes do npm `@fontsource-variable/*@5.3.0`). Um protótipo estático do letreiro foi renderizado para validar a prata e a leitura do nome (ver seção 13).

---

## 0. O que mudou em relação à hipótese vencedora

| Fraqueza apontada pelo júri | Correção nesta especificação |
| --- | --- |
| Em p=0 o nome lia como três sílabas soltas e como "wordmark gigante no hero" | Nome contínuo, sem intervalo extra entre os vãos; letreiro ocupa cerca de 32% da altura (não 40%); os vãos só se separam com a rolagem |
| Uma fenda colorida atravessando o nome lê como "nome riscado" (visto no protótipo) | Em repouso a fenda é preta (o painel de ACM fica fechado atrás); só a aresta polida marca o corte. As capturas aparecem só quando as janelas abrem |
| Risco de "chrome text" de banda de metal ou jogo | Receita de aço escovado validada por screenshot, com regras anti-chrome (seção 2.2) e critério de aceite |
| Pista de 160vh adiava a prova de capacidade | Pista de 120svh no desktop e 90svh no mobile; a primeira linha de Trabalhos abre por padrão com capturas grandes |
| Processo dependia de arrastar um slider | As 5 etapas ficam sempre visíveis numa lista com "o que eu faço / o que você recebe / o que preciso de você"; o trilho só destaca e transforma a palavra |
| Interpolar a Anybody por larguras médias soa retrô | Estados parados só nos extremos de largura (50–62 ou 125–150); larguras médias só aparecem durante o arraste |
| Ajustar o corpo da palavra do processo à coluna explodia a altura (medido: a palavra vai de 0,90em a 10,84em de largura) | Corpo fixo; o que muda é a largura da palavra |
| Três conceitos de produto, nenhum serviço profissional | Côdea (padaria), Junco Fisioterapia (serviço profissional), Louça Torta (loja) |
| Animar eixos de fonte em glifos grandes custa caro; dois relógios (ScrollTimeline e main thread) se descolam | Um único relógio: `scroll(callback)` alimenta um único escritor em `frame.render`; peso quantizado; `contain: layout paint style` |
| LCP dependia de `fonts.load` e do JS | O letreiro pinta só com CSS (`font-display: block` numa face dedicada, com preload); um script inline troca para o fallback em 900ms; o JS não esconde nada |
| Placas focáveis dentro de elemento `aria-hidden` | Placas numa `<nav>` irmã, fora do letreiro, com `inert` controlado |
| `range` com step 0,01 e setas reescritas | `step="1"` nativo para teclado e leitor de tela; o arraste contínuo é calculado à parte |
| Fallbacks `local()` inexistentes no Android e no Linux | Duas faces de fallback com lista ampla de `local()` e métricas medidas por script |
| Justificação dos andares no mobile medida em JS | `wdth` e larguras de célula pré-medidos no build e entregues como CSS |
| Clip-path animado em área grande | Todos os clip-paths de área grande são estáticos; revelações por persianas que se movem com `transform` |
| Na Porta, mover as folhas pela perpendicular desalinha o letreiro em deslocamentos grandes | Folhas da Porta se movem na vertical pura (exceção documentada em 2.6) e o configurador fica fora da porta |

---

## 1. Conceito e princípios

**Conceito.** O site é a fachada da WunderHub, montada como o letreiro em letra-caixa do comércio de bairro: letras de aço inox escovado presas num painel de ACM preto, sobre a parede grafite, com placas de acrílico vermelho. A paleta pedida pelo dono ganha origem material: a prata é o aço das letras, o vermelho é o acrílico das placas, o preto é o painel, o grafite é a parede. O wordmark WUNDERHUB, na Anybody variável, é a estrutura da primeira tela. Três cortes a 16° (um por vão: WUN, DER, HUB) atravessam as letras. Ao rolar, os cortes se abrem como janelas, as letras perdem massa até virar caixilhos e, atrás delas, acendem as capturas reais dos três conceitos: a fachada vira vitrine. O roteiro termina com o mesmo letreiro abrindo como porta para o contato. A direção pertence a este estúdio porque descreve o trabalho de Kauê: montar a fachada digital que leva quem passa na calçada até a porta, que é a conversa.

**Princípios.**

1. **Um ângulo só: 16°.** Cortes, chanfros, placas e trajetórias derivam dele. Nada gira, nada quica, não há 3D, blur nem sombra.
2. **Prata é material, vermelho é placa.** A prata aparece como aço escovado (letreiro, chapa do processo, arestas). O vermelho só aparece como placa de ação ou de estado e ocupa no máximo cerca de 5% da área de qualquer tela; nunca é fundo de seção nem palavra destacada em título.
3. **A fachada mostra o trabalho real.** O que aparece pelas janelas são capturas das demos implementadas. Imagens nunca preenchem letras; aparecem atrás e entre elas.
4. **Um acontecimento, um scrub, dois gestos, uma porta.** Intensidade reservada: o corte na carga, o palco na rolagem, o painel de decisões, o trilho do processo e a porta do contato. O resto é estático: nenhuma seção entra com fade, hover só muda cor ou sublinhado.
5. **O texto comercial chega antes do espetáculo.** H1, lead e botão de WhatsApp são HTML real, visíveis no primeiro paint, nunca animados. O letreiro é decorativo (`aria-hidden`) e a página inteira funciona sem JavaScript.

---

## 2. Tokens

### 2.1 Cores

Todas como variáveis em `:root` (`src/styles/tokens.css`). Os contrastes abaixo foram calculados pela fórmula WCAG 2.x para este documento.

| Token | Hex | Papel |
| --- | --- | --- |
| `--preto-acm` | `#000000` | Fundo principal. Preto verdadeiro, nunca `#0B0B0B` ou `#111` |
| `--grafite-parede` | `#25282C` | Superfícies: Serviços, Quem cuida, menu, painéis de vitrine, configurador |
| `--grafite-fio` | `#3B3F45` | Divisões decorativas apenas (1,98:1 sobre preto). Nunca contorno essencial |
| `--prata-sombra` | `#7D838B` | Texto auxiliar **só sobre preto**; retorno escuro do corte |
| `--prata` | `#B9BEC5` | Texto corrido sobre preto e sobre grafite |
| `--prata-luz` | `#EEF0F2` | Títulos, aresta polida, contorno de foco |
| `--chapa` | `#C3C8CE` | Base da Chapa do processo (texto preto) |
| `--vermelho-acrilico` | `#C8102E` | Placas (CTA, etiquetas, "No ar") com texto branco; marca ativa sobre a Chapa |
| `--vermelho-sinal` | `#E5243B` | Anel externo de foco sobre preto; sinal de estado sobre preto |
| `--branco` | `#FFFFFF` | Texto sobre placa vermelha |

**Pares verificados (texto precisa de 4,5:1; texto grande ≥24px ou ≥18,66px bold e componentes de UI precisam de 3:1).**

| Primeiro plano | Fundo | Contraste | Uso permitido |
| --- | --- | --- | --- |
| Prata Luz | Preto | 18,38 | Qualquer texto |
| Prata | Preto | 11,23 | Qualquer texto |
| Prata Sombra | Preto | 5,49 | Texto auxiliar, legendas |
| Prata Luz | Grafite Parede | 12,96 | Qualquer texto |
| Prata | Grafite Parede | 7,92 | Qualquer texto |
| Prata Sombra | Grafite Parede | 3,87 | **Proibido para texto.** Sobre grafite, texto auxiliar usa Prata |
| Prata Luz | Grafite Fio | 9,27 | Texto em chips sobre Grafite Fio |
| Branco | Vermelho Acrílico | 5,88 | Texto de placa |
| Vermelho Sinal | Preto | 4,65 | Anel de foco, marcador de estado; texto só se necessário |
| Vermelho Sinal | Grafite Parede | 3,28 | Só não-texto (anel de foco, marcadores) |
| Vermelho Acrílico | Preto | 3,57 | Só não-texto (borda de placa, marcador) |
| Preto | Chapa | 12,47 | Qualquer texto |
| Grafite Parede | Chapa | 8,79 | Texto de etapas inativas |
| Vermelho Acrílico | Chapa | 3,49 | Só não-texto (marca de etapa ativa, guias) |
| Preto | Prata Luz | 18,38 | Texto escuro sobre superfície clara |

### 2.2 Prata como material

A prata nunca é um cinza chapado. Três receitas, todas CSS com uma textura WebP gerada por script (sem IA, determinística).

**Aço escovado do letreiro** (`--prata-escovada`, decorativo, `aria-hidden`, sem requisito de contraste). Validado no protótipo: lê como aço escovado, não como chrome.

```css
--prata-escovada: linear-gradient(104deg,
  #7A8088 0%, #C9CDD2 14%, #E9ECEF 24%, #AEB3BA 38%,
  #CDD1D6 55%, #959BA3 72%, #D5D9DD 88%, #A3A9B0 100%);
--especular: linear-gradient(104deg,
  transparent calc(var(--brilho) * 100% - 9%),
  rgb(255 255 255 / .55) calc(var(--brilho) * 100%),
  transparent calc(var(--brilho) * 100% + 9%));

.letras {
  color: transparent;
  background: var(--especular), url(../assets/textura/grao-2400.webp), var(--prata-escovada);
  background-size: 100% 100%, 2400px 128px, 100% 100%;
  background-blend-mode: normal, soft-light, normal;
  -webkit-background-clip: text; background-clip: text;
}
```

`--brilho` é uma propriedade registrada (`@property --brilho { syntax: '<number>'; inherits: false; initial-value: .3 }`) escrita só no elemento `.fachada` pelo renderizador do palco. Nunca no `:root`.

**Regras anti-chrome** (critério de aceite por screenshot em p=0 e p=0,62): nenhuma parada mais escura que `#7A8088`; nenhuma "linha do horizonte" (transição clara/escura brusca na metade da altura); tudo neutro, sem matiz azul ou marrom; o grão é horizontal (escovado), nunca ruído pontilhado; a faixa especular tem no máximo 18% da largura e alfa 0,55.

**Chapa do processo** (fundo com texto preto em cima, por isso todas as paradas ficam em `#C3C8CE` ou mais claras: preto ≥12,47:1 e Vermelho Acrílico ≥3,49:1 em qualquer ponto):

```css
--chapa-escovada: linear-gradient(104deg,
  #C3C8CE 0%, #D9DDE1 18%, #EEF0F2 27%, #C9CED4 44%,
  #D6DADE 62%, #C3C8CE 80%, #E1E4E7 100%);
.chapa {
  background: url(../assets/textura/grao-chapa-2400.webp), var(--chapa-escovada);
  background-size: 2400px 128px, 100% 100%;
  background-blend-mode: soft-light, normal;
}
```

Aceite: amostrar por Playwright a luminância da Chapa renderizada em 360, 768 e 1440; o pixel mais escuro sob texto precisa manter preto ≥ 10:1.

**Aresta polida e retorno.** Aresta: faixa de 2px em Prata Luz sobre o lábio de cima do corte, recortada às letras (`background-clip: text` com clip-path de 4 pontos ao longo do corte). Retorno: faixa de 2px em Prata Sombra no lábio de baixo. Na Chapa, a aresta usa `#FFFFFF`.

**Texturas (comandos verificados, ffmpeg 6.1.1):**

```sh
# scripts/grao.sh — grão do letreiro: 2400×256, luma 69–146, 11,4 KB
ffmpeg -v error -y -f lavfi -i "color=c=0x808080:s=2560x256,format=gray,noise=alls=100:allf=u:all_seed=17,avgblur=sizeX=80:sizeY=1,eq=contrast=5,crop=2400:256:80:0" -frames:v 1 -c:v libwebp -quality 40 src/assets/textura/grao-2400.webp
# grão da Chapa (baixo contraste): luma 103–132, 3,9 KB
ffmpeg -v error -y -f lavfi -i "color=c=0x808080:s=2560x256,format=gray,noise=alls=100:allf=u:all_seed=17,avgblur=sizeX=80:sizeY=1,eq=contrast=2,crop=2400:256:80:0" -frames:v 1 -c:v libwebp -quality 40 src/assets/textura/grao-chapa-2400.webp
```

O `crop` de 80px nas bordas remove o artefato de borda do blur (visto no primeiro teste). **Abaixo de 768px, com `prefers-reduced-data: reduce` ou `navigator.connection.saveData`**, as texturas não carregam: o escovado vira CSS puro (`repeating-linear-gradient(0deg, rgb(255 255 255 / .05) 0 1px, transparent 1px 2px)` por cima do gradiente).

### 2.3 Tipografia

Duas famílias, autohospedadas, licença SIL OFL 1.1. Pacotes conferidos no npm (versão 5.3.0, licença OFL-1.1).

| Família | Pacote npm | Arquivo copiado | Tamanho | Eixos | Papel |
| --- | --- | --- | --- | --- | --- |
| Anybody (Etcetera Type Co.) | `@fontsource-variable/anybody@5.3.0` | `files/anybody-latin-wdth-normal.woff2` | 56.888 B | wght 100–900, wdth 50–150 | Estrutura: letreiro, wordmark, H1, H2, nomes dos conceitos, formatos de serviço, palavra do processo, menu |
| Archivo (Omnibus-Type) | `@fontsource-variable/archivo@5.3.0` | `files/archivo-latin-wght-normal.woff2` | 34.928 B | wght 100–900 (largura fixa 100) | Leitura e interface: corpo, lead, botões, legendas, formulários |

Total de fontes: 91.816 B. O subset latin cobre o PT-BR (U+0000–00FF inclui ã, õ, ç, é, ê, ó, ô, á, í, ú, à). Copie o `unicode-range` latin exatamente como aparece no CSS do próprio pacote.

**Usos fixos da Anybody (só nos extremos de largura):**

| Uso | wdth | wght | Corpo |
| --- | --- | --- | --- |
| Letreiro desktop (hero, palco, porta) | 50 | 900 → 140 no palco | `calc(var(--largura-letreiro) / 3.5756)` (385px em 1440) |
| Letreiro mobile (torre de 3 andares) | WUN 110,5; DER 144,5; HUB 134 | 900 → 220 no palco | `33.333cqi` (119px em 390) |
| Wordmark do header | 150 | 800 | 18px |
| H1 | 62 | 800 | `--t-h1` |
| H2 | 62 | 800 | `--t-h2` |
| Nome Côdea | 150 | 850 | `--t-nome` |
| Nome Junco | 62 | 400 | `--t-nome` |
| Nome Louça Torta | 125 | 250 | `--t-nome` |
| Formato Landing page | 150 | 800 | 120px desktop |
| Formato Site institucional (2 andares) | 125 | 700 | 120px desktop |
| Formato Loja virtual | 50 | 800 | 120px desktop |
| Palavra do processo (5 estados) | 50 / 50 / 62 / 62 / 150 | 100 / 300 / 560 / 850 / 900 | fixo, ver M3 |
| Menu mobile | 150 | 800 | 32px |

O `wdth` da torre mobile justifica os três andares na mesma largura (3,0em) com o mesmo corpo; foi medido para este documento e é regenerado pelo script de métricas.

**Archivo:** pesos 400 (corpo), 500 (botões e links de navegação), 650 (rótulos de campo e destaques curtos). Nada de caixa alta em rótulos, nada de monoespaçada.

**Faces e fallbacks** (`src/styles/fontes.css`):

```css
@font-face { font-family: "Anybody"; src: url(../assets/fonts/anybody-latin-wdth-normal.woff2) format("woff2");
  font-weight: 100 900; font-stretch: 50% 150%; font-display: swap; unicode-range: /* latin do pacote */; }
/* mesma URL, carregada uma vez; block evita o letreiro piscar em fallback */
@font-face { font-family: "Anybody Letreiro"; src: url(../assets/fonts/anybody-latin-wdth-normal.woff2) format("woff2");
  font-weight: 100 900; font-stretch: 50% 150%; font-display: block; unicode-range: /* latin */; }
@font-face { font-family: "Archivo"; src: url(../assets/fonts/archivo-latin-wght-normal.woff2) format("woff2");
  font-weight: 100 900; font-display: swap; unicode-range: /* latin */; }

@font-face { font-family: "Anybody Fallback Estreita"; font-weight: 800;
  src: local("Arial Narrow Bold"), local("ArialNarrow-Bold"), local("Liberation Sans Narrow Bold"),
       local("LiberationSansNarrow-Bold"), local("Roboto Condensed Bold"), local("RobotoCondensed-Bold"),
       local("DejaVu Sans Condensed Bold"), local("DejaVuSansCondensed-Bold");
  size-adjust: var-medido; ascent-override: var-medido; descent-override: var-medido; line-gap-override: 0%; }
@font-face { font-family: "Anybody Fallback"; font-weight: 800;
  src: local("Arial Bold"), local("Arial-BoldMT"), local("Liberation Sans Bold"), local("LiberationSans-Bold"),
       local("Roboto Bold"), local("Roboto-Bold"), local("Helvetica Neue Bold"), local("HelveticaNeue-Bold");
  size-adjust: var-medido; ascent-override: var-medido; descent-override: var-medido; line-gap-override: 0%; }
@font-face { font-family: "Archivo Fallback";
  src: local("Arial"), local("ArialMT"), local("Liberation Sans"), local("LiberationSans"), local("Roboto"), local("Helvetica Neue");
  size-adjust: var-medido; ascent-override: var-medido; descent-override: var-medido; line-gap-override: 0%; }

:root {
  --fonte-estrutura: "Anybody", "Anybody Fallback Estreita", "Anybody Fallback", sans-serif;
  --fonte-letreiro: "Anybody Letreiro", "Anybody Fallback Estreita", "Anybody Fallback", sans-serif;
  --fonte-leitura: "Archivo", "Archivo Fallback", system-ui, sans-serif;
}
```

`var-medido` é substituído pelos valores que `scripts/metricas-fallback.mjs` grava: `size-adjust = largura(H1 na Anybody 62/800) / largura(H1 na face local)`; `ascent-override` e `descent-override` vêm de `fontBoundingBoxAscent/Descent` da Anybody medidos em canvas a 100px, divididos pelo `size-adjust`. Meta: CLS da troca de fonte ≤ 0,02.

**Preload:** só a Anybody, no `<head>` de `index.html`: `<link rel="preload" href="/src/assets/fonts/anybody-latin-wdth-normal.woff2" as="font" type="font/woff2" crossorigin>`. Aceite do build: o `href` final do preload é idêntico à URL hasheada usada no CSS.

### 2.4 Escala tipográfica

Escala clássica (Bringhurst) 12, 14, 16, 18, 21, 24, 36, 48, 72, com valores fluidos:

```css
--t-12: .75rem;  --t-14: .875rem;  --t-16: 1rem;  --t-24: 1.5rem;
--t-corpo: clamp(1.0625rem, 1.03rem + .12vw, 1.125rem);  /* 17 → 18 */
--t-lead:  clamp(1.0625rem, .93rem + .6vw, 1.3125rem);   /* 17 → 21 */
--t-h3:    clamp(1.5rem, 1.14rem + 1.5vw, 2.25rem);      /* 24 → 36 */
--t-h2:    clamp(2.25rem, 1.8rem + 1.9vw, 3rem);         /* 36 → 48 */
--t-h1:    clamp(2.75rem, 1.4rem + 4.2vw, 4.5rem);       /* 44 → 72 */
--t-nome:  clamp(4rem, 1.5rem + 9vw, 9rem);              /* 64 → 144 (desktop) */
--lh-corpo: 1.55;  --lh-lead: 1.45;  --lh-titulo: .95;  --lh-h2: 1;
```

Letreiro: `--largura-letreiro: min(100vw - 2 * var(--margem), 1536px)` para cálculos fora do contêiner; dentro do contêiner (`container-type: inline-size`), `font-size: calc(100cqi / 3.5756)`. A altura da linha do letreiro é `0.74em` (versal de 0,68em mais folga).

Nomes dos conceitos no mobile: cada nome ocupa a linha inteira com `font-size: min(7.5rem, 100cqi / var(--largura-em))`, onde `--largura-em` vem das métricas (Côdea 5,362em; Louça Torta 7,321em; Junco medido pelo script em 62/400).

### 2.5 Espaço, grade e leitura

- Base 8px: `--e-1: 8px; --e-2: 16px; --e-3: 24px; --e-4: 32px; --e-6: 48px; --e-8: 64px; --e-12: 96px; --e-16: 128px; --e-24: 192px`.
- Grade: 12 colunas, gutter 32px, margem 32px a partir de 1024px; 6 colunas, gutter e margem 24px de 600 a 1023px; 4 colunas, gutter e margem 16px abaixo de 600px. Conteúdo limitado a 1536px; acima disso as margens crescem.
- Cortes de seção: 128px no desktop, 72px no mobile.
- Medida: texto corrido até 64ch; lead até 46ch. Tudo alinhado à esquerda; nada centralizado exceto a Porta.
- Breakpoints de capacidade: 600, 768 (navegação completa, textura de grão), 1024 (palco desktop, "Testar aqui" com `pointer: fine`), e altura `max-height: 499px` (sem pista).
- Alvos de toque: mínimo 48×48px; botões primários no mobile têm 56px de altura e largura total.

### 2.6 Ângulo e formas

- `--corte: 16deg` (tan 16° = 0,2867). É a única inclinação do sistema. A medição do traço externo do W da Anybody wdth 150 (feita na hipótese) deu 16,0°.
- **Linha de corte:** desce 16° em relação à horizontal, da esquerda para a direita. Vetor ao longo do corte `(0,961; 0,276)`; perpendicular `(-0,276; 0,961)`.
- **Placa** (botões vermelhos, etiquetas): retângulo com a borda direita inclinada 16° em relação à vertical: `clip-path: polygon(0 0, 100% 0, calc(100% - var(--h) * .2867) 100%, 0 100%)` (com 56px de altura, recuo de 16px). O foco nunca fica no elemento clipado: a placa é um `::before` decorativo atrás do link; o contorno de foco fica no link.
- **Quadro de captura:** retângulo com o canto superior direito chanfrado por uma reta de 16°: `polygon(0 0, calc(100% - var(--c)) 0, 100% calc(var(--c) * .2867), 100% 100%, 0 100%)`, com `--c: clamp(32px, 12%, 96px)`. Estático.
- **Trajetórias:** deslocamentos até 24svh seguem a perpendicular do corte. A única exceção é a Porta (folhas com mais de 24svh de curso), que se move na vertical pura para manter o letreiro alinhado; o corte continua a 16°.
- **Raio:** zero em todo o portfólio. (As demos têm formas próprias.)
- Clip-paths que interpolam têm sempre 4 pontos.

### 2.7 Camadas

```css
--z-fundo: 0; --z-plano-tras: 10; --z-letreiro: 20; --z-conteudo: 30;
--z-header: 40; --z-barra-whatsapp: 45; --z-dialog: 50;
```

Menu e diálogos usam `<dialog>` com `showModal()` (top layer), então o `--z-dialog` serve só para o estado de animação de saída.

### 2.8 Movimento

```css
--ease-corte:    cubic-bezier(0.2, 0, 0, 1);      /* apresentação 480–720ms */
--ease-resposta: cubic-bezier(0.3, 0, 0, 1);      /* feedback 120–200ms */
--ease-saida:    cubic-bezier(0.3, 0, 0.8, 0.15); /* saída 200–240ms, sempre mais curta que a entrada */
--dur-toque: 120ms;  --dur-resposta: 160ms;  --dur-saida: 200ms;  --dur-saida-longa: 240ms;
--dur-placa: 240ms;  --dur-painel: 480ms;  --dur-revelacao: 520ms;  --dur-porta: 720ms;
--stagger-vao: 90ms;  --stagger-captura: 60ms;
```

`src/js/motion/tokens.js` espelha os mesmos valores em segundos para o Motion (`easeCorte = [0.2, 0, 0, 1]` etc.) e exporta `encaixe = { type: spring, visualDuration: 0.3, bounce: 0 }`.

| Grandeza | Valores |
| --- | --- |
| Distância micro | 2px (pressed), 4px (fenda das linhas em repouso), 6px (fenda do letreiro), 8px (meia-fenda aberta) |
| Distância média | 24px (menu, dialog), 48px (máximo fora do palco) |
| Distância do palco | desktop: metades de baixo 22svh, metades de cima 6svh; mobile: 7svh e 2svh por andar |
| Stagger | 90ms entre vãos, 60ms entre capturas e marcadores; nunca mais de 3 itens escalonados |
| Profundidade | Só dois planos: letreiro na frente, trabalho atrás. Plano de trás: véu preto com opacidade 0,75 → 0 e escala 1,06 → 1 (escala só no desktop). Paralaxe de reflexos: `--brilho` vai de 0,15 a 0,85 com p, e o plano de trás desloca +12px → −12px em x (desktop). Zero blur, zero sombra, zero `perspective` |
| Quantização do peso | passos de 20 com `pointer: fine`, passos de 40 com `pointer: coarse` (cerca de 17 degraus no mobile) |

### 2.9 Foco

Sobre preto e grafite: `outline: 2px solid var(--prata-luz); outline-offset: 3px; box-shadow: 0 0 0 7px var(--vermelho-sinal)` (o anel vermelho fica fora do contorno claro). Sobre a Chapa: `outline: 2px solid #000; box-shadow: 0 0 0 7px var(--vermelho-acrilico)`. Sempre `:focus-visible`; nada só em hover: todo hover tem o mesmo efeito em `:focus-visible`.

### 2.10 Wordmark e símbolo

- **Wordmark:** "WUNDERHUB" em Anybody wdth 150, wght 800, 18px, Prata Luz, `letter-spacing: .01em`. No HTML o texto é "WunderHub" com `text-transform: uppercase`, para leitores de tela lerem o nome certo. Medida: 10,311em (186px a 18px).
- **Símbolo exploratório** (declarado como proposta, não como logo): o W da Anybody wdth 150 w800 cortado a 16°, com a metade de baixo deslocada 2px na perpendicular, Prata Luz sobre preto. Usado só no favicon (`public/favicon.svg`) e na assinatura do rodapé, com o texto "Símbolo exploratório" no `title` do SVG.

---

## 3. Arquitetura de informação e texto

### 3.1 Páginas

```
/                                        home (portfólio)
/conceitos/codea/                        Côdea, landing page de padaria
/conceitos/junco/                        Junco Fisioterapia, início
/conceitos/junco/tratamentos/            tratamentos (?para=dor|cirurgia|esporte|gestacao)
/conceitos/junco/primeira-consulta/      primeira consulta
/conceitos/junco/agendar/                pedido de avaliação (?tratamento=slug)
/conceitos/louca-torta/                  loja: vitrine e catálogo
/conceitos/louca-torta/produto/          produto (?p=slug&esmalte=slug)
```

### 3.2 Ordem da home e ritmo de fundos

| # | Seção | id | Fundo | Intensidade |
| --- | --- | --- | --- | --- |
| 0 | Header sticky | | Preto | Quieto |
| 1 | Abertura (H1, lead, CTA) e palco | `#topo` | Preto | Acontecimento na carga e M1 |
| 2 | Trabalhos | `#trabalhos` | Preto | M2 |
| 3 | Serviços | `#servicos` | Grafite Parede | Pausa, estático |
| 4 | Como trabalho | `#processo` | Chapa (prata escovada) | M3 |
| 5 | Quem cuida do seu site | `#sobre` | Grafite Parede | Pausa, só texto |
| 6 | Contato (Porta e configurador) | `#contato` | Preto | Revelação única |
| 7 | Rodapé | | Preto | Quieto |

### 3.3 Dados centralizados

`src/config.js` é a única fonte de contato e marca:

```js
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
```

O HTML recebe esses valores no build por um plugin do Vite (`transformIndexHtml`, ordem `pre`) que troca os marcadores `{{whatsappUrl}}`, `{{whatsappExibicao}}`, `{{email}}`, `{{mailtoUrl}}` e `{{ano}}`. Assim os links funcionam sem JavaScript.

### 3.4 Texto da home (final, PT-BR)

Regras de escrita aplicadas: primeira pessoa, voz ativa, frases curtas, sem travessões, sem "não é X, é Y", sem rótulos em caixa alta, sem slogans picados, CTA dizendo o que acontece.

**Head.** `<title>WunderHub, sites para pequenos negócios por Kauê Ribeiro</title>`. Description: "Kauê Ribeiro cria landing pages, sites institucionais e lojas virtuais para pequenos negócios e profissionais. Fale pelo WhatsApp ou por e-mail." `lang="pt-BR"`.

**Skip link** (primeiro elemento focável, visível só no foco): "Pular para os trabalhos" → `#trabalhos`.

**Header.** Wordmark (link para `#topo`, nome acessível "WunderHub, início"). Navegação (≥768px): Trabalhos · Serviços · Como trabalho · Contato (os links são separados por espaço, sem pontos no texto). Abaixo de 768px: botão-ícone de WhatsApp (`aria-label="Chamar no WhatsApp"`, ícone genérico de balão de conversa desenhado em SVG, sem logo de terceiros) e botão "Menu".

**Abertura.**

- H1: **Sites para o seu negócio ser encontrado e chamado.**
- Lead: "Sou Kauê Ribeiro, da WunderHub. Crio landing pages, sites institucionais e lojas virtuais para pequenos negócios e profissionais. Quem atende você sou eu, da primeira conversa à publicação."
- Placa: **Chamar no WhatsApp** (`{{whatsappUrl}}`, `target="_blank" rel="noopener"`).
- Link: **Ver os trabalhos** (`#trabalhos`).
- Placas da fachada (aparecem no fim do palco): "Côdea, padaria de bairro" · "Junco, fisioterapia" · "Louça Torta, cerâmica" (cada uma é um link para `#conceito-<slug>`).

**Trabalhos.**

- H2: **Três negócios fictícios, três demonstrações navegáveis**
- Texto: "Criei estas marcas para mostrar decisões diferentes de estrutura, texto e interação. Nenhuma delas é cliente real, e cada demonstração avisa isso na própria página."
- Filme: botão "Assistir ao filme" com legenda "Filme da fachada, 18 segundos, sem som. Mostra o letreiro abrindo, as três demonstrações e o contato."

Linha 1, `#conceito-codea`:
- Nome: **Côdea**
- Linha de tipo: "Padaria de bairro. Landing page de uma página."
- Objetivo: "Fazer quem passa ver o que saiu do forno hoje e encomendar para retirar."
- Decisões:
  - A: "Horário e aviso de aberto ou fechado no topo, porque a primeira dúvida de quem passa é se a padaria está aberta."
  - B: "Cardápio do dia com filtros e preço visível, para escolher sem precisar perguntar."
  - C: "A encomenda monta a mensagem pronta, então o pedido chega organizado para quem atende."

Linha 2, `#conceito-junco`:
- Nome: **Junco**
- Linha de tipo: "Clínica de fisioterapia. Site institucional com quatro páginas."
- Objetivo: "Explicar os tratamentos com calma e levar a pessoa a pedir a primeira avaliação."
- Decisões:
  - A: "Tratamentos organizados pelo que a pessoa sente, e não por nomes técnicos."
  - B: "Uma página só para explicar a primeira consulta, que é onde aparecem as dúvidas."
  - C: "Pedido de horário em quatro passos curtos, com resumo antes de enviar."

Linha 3, `#conceito-louca-torta`:
- Nome: **Louça Torta**
- Linha de tipo: "Cerâmica feita à mão. Loja virtual."
- Objetivo: "Mostrar cada peça de perto e deixar a compra simples."
- Decisões:
  - A: "Filtros por tipo de peça, cor do esmalte e pronta entrega."
  - B: "Na página do produto, trocar o esmalte troca a foto, para ver a cor antes de comprar."
  - C: "Sacola lateral com subtotal e prazo, sem tirar a pessoa da página."

Ações de cada linha: link **Abrir demonstração**; botão **Ver decisões** (nome acessível "Ver decisões de Côdea"; quando aberto, "Fechar decisões"); dentro do painel, **Testar aqui** (só com `pointer: fine` e largura ≥ 1024px).

**Serviços.**

- H2: **Três formatos de site**
- Texto: "Cada formato resolve um tipo de pedido. Se você ainda não sabe qual é o seu, a gente decide na primeira conversa."

Landing page:
- Resumo: "Uma página com um objetivo só: pedir orçamento, reservar, encomendar ou chamar no WhatsApp."
- Para quem é: "Para quem tem um serviço ou produto principal e quer que a pessoa tome uma ação clara."
- O que inclui: "Uma página pensada primeiro para o celular, texto em blocos curtos, botão de contato sempre por perto e link direto para o WhatsApp."
- O que você precisa me mandar: "O que você vende, para quem, os preços que quiser mostrar e as fotos que já tiver."
- Link: "Ver o exemplo: Côdea" → `#conceito-codea`

Site institucional:
- Resumo: "Poucas páginas, cada uma respondendo a uma pergunta de quem pensa em contratar você."
- Para quem é: "Para profissionais e empresas de serviço que precisam explicar o que fazem e passar confiança antes do primeiro contato."
- O que inclui: "Páginas como início, serviços, como funciona e contato, com navegação simples e textos revisados junto com você."
- O que você precisa me mandar: "A lista dos seus serviços, as perguntas que os clientes mais fazem, endereço e horários, se houver."
- Link: "Ver o exemplo: Junco" → `#conceito-junco`

Loja virtual:
- Resumo: "Catálogo com filtros, página de produto e sacola, para quem vende peças ou produtos pela internet."
- Para quem é: "Para quem tem produtos com fotos, preços e variações e quer vender sem depender só de mensagens."
- O que inclui: "Catálogo com filtros, uma página para cada produto com suas variações, sacola e a forma de pagamento que combinarmos."
- O que você precisa me mandar: "Fotos dos produtos, preços, variações como cor ou tamanho, e como você entrega."
- Link: "Ver o exemplo: Louça Torta" → `#conceito-louca-torta`

**Como trabalho** (sobre a Chapa).

- H2: **Como trabalho**
- Texto: "O projeto ganha peso aos poucos. Escolha uma etapa para ver o que muda nela."
- Rótulo do trilho: "Etapa do projeto"
- Lista sempre visível (`<ol>`):

1. **Conversa**
   - O que eu faço: "Pergunto o que você vende, para quem e o que a pessoa precisa conseguir fazer no site."
   - O que você recebe: "Um resumo escrito com o objetivo do site e o público."
   - O que preciso de você: "Uma conversa, por chamada ou por mensagem, e exemplos de sites que você gosta ou não gosta."
2. **Mapa**
   - O que eu faço: "Organizo o conteúdo: quais páginas, em que ordem e que pergunta cada uma responde."
   - O que você recebe: "O mapa das páginas e a lista do que falta, como textos, fotos e preços."
   - O que preciso de você: "Que você revise o mapa e me mande o material da lista."
3. **Desenho**
   - O que eu faço: "Desenho as telas começando pelo celular, com a cara do seu negócio."
   - O que você recebe: "Uma prévia navegável para aprovar ou pedir ajustes."
   - O que preciso de você: "Seus comentários sobre a prévia, de uma vez só sempre que der."
4. **Construção**
   - O que eu faço: "Escrevo o código, testo em telas de vários tamanhos e confiro velocidade e acessibilidade."
   - O que você recebe: "O site completo num endereço de teste."
   - O que preciso de você: "Uma última conferência de textos, preços e contatos."
5. **No ar**
   - O que eu faço: "Publico o site e confiro com você se o WhatsApp e o e-mail estão funcionando."
   - O que você recebe: "O site publicado no endereço combinado."
   - O que preciso de você: "Acesso ao domínio, se você já tiver um."
- Linha final: "Você fala comigo em todas as etapas. O prazo de cada projeto a gente combina na primeira conversa."

**Quem cuida do seu site** (Grafite Parede, colunas 3 a 9).

- H2: **Quem cuida do seu site**
- Parágrafo 1: "Sou Kauê Ribeiro, e WunderHub é o nome do meu trabalho. Eu mesmo converso com você, organizo o conteúdo, desenho as telas, escrevo o código e publico o site."
- Parágrafo 2: "Por isso você não precisa repetir o pedido para várias pessoas, e cada decisão tem alguém que responde por ela."
- Parágrafo 3: "Os projetos desta página são conceitos que criei com marcas fictícias. Quando você me chamar, mostro de perto por que cada escolha foi feita."

**Contato (Porta).**

- H2: **Vamos conversar sobre o seu site**
- Texto: "Me conte o que você vende e o que precisa no site. Respondo pelo WhatsApp ou por e-mail."
- Placa: **Chamar no WhatsApp**, com o número visível ao lado: "+55 (11) 95930-0903".
- E-mail: link **kaueribeiro12@gmail.com** (`{{mailtoUrl}}`) e botão **Copiar e-mail** (só com JS e Clipboard API). Confirmação: o botão passa a "E-mail copiado" por 2s e uma região `role="status"` anuncia "E-mail copiado". Falha: "Não deu para copiar. Selecione o endereço acima e copie."

**Configurador** (depois da Porta, sobre Grafite Parede; só com JS, `hidden` no HTML até o módulo carregar):

- H3: **Monte um rascunho do pedido**
- Texto: "Marque o que você imagina. Eu recebo a mensagem pronta e a gente ajusta na conversa."
- Fieldset 1, legenda "Que tipo de site você precisa?": Landing page · Site institucional · Loja virtual · Ainda não sei (rádios; padrão: nenhum).
- Fieldset 2, legenda "O que o site precisa ter?": Botão de WhatsApp · Cardápio ou catálogo · Lista de serviços · Horários ou agenda · Mapa e endereço · Galeria de fotos · Sacola de compras · Perguntas frequentes (checkboxes).
- Campo: "Nome do negócio (opcional)".
- Prévia: rótulo "Sua mensagem", `<output>` com quebra de linha preservada.
- Modelo da mensagem: "Oi, Kauê! Vim pelo site da WunderHub.{ Meu negócio se chama NOME.}{ Preciso de TIPO.}{ O site precisa ter: ITEM1, ITEM2 e ITEM3.} Podemos conversar?" (cada trecho entre chaves só entra se preenchido; "Ainda não sei" vira "Ainda não sei qual tipo de site preciso.").
- Botões: **Enviar este rascunho pelo WhatsApp** (link `wa.me` com o texto) e **Enviar por e-mail** (mailto com assunto "Site para o meu negócio" e o corpo).
- Aviso fixo: "O site não envia nada sozinho. O WhatsApp ou o seu e-mail abre com a mensagem pronta e você revisa antes de mandar."
- Resumo para leitor de tela (`aria-live="polite"`, atualizado 500ms depois da última mudança): "Rascunho com 4 itens: landing page, botão de WhatsApp, cardápio ou catálogo, mapa e endereço."

**Barra de WhatsApp no mobile** (<768px): "Chamar no WhatsApp".

**Rodapé.** Wordmark e símbolo exploratório; "WunderHub, sites para pequenos negócios e profissionais. Feito por Kauê Ribeiro."; links WhatsApp e e-mail; "Côdea, Junco e Louça Torta são marcas fictícias criadas como demonstração."; "© {{ano}} WunderHub"; link "Voltar ao topo".

---

## 4. Wireframes

### 4.1 Desktop 1440, home inteira

```
y≈0  ┌────────────────────────────────────────────────────────────────────────────────────────┐
     │ [Pular para os trabalhos]  (visível só no foco)                                          │
     │ WUNDERHUB◸                               Trabalhos   Serviços   Como trabalho   Contato │ header 64, sticky
     ├────────────────────────────────────────────────────────────────────────────────────────┤
     │ ABERTURA, preto (bloco de texto com min-height para o letreiro tocar 32px acima da dobra)│
     │ col 1–7                                              col 9–12                            │
     │ Sites para o seu negócio ser                         Sou Kauê Ribeiro, da WunderHub.     │
     │ encontrado e chamado.                                Crio landing pages, sites           │
     │ H1 Anybody 62/800, 72/68, Prata Luz                  institucionais e lojas virtuais...  │
     │                                                      [▰▰ Chamar no WhatsApp ◣]           │
     │                                                      Ver os trabalhos                    │
y≈583│ ┌W──────U─────N──────┐┌D─────E────R─────┐┌H─────U─────B──────┐  letreiro p=0           │
     │ │‾‾‾‾‾‾‾‾‾‾╲          ││‾‾‾‾‾‾‾╲          ││‾‾‾‾‾‾‾╲           │  Anybody 50/900, 385px  │
     │ │  aresta    ╲ fenda  ││        ╲         ││        ╲          │  nome contínuo          │
     │ │  polida     ╲ preta ││         ╲        ││         ╲         │  3 cortes de 16°        │
y≈868│ └────────────────────┘└─────────────────┘└───────────────────┘  32px acima da dobra    │
y=900├──────────────────────────────────── dobra ─────────────────────────────────────────────┤
     │ PALCO: caixa sticky em top 64, pista 120svh. Estado em p=1:                              │
     │  │W│  │U│  │N│        │D│ │E│ │R│        │H│ │U│ │B│     metades de cima, peso 140     │
     │  ╲▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╲    ╲▓▓▓▓▓▓▓▓▓▓▓▓▓▓╲    ╲▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╲   janelas abertas a 16°   │
     │   ╲ captura Côdea  ╲    ╲ captura Junco ╲    ╲ captura Louça ╲  plano de trás em 1,0    │
     │ [▰ Côdea, padaria de bairro] [▰ Junco, fisioterapia] [▰ Louça Torta, cerâmica]          │
     │  │W│  │U│  │N│        │D│ │E│ │R│        │H│ │U│ │B│     metades de baixo              │
     ├────────────────────────────────────────────────────────────────────────────────────────┤
     │ #trabalhos, preto                                                                        │
     │ Três negócios fictícios, três demonstrações          ┌ poster 16:9, chanfro 16° ◸──────┐ │
     │ navegáveis  (H2, col 1–8)                             │       Assistir ao filme         │ │
     │ Criei estas marcas para mostrar decisões...           └ Filme da fachada, 18 s, sem som ┘ │
     │ ──────────────────────────────────────────────────────────────────────────────────────  │
     │ Côdea ╲  (Anybody 150/850, 144px, cortado a 16°, fenda aberta 20px)                     │
     │ Padaria de bairro. Landing page de uma página.        Abrir demonstração  [Fechar decisões]│
     │ ┌ painel aberto por padrão ─────────────────────────────────────────────────────────┐  │
     │ │ ┌ captura 960, quadro com chanfro ◸ ───────────────┐  Fazer quem passa ver o que   │  │
     │ │ │ [A]                                                │  saiu do forno hoje...        │  │
     │ │ │            [B]                     ┌ celular ┐     │  A  Horário e aviso de aberto  │  │
     │ │ │                      [C]           │  390    │     │  B  Cardápio do dia com filtros│  │
     │ │ └────────────────────────────────────│         │─────┘  C  A encomenda monta a msg   │  │
     │ │                                      └─────────┘        Abrir demonstração  Testar aqui│  │
     │ └──────────────────────────────────────────────────────────────────────────────────┘  │
     │ Junco ╲ (Anybody 62/400)                                                                 │
     │ Clínica de fisioterapia. Site institucional...         Abrir demonstração  [Ver decisões]│
     │ Louça Torta ╲ (Anybody 125/250)                                                          │
     │ Cerâmica feita à mão. Loja virtual.                    Abrir demonstração  [Ver decisões]│
     ├────────────────────────────────────────────────────────────────────────────────────────┤
     │ #servicos, Grafite Parede                                                                │
     │ Três formatos de site (H2)   Cada formato resolve um tipo de pedido...                  │
     │ LANDING PAGE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  (viga: 150/800, 120px, linha inteira)  │
     │ Uma página com um objetivo só...                                                         │
     │ Para quem é          O que inclui           O que você precisa me mandar   Ver o exemplo │
     │ ─────────────                                                                            │
     │ Site                  (andares: 125/700, 120px, 2 linhas)                                │
     │ institucional                                                                            │
     │ (mesma grade de 4 colunas de texto)                                                      │
     │ ─────────────                                                                            │
     │ ┃L┃o┃j┃a┃ ┃v┃i┃r┃t┃u┃a┃l┃  (pilares: 50/800, 120px)                                     │
     │ (mesma grade de 4 colunas de texto)                                                      │
     ├────────────────────────────────────────────────────────────────────────────────────────┤
     │ #processo, Chapa de prata escovada, texto preto                                          │
     │ Como trabalho (H2)   O projeto ganha peso aos poucos...                                  │
     │ SEU NEGÓCIO  ← palavra a 124px; largura vai de 112px (Conversa) a 1350px (No ar)         │
     │ (guias vermelhas no Mapa, grade de 12 colunas no Desenho, corte e placa "No ar")         │
     │ Etapa do projeto  ├──◆───────────┼────────────┼────────────┼────────────┤  range 1–5    │
     │                   Conversa       Mapa         Desenho      Construção   No ar  (botões)  │
     │ ┌1 Conversa──┐┌2 Mapa──────┐┌3 Desenho───┐┌4 Construção┐┌5 No ar─────┐  lista sempre    │
     │ │mini-palavra││mini-palavra││mini-palavra││mini-palavra││mini-palavra│  visível; a etapa│
     │ │O que eu faço│…           │…            │…            │…           │  ativa ganha     │
     │ │O que você   │                                                     │  borda vermelha  │
     │ │recebe       │                                                     │  de 4px          │
     │ │O que preciso│                                                     │                  │
     │ └────────────┘└────────────┘└────────────┘└────────────┘└────────────┘                  │
     │ Você fala comigo em todas as etapas. O prazo...                                          │
     ├────────────────────────────────────────────────────────────────────────────────────────┤
     │ #sobre, Grafite Parede, col 3–9, só texto                                                │
     │ Quem cuida do seu site (H2) + 3 parágrafos                                               │
     ├────────────────────────────────────────────────────────────────────────────────────────┤
     │ #contato, preto. PORTA (estado aberto)                                                   │
     │ ┌W──U──N ╲┐┌D──E──R ╲┐┌H──U──B ╲┐   metades de cima do letreiro (900)                 │
     │                Vamos conversar sobre o seu site  (H2, centralizado)                      │
     │                Me conte o que você vende...                                              │
     │                [▰▰ Chamar no WhatsApp ◣]   +55 (11) 95930-0903                           │
     │                kaueribeiro12@gmail.com   [Copiar e-mail]                                 │
     │ └W──U──N ╲┘└D──E──R ╲┘└H──U──B ╲┘   metades de baixo                                    │
     │ ┌ Monte um rascunho do pedido, Grafite Parede, chanfro ◸ ────────────────────────────┐  │
     │ │ Que tipo de site?  ( ) Landing  ( ) Institucional  ( ) Loja  ( ) Ainda não sei     │  │
     │ │ O que precisa ter? [ ] WhatsApp [ ] Cardápio... (2 colunas)  │ Sua mensagem        │  │
     │ │ Nome do negócio [__________]                                  │ Oi, Kauê! Vim...    │  │
     │ │ [Enviar este rascunho pelo WhatsApp] [Enviar por e-mail]      │                     │  │
     │ └─────────────────────────────────────────────────────────────────────────────────────┘ │
     ├────────────────────────────────────────────────────────────────────────────────────────┤
     │ rodapé: wordmark, contatos, aviso das marcas fictícias, © ano, Voltar ao topo            │
     └────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Mobile 390, home inteira

```
┌──────────────────────────────────────┐
│ WUNDERHUB◸            [💬] [Menu]    │ header 56; 💬 = ícone WhatsApp 48px
├──────────────────────────────────────┤
│ Sites para o seu                     │ H1 Anybody 62/800, 44/42
│ negócio ser                          │
│ encontrado e chamado.                │
│ Sou Kauê Ribeiro, da WunderHub.      │ lead Archivo 17/26
│ Crio landing pages, sites            │
│ institucionais e lojas virtuais...   │
│ [▰▰▰▰ Chamar no WhatsApp ▰▰▰▰▰▰◣]    │ 56px, largura total
│ Ver os trabalhos                     │ 48px
│ ┌──────────────────────────────────┐ │
│ │ W  U  N   corte 16° de canto a   │ │ andar 1, wdth 110,5
│ │      ‾‾‾‾╲ canto (10,6% → 89,4%) │ │
│ ├──────────────────────────────────┤ │
│ │ D  E  R                          │ │ andar 2, wdth 144,5
└─┴──────────────── dobra ───────────┴─┘
  │ H  U  B                          │   andar 3, wdth 134 (mesma largura, 358px)
  PALCO: sticky em top 56, pista 90svh; cada andar abre 7svh + 2svh;
  os andares descem em cascata (andar k desce k × 9svh); peso 900 → 220;
  uma captura desktop 480w por andar; placas abaixo de cada janela em p ≥ 0,85
├──────────────────────────────────────┤
│ #trabalhos                           │
│ Três negócios fictícios, três        │
│ demonstrações navegáveis             │
│ Criei estas marcas...                │
│ Côdea ╲   (nome ajustado à largura)  │
│ Padaria de bairro. Landing page...   │
│ ┌ captura celular 390, chanfro ◸ ──┐ │ painel aberto por padrão
│ │ [A]                              │ │
│ │        [B]                       │ │
│ │                [C]               │ │
│ └──────────────────────────────────┘ │
│ A  Horário e aviso de aberto...      │
│ B  Cardápio do dia...                │
│ C  A encomenda monta...              │
│ [▰▰▰▰▰ Abrir demonstração ▰▰▰▰▰▰◣]   │ 56px largura total
│ [ Fechar decisões ]                  │ 48px
│ Junco ╲                              │
│ ...  [Abrir demonstração] [Ver decisões]│
│ Louça Torta ╲                        │
│ ...                                  │
│ ┌ poster 16:9 ─────────────────────┐ │ filme depois das linhas
│ │        Assistir ao filme         │ │
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│ #servicos, Grafite                   │
│ Três formatos de site                │
│ LANDING PAGE ━━━━━ (32px, viga fina) │
│ Uma página com um objetivo só...     │
│ Para quem é / O que inclui /         │
│ O que você precisa me mandar         │ empilhados
│ Ver o exemplo: Côdea                 │
│ Site / institucional (40px)          │
│ ┃Loja┃virtual┃ (96px, pilares)      │
├──────────────────────────────────────┤
│ #processo, Chapa                     │
│ Como trabalho                        │
│ SEU                                  │ palavra em 2 linhas, 49px
│ NEGÓCIO                              │
│ Etapa 3 de 5: Desenho                │ etapa atual em destaque (Anybody 24px)
│ ├──────────◆──────────┤ range 48px   │
│ [1] [2] [3] [4] [5]  botões 48×48    │
│ 1 Conversa ...                       │ lista completa empilhada
│ 2 Mapa ...                           │
│ ...                                  │
├──────────────────────────────────────┤
│ #sobre, Grafite: Quem cuida...       │
├──────────────────────────────────────┤
│ #contato, PORTA                      │
│ WUN╲DER╲HUB╲ (1 linha, 100px, cima)  │
│ Vamos conversar sobre o seu site     │
│ [▰▰▰ Chamar no WhatsApp ▰▰▰◣]        │ empilhados, largura total
│ +55 (11) 95930-0903                  │
│ kaueribeiro12@gmail.com              │
│ [Copiar e-mail]                      │
│ WUN╲DER╲HUB╲ (metades de baixo)      │
│ Monte um rascunho do pedido          │
│ (campos empilhados, prévia abaixo)   │
├──────────────────────────────────────┤
│ rodapé                               │
└──────────────────────────────────────┘
 Barra fixa inferior (entre o fim do palco e a Porta):
 ┌──────────────────────────────────────┐
 │ [▰▰▰▰▰ Chamar no WhatsApp ▰▰▰▰▰▰]   │ 48px + env(safe-area-inset-bottom)
 └──────────────────────────────────────┘
```

---

## 5. Os momentos

Divisão de motores (uma propriedade, um dono):

| Propriedade | Dono |
| --- | --- |
| `transform`, opacidade do véu, escala da imagem de trás, `--peso`, `--brilho` do letreiro do palco | `src/js/letreiro/render.js` (único escritor, em `frame.render` do Motion) |
| Progresso p do palco | `scroll(callback)` do Motion 14.3 |
| Números da carga (varredura, descida) | `animate(0, 1, { onUpdate })` do Motion, lidos pelo renderizador |
| `clip-path` de placas pequenas (entrada e saída) | `animate()` do Motion |
| `grid-template-rows` dos painéis, cores, sublinhados, hover, foco, pressed | Transições CSS |
| `transform` das metades dos nomes, persianas, marcadores, opacidade de decisões (M2) | `animate()` do Motion em `src/js/vitrine.js` |
| Eixos da palavra do processo (`--w`, `--s`) | `src/js/processo.js` (único escritor, em `frame.render`) |
| `stroke-dashoffset` das guias do processo | `animate()` do Motion |
| `transform` das folhas da Porta | `animate()` do Motion em `src/js/porta.js` |
| Showreel | GSAP 3.14.2 dentro da composição Hyperframes (nunca no site) |

`MotionGlobalConfig.skipAnimations = true` quando `prefers-reduced-motion: reduce`, espelhado por `@media (prefers-reduced-motion: reduce)` no CSS (transições a 0ms) e ouvindo `change` do `matchMedia` para alternar em tempo real.

### 5.0 Acontecimento de carga: o corte (antes do M1)

- **Gatilho:** a Anybody pronta (`document.fonts.load('900 100px "Anybody Letreiro"')`), sem gesto. Só acontece se: há `.js`, não há reduced motion, a fonte resolveu em até 900ms e o palco está em p=0.
- **Estado inicial (CSS com `.js`):** metades encostadas (fenda 0), aresta polida invisível. O letreiro já está pintado e legível, então não atrasa o LCP.
- **Sequência:** para cada vão i (WUN, DER, HUB), com atraso `i × 90ms`: a faixa especular percorre a aresta da esquerda para a direita em 520ms (`--ease-corte`), deixando a aresta visível atrás dela; ao terminar, a metade de baixo desce 6px na perpendicular em 240ms (`--ease-corte`). Termina em 940ms.
- **Interrupção:** se a rolagem começar (p > 0), as animações recebem `complete()` e o estado final fica valendo.
- **Reduced motion, sem JS, fonte lenta, volta pelo bfcache:** estado final direto (fenda 6px, aresta visível), sem repetir.

### 5.1 Momento 1: a fachada vira vitrine (abertura → Trabalhos)

**Estrutura DOM:**

```html
<div class="palco" id="palco">                  <!-- altura: caixa + pista (só com .js) -->
  <div class="palco__caixa">                    <!-- position: sticky; top: var(--header-h); height: calc(100svh - var(--header-h)) -->
    <div class="fachada" aria-hidden="true">    <!-- contain: layout paint style; container-type: inline-size -->
      <div class="vao" data-vao="0">            <!-- um por vão; no mobile, um por andar -->
        <div class="vao__fundo">                <!-- overflow hidden; vai de −U a h + D -->
          <img src="…/codea-desktop-960.webp" alt="" width="960" height="600" loading="lazy" decoding="async" fetchpriority="low">
          <span class="vao__veu"></span>         <!-- preto, opacidade 0,75 → 0 -->
        </div>
        <div class="vao__metade vao__metade--cima">  <!-- fundo preto (ACM), clip-path estático acima do corte, estende U para cima e 64px nas laterais -->
          <span class="letras">…células…</span><span class="aresta">…</span>
        </div>
        <div class="vao__metade vao__metade--baixo"> <!-- fundo preto, clip-path estático abaixo do corte, estende D para baixo -->
          <span class="letras">…células…</span><span class="retorno">…</span>
        </div>
      </div>
      …
    </div>
    <nav class="placas" aria-label="Conceitos na fachada" inert>
      <a class="placa placa--conceito" href="#conceito-codea">Côdea, padaria de bairro</a> …
    </nav>
  </div>
</div>
```

Cada letra mora numa célula de largura fixa (a largura da letra em wght 900, gerada pelo script de métricas), então perder peso não muda o layout: o intercolúnio cresce dentro da célula. Os painéis pretos das metades cobrem o plano de trás em repouso; a janela é o espaço entre as metades quando elas se afastam. Mapeamento: WUN → Côdea, DER → Junco, HUB → Louça Torta.

- **Gatilho:** rolagem nativa. `scroll((p) => {…}, { target: palco, offset: ['start ' + headerH + 'px', 'end end'] })`. A distância de p=0 a p=1 é exatamente a pista: 120svh com largura ≥ 1024px; 90svh abaixo disso.
- **Estado inicial (p=0):** nome contínuo, wght 900, fenda 6px preta, véu 0,75, plano de trás em escala 1,06, placas ocultas e `inert`.
- **Funções de p (todas puras, clamp em 0..1):**

| Faixa | Variável | Desktop (≥1024) | Mobile |
| --- | --- | --- | --- |
| 0 → 0,35 | abertura `a` | metade de baixo: `6px + a × 22svh` na perpendicular; metade de cima: `a × 6svh` na direção oposta | por andar: `6px + a × 7svh` e `a × 2svh`; andar k desce `k × a × 9svh` |
| 0,25 → 0,80 | peso `w` | wght `900 − w × 760` (até 140), passos de 20 | wght `900 − w × 680` (até 220), passos de 40 |
| 0,20 → 0,85 | luz `b` | véu `0,75 × (1 − b)`; escala da imagem `1,06 − 0,06 × b`; x da imagem `12px − 24px × b` | véu `0,75 × (1 − b)`; sem escala; sem x |
| 0 → 1 | brilho | `--brilho = 0,15 + 0,7 × p` | igual |
| ≥ 0,85 | placas | entram por clip-path ao longo do corte em 240ms (`--ease-corte`), stagger 90ms; perdem o `inert` | igual, uma placa abaixo de cada janela |

- **Estado final (p=1):** três janelas em paralelogramo abertas, letras como caixilhos finos em wght 140, capturas em brilho pleno, placas visíveis e focáveis. O sticky solta e a seção Trabalhos começa com as mesmas três linhas, na mesma ordem, com a mesma placa vermelha.
- **Reverso:** tudo é função de p; rolar de volta fecha as janelas e devolve o peso quadro a quadro. Ao cruzar 0,85 para baixo, as placas saem em 200ms (`--ease-saida`) e voltam a `inert`. Exceção: enquanto o foco estiver dentro da `nav.placas`, elas não saem nem recebem `inert`; quando o foco sai, voltam a seguir p.
- **Teclado:** Espaço, PageDown, setas e Home/End rolam nativamente; nada dentro do letreiro é focável. O skip link e o item Trabalhos do header vão para `#trabalhos`, depois do palco. A ordem de Tab segue: header, CTA, "Ver os trabalhos", (placas, quando visíveis), Trabalhos.
- **Toque:** rolagem nativa; sem `scroll-snap`, sem interceptar roda ou toque, sem Lenis.
- **Mobile:** torre de 3 andares; pista de 90svh; peso até 220; sem escala no plano de trás; capturas desktop 480w (cerca de 25 KB cada) porque o recorte paisagem lê melhor que o retrato.
- **Reduced motion, sem JS, altura < 500px (inclui zoom de 200% em 1440×900), teto de 3s estourado:** sem pista (`.palco` com altura automática) e um estado estático equivalente a p=0,62 com placas visíveis: janelas totalmente abertas, wght 390 no desktop e 440 no mobile, véu 0,25, escala 1, placas sem `inert`. Esse estado está todo em CSS (classe padrão sem `.js`), sem depender do script.
- **Falha de imagem:** `onerror` troca a imagem do vão por Grafite Parede com o nome do conceito em Archivo 650 (decorativo; o link real está na placa).
- **Fonte lenta (classe `.fonte-lenta`):** letreiro no fallback estreito, sem animar o peso (o fallback não é variável); as aberturas por transform continuam.
- **Motores:** `scroll` (Motion) entrega p; `render.js` escreve tudo num único `frame.render`, só quando algum valor quantizado muda; `animate` (Motion) para as placas. Nenhuma propriedade é escrita por CSS e JS ao mesmo tempo. `will-change: transform` nas metades só enquanto o palco está em vista (`inView` com margem de 50%).
- **Orçamento:** abaixo de 4ms de script + estilo + layout por quadro com CPU 4x mais lenta no painel Performance do Chromium. Se não bater, plano B: passos de peso de 40 também no desktop.

### 5.2 Momento 2: o letreiro se parte (vitrine)

- **Gatilho:** botão "Ver decisões" de cada linha (`aria-expanded`, `aria-controls="painel-<slug>"`), por clique, toque, Enter ou Espaço. Também abre por `hashchange` para `#conceito-<slug>` (placas da fachada, links "Ver o exemplo" dos serviços).
- **Nome partido:** o `<h3>` tem o nome em texto real (visualmente oculto) e duas cópias `aria-hidden` sobrepostas, recortadas por uma reta de 16° que passa pelo centro do nome (polígonos estáticos gerados pelo script de métricas; quando a reta sai pela base ou pelo topo do nome, o polígono é recortado na caixa).
- **Estado inicial (fechado):** fenda de 4px (a de baixo deslocada 4px na perpendicular), aresta polida visível, painel `grid-template-rows: 0fr` e `inert`.
- **Abrir:**
  1. CSS: painel `0fr → 1fr` em 480ms `--ease-corte`; o `inert` sai antes da animação.
  2. Motion: metade de cima sobe 8px na perpendicular e a de baixo desce mais 4px (fenda total de 16px), 240ms `--ease-corte`.
  3. Motion: em cada quadro de captura, uma persiana em Grafite Parede que cobre a imagem desliza para fora ao longo da perpendicular (de `translate(0, 0)` até `translate(−0,287 × H, H)`, com H medido uma vez ao abrir), 520ms `--ease-corte`, stagger 60ms (desktop, depois celular). A imagem vai de escala 1,04 a 1 no mesmo tempo. O quadro tem clip-path estático; nada de clip-path animado.
  4. Motion: marcadores A, B, C (quadrados de 32px em Vermelho Acrílico com a letra em branco, `aria-hidden`) entram com opacidade 0 → 1 e y 8px → 0, 160ms `--ease-resposta`, atraso 320ms, stagger 60ms.
  5. Motion: objetivo, decisões e links entram com opacidade 0 → 1 em 180ms, atraso 200ms.
  6. `history.replaceState(null, '', '#conceito-<slug>')`.
- **Uma linha aberta por vez:** abrir outra fecha a anterior (painel em 240ms `--ease-saida`, persianas voltam em 200ms, metades voltam à fenda de 4px) e a nova recebe `scrollIntoView({ block: 'nearest' })` (comportamento `smooth` só sem reduced motion).
- **Estado de carga:** com JS, a linha 1 (Côdea) começa aberta, sem animação, para que capturas grandes apareçam logo depois do palco. Se a URL tiver `#conceito-<slug>`, essa linha começa aberta no lugar dela, também sem animação.
- **Reverso:** o mesmo botão ou Escape com o foco dentro da linha fecha: persianas voltam pelo mesmo caminho em sentido contrário (a direção indica o fechamento), painel `1fr → 0fr`, foco volta ao botão, painel recebe `inert`, hash é removido com `replaceState`.
- **Interrupção:** um novo clique no meio chama `stop()` nas animações da linha e anima do valor atual na direção nova. Sem fila.
- **Teclado:** Tab percorre botão, links do painel, próxima linha. Escape fecha. Alvos ≥ 48px.
- **Toque e mobile:** o painel mostra só a captura de celular (390) com os marcadores do celular; "Abrir demonstração" vira botão de largura total com 56px; "Testar aqui" não existe.
- **Reduced motion:** sem deslocamento das metades, sem persianas (imagens já visíveis), painel alterna instantâneo; a fenda de 16px aparece como estado.
- **Sem JS:** todos os painéis abertos (o estado fechado só existe sob `.js`), botões "Ver decisões" ocultos, links de demonstração funcionando.
- **Falha de imagem:** o quadro mostra Grafite Parede com "Captura indisponível. Abra a demonstração para ver a página." e o link continua.

### 5.3 Momento 3: o projeto ganha peso (Como trabalho, sobre a Chapa)

- **Controle:** `<input type="range" id="etapa" min="1" max="5" step="1" value="1">` com `<label for="etapa">Etapa do projeto</label>` e `aria-valuetext="Etapa 1 de 5: Conversa"` atualizado a cada `input`. Abaixo, cinco botões de etapa (desktop: "Conversa", "Mapa", "Desenho", "Construção", "No ar"; mobile: "1" a "5" com `aria-label="Etapa 1: Conversa"` etc.), com `aria-pressed` na ativa. O contêiner dos controles fica `hidden` sem JS.
- **Palavra:** "SEU NEGÓCIO" em Anybody, `aria-hidden` (a informação está na lista). Corpo fixo: desktop `font-size: calc(100cqi / 11)` (124px em 1376px de largura útil); mobile em duas linhas (SEU / NEGÓCIO), `font-size: calc(100cqi / 7.3)` (49px em 358px). Caixa com altura fixa (1 ou 2 linhas de 0,74em), sem CLS. Larguras medidas (em em, frase inteira): 0,897 / 1,509 / 3,332 / 4,231 / 10,835; NEGÓCIO: 0,586 / 1,012 / 2,247 / 2,874 / 7,211.
- **Estados (wght/wdth):** 1 Conversa 100/50, contorno de 1,5px preto e preenchimento transparente; 2 Mapa 300/50, contorno, guias SVG em Vermelho Acrílico (linha de base, altura de versal, três colunas) desenhadas por `stroke-dashoffset` em 400ms `--ease-corte`, stagger 40ms; 3 Desenho 560/62, preenchimento Grafite Fio e grade de 12 colunas (faixas alternadas em preto a 6%) entrando por opacidade em 180ms; 4 Construção 850/62, guias e grade saem em 200ms, palavra preta sólida; 5 No ar 900/150, corte de 16° na palavra com aresta branca de 2px e placa vermelha "No ar" entrando por clip-path ao longo do corte em 240ms.
- **Interpolação:** o valor visual e ∈ [1, 5] é contínuo; com `i = floor(e)` e `t = e − i`, wght e wdth interpolam linearmente entre os estados i e i+1. Cores e camadas seguem a etapa arredondada, com transição CSS de 160ms. Os estados parados ficam sempre nos extremos de largura (50, 62 ou 150).
- **Arraste:** em `pointerdown` no range, o código lê `pointermove` (com captura) e calcula e a partir da posição do ponteiro no trilho; o valor nativo do range continua andando em passos inteiros (é o que o leitor de tela anuncia). Em `pointerup`, e encaixa no inteiro mais próximo com `encaixe` (spring de 0,3s, bounce 0).
- **Teclado:** setas mudam uma etapa (nativo), Home e End vão às pontas (nativo); a cada `input`, e anima até o novo inteiro em 420ms `--ease-corte`.
- **Botões de etapa:** definem o valor do range, disparam `input` e animam como o teclado.
- **Lista sempre visível:** `<ol class="etapas">` com as 5 etapas, cada uma com `<h3>`, uma mini-palavra "SEU NEGÓCIO" a 28px nos eixos da etapa (`aria-hidden`) e os três textos. A etapa ativa ganha borda superior de 4px em Vermelho Acrílico e texto preto; as outras ficam em Grafite Parede (8,79:1). Nada fica oculto.
- **Dica de primeira entrada:** na primeira vez que o trilho entra em vista (`inView`, amount 0,6), o polegar vai de 1 a 1,18 e volta em 700ms. Uma vez só; não acontece com reduced motion nem se o visitante já interagiu.
- **Reverso:** arrastar para trás devolve peso e largura de forma contínua; as guias saem com `stroke-dashoffset` inverso em 200ms.
- **Toque:** polegar de 48px, trilho em largura total, `touch-action: manipulation` no range e `pan-y` no restante da seção.
- **Mobile:** palavra em duas linhas; acima do trilho, o nome da etapa atual em Anybody 62/800 a 24px ("Etapa 3 de 5: Desenho"); botões 1–5 de 48×48px; lista completa empilhada abaixo.
- **Reduced motion:** troca de etapa sem tween (peso e largura saltam), guias aparecem prontas, sem dica.
- **Sem JS:** sem trilho nem palavra grande; a lista com as cinco mini-palavras mostra a progressão.
- **Motores:** `processo.js` é o único escritor de `--w` e `--s` (em `frame.render`); Motion `animate` para números (e), guias e placa; CSS para cores.

### 5.4 Revelação única: a Porta (Contato)

- **Estrutura:** `.porta__cima` (metades de cima do letreiro WUNDERHUB, Anybody Letreiro 50/900, `aria-hidden`), `.porta__miolo` (H2, texto, WhatsApp, e-mail, copiar), `.porta__baixo` (metades de baixo). Cada folha é um painel preto que se estende para longe da abertura (a de cima para cima, a de baixo para baixo); a seção tem `overflow: clip`. O letreiro da Porta usa o mesmo corpo do hero no desktop e uma linha de `100cqi / 3.5756` no mobile (cerca de 100px).
- **Estado inicial (com `.js` e sem reduced motion):** as folhas transladadas na vertical até se encontrarem no meio do miolo, formando o nome inteiro com a fenda de 6px; o miolo fica coberto pelos painéis pretos.
- **Gatilho:** `inView(porta__miolo, abrir, { amount: 0.5 })` ou `focusin` dentro do miolo (Tab chegando ao botão de WhatsApp abre a porta antes de o foco ficar escondido).
- **Abertura:** fenda 6px → 14px em 120ms (`--ease-resposta`), depois as folhas voltam à posição de layout em 720ms (`--ease-corte`): a de cima sobe e a de baixo desce, puramente na vertical. Total 840ms. Só transforms.
- **Reverso:** não fecha. É uma revelação única por visita (rolar para cima não fecha).
- **Reduced motion, sem JS, teto estourado:** porta aberta desde o início.
- **Barra de WhatsApp no mobile:** aparece quando `#trabalhos` entra no topo da tela (fim do palco) com translateY 100% → 0 em 240ms `--ease-corte`; some (200ms `--ease-saida`) quando o miolo da Porta fica visível; respeita `env(safe-area-inset-bottom)`; reduced motion alterna sem animação.

---

## 6. Especificação das interações

| Interação | Gatilho | Duração | Easing | Stagger | Distância | Profundidade |
| --- | --- | --- | --- | --- | --- | --- |
| Hover e foco de links | hover, `:focus-visible` | 120ms | `--ease-resposta` | | sublinhado 1px → 2px; cor Prata → Prata Luz | |
| Placa pressionada | `:active` | 120ms | `--ease-resposta` | | translate 2px na perpendicular | |
| Corte na carga | fonte pronta | 520ms varredura + 240ms descida (total ≤ 940ms) | `--ease-corte` | 90ms por vão | 6px | |
| M1 palco | rolagem | ligado a p (linear) | linear por faixa de p | | 22svh / 6svh (mobile 7 / 2 por andar) | véu 0,75 → 0, escala 1,06 → 1, x ±12px |
| Placas da fachada, entrada | p ≥ 0,85 | 240ms | `--ease-corte` | 90ms | clip-path ao longo do corte | |
| Placas da fachada, saída | p < 0,85 | 200ms | `--ease-saida` | | | |
| M2 painel abrir | botão | 480ms | `--ease-corte` | | 0fr → 1fr | |
| M2 metades do nome | botão | 240ms | `--ease-corte` | | 8px cima, +4px baixo | |
| M2 persianas | botão | 520ms | `--ease-corte` | 60ms | altura do quadro na perpendicular | imagem 1,04 → 1 |
| M2 marcadores A/B/C | botão | 160ms, atraso 320ms | `--ease-resposta` | 60ms | y 8px | |
| M2 textos | botão | 180ms, atraso 200ms | `--ease-resposta` | | opacidade | |
| M2 fechar | botão, Escape, outra linha | 240ms painel, 200ms persianas | `--ease-saida` | | | |
| Testar aqui, abrir | botão | 280ms | `--ease-corte` | | y 24px, opacidade | |
| Testar aqui, fechar | Fechar, Escape | 200ms | `--ease-saida` | | y 24px, opacidade | |
| Troca de largura no Testar aqui | rádio | 240ms | `--ease-corte` | | largura do iframe | escala informada no rótulo |
| M3 teclado e botões | setas, botões | 420ms | `--ease-corte` | | eixos de fonte | |
| M3 soltar o polegar | `pointerup` | spring 0,3s, bounce 0 | spring | | até a etapa inteira | |
| M3 guias | entrar em Mapa | 400ms | `--ease-corte` | 40ms | `stroke-dashoffset` | |
| M3 grade | entrar em Desenho | 180ms | `--ease-resposta` | | opacidade | |
| M3 placa No ar | entrar em No ar | 240ms | `--ease-corte` | | clip-path ao longo do corte | |
| M3 dica de primeira entrada | primeira vez em vista | 700ms | `--ease-corte` | | e 1 → 1,18 → 1 | |
| Porta | miolo 50% visível ou `focusin` | 120ms + 720ms | `--ease-resposta`, depois `--ease-corte` | | metade da altura do miolo, vertical | |
| Menu mobile, abrir | botão Menu | 280ms | `--ease-corte` | | y −24px → 0, opacidade | |
| Menu mobile, fechar | Fechar, Escape, link | 200ms | `--ease-saida` | | y 0 → −24px | |
| Barra de WhatsApp | fim do palco / Porta visível | 240ms entra, 200ms sai | `--ease-corte` / `--ease-saida` | | y 100% | |
| Copiar e-mail | botão | troca de texto 160ms (crossfade), volta após 2s | `--ease-resposta` | | | |
| Configurador | mudança de campo | prévia atualiza sem animação; resumo `aria-live` com 500ms de espera | | | | |
| Filme | botão Assistir | troca do poster pelo vídeo, sem animação | | | | |

Nenhuma seção entra com fade ou slide. Nada depende só de hover.

---

## 7. Conceitos demonstrativos

Três marcas fictícias novas, cada uma com estrutura, tipografia, paleta e interação próprias. Checagem de colisão feita para este documento (busca web em 18/10/2026): "Côdea" como padaria, "Junco Fisioterapia" e "Louça Torta" não retornaram negócios com esses nomes. "Miolo Alto" foi descartado porque existem padarias "Miolo" em São Paulo. Refaça a busca antes de publicar.

**Comum a todas as demos:**

- Faixa no topo, antes de tudo, em preto com texto Prata Luz (18,38:1): "Conceito da WunderHub. [Marca] é uma marca fictícia." e o link "Voltar ao portfólio" (`../../#conceito-<slug>`, relativo, funciona em subdiretório). Repetida no rodapé. Componente compartilhado em `src/conceitos/comum/selo.{css,js}`.
- Nenhuma demo envia dados, abre o WhatsApp de um número fictício ou processa pagamento. Toda ação que seria de backend mostra o resultado na tela e diz que é demonstração.
- Elementos ligados às decisões A/B/C levam `data-decisao="A|B|C"`; o script de capturas grava a posição deles para os marcadores da vitrine.
- Fontes autohospedadas (OFL), imagens WebP com `width`/`height`, `srcset`, `loading="lazy"` abaixo da dobra e `fetchpriority="high"` só na imagem principal do topo.
- Foco visível próprio de cada marca, reduced motion respeitado, alvos ≥ 44px (48px nos controles principais).

### 7.1 Côdea, padaria de bairro (landing page de uma página)

- **Objetivo:** mostrar o que saiu do forno hoje e transformar a visita em encomenda para retirar.
- **Identidade:** amarelo de gema dominante em faixas largas, marrom de torra no texto, branco de farinha nas listas. Forma arredondada e amigável (chips em pílula, raio 12px nas imagens), oposta à linguagem angular da WunderHub.
  - Cores: Gema `#F5B82E`, Torra `#2B1608`, Farinha `#FFFFFF`, Casca `#8C4513`, Fermento `#FBE7B5`.
  - Contrastes: Torra/Gema 9,65; Torra/Farinha 17,20; Casca/Farinha 7,06; Torra/Fermento 14,09; Casca/Fermento 5,78; Casca/Gema 3,96 (só texto ≥24px ou não-texto).
  - Tipografia: Bricolage Grotesque, `@fontsource-variable/bricolage-grotesque@5.3.0`, arquivo `bricolage-grotesque-latin-opsz-normal.woff2` (76.888 B; wght 200–800 e opsz 12–96). Títulos em opsz 96, wght 800; corpo em opsz 14, wght 400; preços em wght 700 com `font-variant-numeric: tabular-nums`.
- **Estrutura (uma coluna no celular; no desktop, hero em 2 colunas e cardápio em lista larga):**
  1. **Barra de estado** (sticky, Gema): calculada pelo relógio do navegador com o horário fictício (seg a sáb 6h30–19h; dom 7h–13h). Textos: "Aberto agora. Fecha às 19h." / "Fechado agora. Abre amanhã às 6h30." / "Fechado agora. Abre segunda às 6h30." Link "Como chegar". `data-decisao="A"`.
  2. **Topo:** H1 "Pão de fermentação natural, saindo do forno às 7h e às 16h." Texto: "Somos uma padaria de bairro na Rua das Paineiras, 214. Encomende até as 18h e retire no dia seguinte." Botões: "Montar encomenda" (vai ao cardápio) e "Ver horários". Linha: "Segunda a sábado, das 6h30 às 19h. Domingo, das 7h às 13h." Imagem `codea-hero` (4:5).
  3. **Cardápio do dia** (`data-decisao="B"`): H2 "Saiu do forno hoje". Texto: "Os preços já estão na lista. Escolha o que quer levar e a gente separa." Filtros em pílula (`aria-pressed`): Tudo, Pães, Doces, Salgados, Sem lactose. Contagem viva: "8 itens" (`role="status"`). Lista (não cards) com foto 1:1 de 96px, nome, descrição, preço e botão "Adicionar" que vira contador (−, quantidade, +; nomes acessíveis "Diminuir pão de queijo", "Aumentar pão de queijo"):
     - Pão de fermentação natural, 800 g. "Casca grossa e miolo úmido. Fermentação de 24 horas." R$ 28,00. Pães, Sem lactose.
     - Baguete de fermentação natural. "Crocante por fora, cheia de alvéolos por dentro." R$ 14,00. Pães, Sem lactose.
     - Pão de centeio com sementes, 600 g. "Centeio, girassol e linhaça. Dura a semana inteira." R$ 26,00. Pães, Sem lactose.
     - Pão de queijo, 6 unidades. "Polvilho azedo e queijo meia cura." R$ 15,00. Salgados.
     - Focaccia de tomate e alecrim, fatia. "Azeite, tomate assado e flor de sal." R$ 12,00. Salgados, Sem lactose.
     - Bolo de fubá com goiabada, fatia. "Fubá cremoso com pedaços de goiabada cascão." R$ 9,00. Doces.
     - Rosca de laranja. "Massa macia, calda de laranja e raspas por cima." R$ 22,00. Doces.
     - Cookie de chocolate meio amargo. "Borda crocante e centro macio." R$ 8,00. Doces.
  4. **Encomenda** (`data-decisao="C"`): no celular, barra fixa inferior "2 itens, R$ 42,00" com botão "Ver encomenda"; no desktop, coluna fixa à direita. H2 "Sua encomenda". Vazio: "Sua encomenda está vazia. Escolha itens no cardápio do dia." Campos: "Quando você vai retirar?" (Amanhã / Depois de amanhã, com a data calculada, ex.: "Amanhã, sábado 19/10"); "Em que horário?" (7h às 9h; 9h às 12h; 16h às 18h; no domingo só as duas primeiras); "Seu nome" (obrigatório; erro: "Escreva seu nome para a padaria saber de quem é a encomenda."). Total: "Total: R$ 42,00. Pagamento na retirada." Botão "Gerar mensagem de encomenda". Resultado em `role="status"`: a mensagem pronta (ex.: "Olá, Côdea! Quero encomendar para retirar amanhã, sábado 19/10, entre 7h e 9h: 1 pão de fermentação natural, 800 g; 2 baguetes. Total: R$ 56,00. Nome: Ana.") com a nota "Demonstração: num site real, este botão abriria o WhatsApp da padaria com esta mensagem. Aqui nada é enviado." e o botão "Copiar mensagem" ("Mensagem copiada").
  5. **Fornadas do dia** (sequência real, numerada por horário): 6h30 "Portas abertas, com o pão da madrugada."; 7h "Pães de fermentação natural e baguetes."; 10h "Pão de queijo e focaccia."; 16h "Segunda fornada de pães e a rosca de laranja."; 19h "Portas fechadas." Imagem `codea-forno` (3:2).
  6. **Como chegar:** H2 "Como chegar". "Rua das Paineiras, 214, na esquina com a Rua do Moinho." Mapa ilustrado em SVG (ruas e um marcador), `alt`: "Mapa ilustrativo: a padaria fica na esquina da Rua das Paineiras com a Rua do Moinho." Tabela de horários.
  7. **Rodapé:** "Côdea, padaria de bairro. Marca fictícia criada pela WunderHub como demonstração."
- **Interações que precisam funcionar:** filtros (com contagem e estado vazio "Nenhum item nesse filtro hoje."), contadores, total, aberto/fechado pelo relógio, cálculo de datas de retirada, validação do nome, geração e cópia da mensagem. Estado da encomenda em memória (não persiste).

### 7.2 Junco Fisioterapia, clínica (site institucional com quatro páginas)

- **Objetivo:** explicar os tratamentos com calma e levar a pessoa a pedir a primeira avaliação.
- **Identidade:** clara, fria e arejada; muito espaço em branco; serifa editorial nos títulos; cantos levemente arredondados (6px nos botões, 16px nas imagens).
  - Cores: Névoa `#EEF3F0` (fundo), Ardósia `#18262A` (texto), Musgo `#2E5E4E` (ações), Broto `#C9DFA8` (destaques), Papel `#FFFFFF`, Cinza Junco `#56635F` (texto auxiliar).
  - Contrastes: Ardósia/Névoa 13,87; Musgo/Névoa 6,62; Papel/Musgo 7,43; Ardósia/Broto 10,82; Musgo/Broto 5,17; Cinza Junco/Névoa 5,59.
  - Tipografia: Newsreader, `@fontsource-variable/newsreader@5.3.0`, `newsreader-latin-wght-normal.woff2` (58.084 B; wght 200–800) para títulos em 500; Public Sans, `@fontsource-variable/public-sans@5.3.0`, `public-sans-latin-wght-normal.woff2` (26.832 B) para corpo 17px/1,6 e interface (400 e 600).
- **Navegação comum:** wordmark "Junco Fisioterapia"; links Início, Tratamentos, Primeira consulta; botão "Pedir avaliação". No celular, botão "Menu" que abre uma lista (disclosure com `aria-expanded`, Escape fecha e devolve o foco). Rodapé: "Junco Fisioterapia. Marca fictícia criada pela WunderHub como demonstração. Os textos deste site não são orientação de saúde." e "Rua dos Juncos, 88, sala 12. Segunda a sexta, das 7h às 20h. Sábado, das 8h às 12h."
- **Início (`/conceitos/junco/`):**
  - H1 "Fisioterapia com tempo para explicar cada passo." Texto: "Atendimento individual, em sessões de 50 minutos, para dor, recuperação depois de cirurgia e volta ao esporte." Botões: "Pedir uma avaliação" e "Ver tratamentos". Imagem `junco-sala` (3:2).
  - H2 "O que te trouxe até aqui?" (`data-decisao="A"`): quatro linhas-link grandes: "Dor nas costas, no pescoço ou nos ombros" (`tratamentos/?para=dor`); "Recuperação depois de uma cirurgia" (`?para=cirurgia`); "Voltar a treinar ou a correr" (`?para=esporte`); "Gestação e pós-parto" (`?para=gestacao`).
  - H2 "Como é o atendimento": "Uma pessoa por vez. A sala é sua durante a sessão inteira." "Exercícios para casa explicados na sessão e enviados por escrito." "Reavaliação a cada oito sessões, para ajustar o plano." Imagem `junco-elasticos` (4:5).
  - H2 "Onde estamos": endereço e horários; botão "Pedir uma avaliação".
- **Tratamentos (`/conceitos/junco/tratamentos/`):**
  - H1 "Tratamentos". Texto: "Escolha o que você está sentindo para ver os tratamentos indicados. O plano de cada pessoa é definido na avaliação."
  - Filtros (`aria-pressed`, refletidos em `?para=` com `replaceState`): Todos, Dor, Depois de cirurgia, Esporte, Gestação e pós-parto. Contagem viva: "5 tratamentos".
  - Acordeão (botões com `aria-expanded`, um ou mais abertos), cada item com "Para quem é", "Como é a sessão", "Quanto tempo" e o link "Pedir avaliação para este tratamento" (`../agendar/?tratamento=<slug>`):
    - Fisioterapia ortopédica (dor): "Para dores nas costas, no pescoço, nos ombros e nos joelhos." / "Avaliação do movimento, terapia manual e exercícios guiados." / "Sessões de 50 minutos. O número de sessões é combinado na avaliação."
    - Reabilitação depois de cirurgia (cirurgia): "Para quem operou joelho, ombro, quadril ou coluna e precisa recuperar força e movimento." / "Seguimos as orientações do seu médico e avançamos por etapas." / "Sessões de 50 minutos, com reavaliação a cada oito."
    - Pilates clínico (dor, gestação): "Para fortalecer o corpo e prevenir a volta da dor." / "Sessões individuais com aparelhos e exercícios no solo." / "Sessões de 50 minutos, uma ou duas vezes por semana."
    - Fisioterapia esportiva (esporte, cirurgia): "Para lesões de treino e para voltar ao esporte com segurança." / "Testes de força e de movimento, treino progressivo e orientação de carga." / "Sessões de 50 minutos. O plano acompanha o seu calendário de treinos."
    - Fisioterapia na gestação e no pós-parto (gestação, dor): "Para dores comuns da gestação e para a recuperação depois do parto." / "Exercícios adaptados a cada fase e orientação para o dia a dia." / "Sessões de 50 minutos, com liberação do seu obstetra."
  - Estado vazio do filtro: "Nenhum tratamento com esse filtro. Escolha Todos para ver a lista completa."
- **Primeira consulta (`/conceitos/junco/primeira-consulta/`)** (`data-decisao="B"`):
  - H1 "Como é a primeira consulta". Texto: "A primeira consulta dura 60 minutos. Ela serve para entender o que você sente e montar um plano com você."
  - Passos (sequência real, `<ol>`): 1 "Conversa": "Você conta o que sente, desde quando e o que piora ou melhora. Se tiver exames, a gente olha junto." 2 "Avaliação física": "Testes de movimento, força e postura, sem pressa e explicando cada um." 3 "Plano de tratamento": "Você sai sabendo quantas sessões vamos fazer no começo e o que esperar de cada fase." 4 "Primeiros exercícios": "Você já aprende exercícios simples para fazer em casa."
  - H2 "O que levar": "Exames recentes, se tiver." "Pedido médico, se tiver. Não é obrigatório para começar." "Roupa confortável, que deixe braços e pernas livres."
  - H2 "Perguntas frequentes" (acordeão): "Preciso de pedido médico?" / "Não para a avaliação. Se você vai pedir reembolso ao plano de saúde, o seu plano pode exigir." · "Vocês atendem por convênio?" / "O atendimento é particular, com recibo para você pedir reembolso ao seu plano." · "Quanto tempo dura o tratamento?" / "Depende do caso. Na avaliação você recebe uma previsão, e a gente revê a cada oito sessões." · "Posso remarcar?" / "Pode, com até 24 horas de antecedência."
  - Imagem `junco-pilates` (3:2). Botão "Pedir uma avaliação".
- **Agendar (`/conceitos/junco/agendar/`)** (`data-decisao="C"`):
  - H1 "Pedir uma avaliação". Texto: "Escolha o tipo de atendimento, o dia e o horário. Você revisa tudo antes de enviar." Indicador "Passo 1 de 4" (`<ol>` de passos com `aria-current="step"`). Imagem `junco-janela` (4:5) só no desktop.
  - Passo 1, legenda "Tipo de atendimento": "Avaliação inicial, 60 minutos" (padrão); "Pilates clínico, aula experimental de 50 minutos"; "Retorno, 50 minutos". Se vier `?tratamento=`, mostra "Tratamento de interesse: Fisioterapia esportiva".
  - Passo 2, legenda "Dia": próximos 10 dias de segunda a sábado a partir de hoje, como rádios com rótulo "seg 21/10".
  - Passo 3, legenda "Horário": 7h, 8h, 9h, 10h, 14h, 15h, 16h, 17h, 18h, 19h (sábado: 8h a 11h). Alguns indisponíveis, escolhidos de forma determinística pela data (hash simples), com rótulo "indisponível" e `disabled`. Nota: "Horários de demonstração."
  - Passo 4, legenda "Seus dados": Nome (obrigatório); Telefone com DDD (obrigatório, 10 ou 11 dígitos; erro: "Digite o telefone com DDD, só números. Exemplo: 11912345678."); E-mail (opcional; erro: "Confira o e-mail. Exemplo: nome@email.com."); "Quer contar algo antes da consulta?" (opcional).
  - Revisão: lista de definições com botão "Editar" por item; botão "Enviar pedido".
  - Depois de "Enviar pedido", em `role="status"`: "Pedido de demonstração concluído só nesta tela. Nenhum dado foi enviado. Num site real, a clínica receberia este pedido e confirmaria o horário por mensagem." e o botão "Fazer outro pedido".
  - Navegação: "Continuar" e "Voltar"; a cada passo o foco vai para a legenda do passo (`tabindex="-1"`); erros ligados por `aria-describedby` e resumo de erros no topo do passo.
- **Interações que precisam funcionar:** menu mobile, filtros com URL, acordeões, formulário em 4 passos com validação, datas calculadas, horários indisponíveis determinísticos, revisão e confirmação declarada.

### 7.3 Louça Torta, cerâmica feita à mão (loja virtual)

- **Objetivo:** mostrar cada peça de perto e deixar a compra simples.
- **Identidade:** galeria de objetos sobre fundo frio quase branco, azul cobalto como cor de ação, serifa robusta nos nomes das peças. Grade assimétrica, cantos de 2px, swatches circulares.
  - Cores: Esmalte `#F3F4EF` (fundo), Tinta `#15171C` (texto), Cobalto `#1F3E9C` (ações), Celadon `#9DBFAE` (destaques), Giz `#FFFFFF`, Argila `#5B5F66` (texto auxiliar).
  - Contrastes: Tinta/Esmalte 16,22; Cobalto/Esmalte 8,53; Giz/Cobalto 9,43; Tinta/Celadon 8,96; Argila/Esmalte 5,80.
  - Tipografia: Young Serif, `@fontsource/young-serif@5.3.0`, `young-serif-latin-400-normal.woff2` (26.992 B) para títulos e nomes; Instrument Sans, `@fontsource-variable/instrument-sans@5.3.0`, `instrument-sans-latin-wght-normal.woff2` (30.092 B; wght 400–700) para interface e corpo.
- **Loja (`/conceitos/louca-torta/`):**
  - Header: wordmark "Louça Torta"; links Peças, Como cuidar, Ateliê; botão "Sacola (0)" com contagem viva.
  - Topo: H1 "Louça feita à mão, um pouco torta de propósito." Texto: "Canecas, tigelas e pratos de cerâmica de alta temperatura, esmaltados em pequenas fornadas. Nenhuma peça sai igual à outra." Botão "Ver as peças". Imagem `lt-hero` (16:9).
  - H2 "Peças" (`data-decisao="A"` nos filtros). Filtros: "Tipo" (checkboxes: Canecas e xícaras, Tigelas, Pratos, Vasos, Travessas e potes); "Esmalte" (checkboxes com swatch: Cobalto, Celadon, Branco giz, Preto fosco); "Só pronta entrega" (switch com `role="switch"`). "Ordenar por" (select: Novidades, Menor preço, Maior preço). Contagem: "8 peças". Botão "Limpar filtros". No celular, os filtros ficam num `<dialog>` aberto pelo botão "Filtrar (2)". Vazio: "Nenhuma peça com esses filtros. Tire um filtro ou limpe todos."
  - Grade: primeira peça ocupa 2×2; as outras 1×1. Cada peça: foto 1:1, nome, preço, esmaltes disponíveis (bolinhas) e "Pronta entrega" quando houver.
  - Produtos (dados em `src/conceitos/louca-torta/dados.js`):
    - `caneca-torta`, Caneca Torta, R$ 89,00, Canecas e xícaras. Esmaltes: cobalto (pronta entrega), celadon (sob encomenda), branco giz (pronta entrega). "350 ml. A borda ondulada é feita à mão, uma por uma."
    - `tigela-funda`, Tigela Funda, R$ 120,00, Tigelas. Celadon (pronta entrega), preto fosco (sob encomenda). "16 cm de diâmetro, para caldos e saladas."
    - `prato-raso`, Prato Raso 26 cm, R$ 98,00, Pratos. Cobalto (pronta entrega). "Borda irregular e fundo liso, para o dia a dia."
    - `prato-sobremesa`, Prato de Sobremesa 19 cm, R$ 72,00, Pratos. Branco giz (pronta entrega). "Do tamanho certo para bolo e fruta."
    - `vaso-alto`, Vaso Alto, R$ 160,00, Vasos. Branco giz (sob encomenda). "28 cm de altura, com as marcas do torno aparentes."
    - `travessa-oval`, Travessa Oval, R$ 180,00, Travessas e potes. Celadon (pronta entrega). "32 cm. Vai ao forno."
    - `xicara-pires`, Xícara com Pires, R$ 95,00, Canecas e xícaras. Preto fosco (pronta entrega). "150 ml, para café coado."
    - `pote-tampa`, Pote com Tampa, R$ 110,00, Travessas e potes. Cobalto (sob encomenda). "Para açúcar, sal ou o que você quiser guardar."
  - H2 "Como cuidar": "Pode ir à lava-louças e ao micro-ondas." "Evite choque térmico: não leve do congelador direto ao forno." "Pequenas variações de cor e de forma fazem parte de cada peça."
  - H2 "Do ateliê" com imagem `lt-atelie` (3:2): "Cada fornada tem poucas peças. Torneamos, esperamos secar, queimamos duas vezes e esmaltamos à mão. Por isso algumas peças são feitas sob encomenda."
  - Rodapé: "Louça Torta. Marca fictícia criada pela WunderHub como demonstração. Nenhum pagamento é processado nesta loja."
- **Produto (`/conceitos/louca-torta/produto/?p=caneca-torta&esmalte=celadon`)** (`data-decisao="B"` no seletor de esmalte):
  - Trilha: "Peças / Canecas e xícaras / Caneca Torta". H1 com o nome, preço.
  - Imagem principal da variante (troca com crossfade de 200ms; instantânea com reduced motion). Seletor "Esmalte" (rádios com swatch e nome visível); a URL acompanha por `replaceState`.
  - Disponibilidade por variante: "Pronta entrega. Enviamos em até 2 dias úteis." ou "Sob encomenda. Fica pronta em até 20 dias."
  - Quantidade (1 a 10). Botão "Adicionar à sacola": abre a sacola e anuncia "Caneca Torta, celadon, adicionada à sacola."
  - Acordeão: "Medidas" ("Altura de 9 cm, boca de 8,5 cm, 350 ml."), "Cuidados" (mesmo texto da loja), "Sobre o esmalte" (ex.: celadon: "Esmalte verde-claro e translúcido. Onde ele acumula, a cor fica mais intensa.").
  - H2 "Combina com": três produtos.
  - Produto inexistente em `?p=`: "Não encontramos essa peça. Veja todas as peças." com link.
- **Sacola** (`data-decisao="C"`), `<dialog>` lateral: H2 "Sua sacola"; itens com foto, nome, esmalte, contador e "Remover"; "Subtotal: R$ 178,00"; "Frete e pagamento seriam calculados na finalização."; botões "Finalizar compra" e "Continuar olhando". Vazia: "Sua sacola está vazia." com link "Ver as peças". Guardada em `localStorage` (`louca-torta:sacola`, sempre em try/catch; sem storage, fica em memória e a sacola mostra "A sacola não fica salva neste navegador.").
- **Finalizar compra:** `<dialog>` com H2 "Esta loja é uma demonstração" e o texto "Nenhum pagamento é processado e nenhum pedido é salvo. A sacola fica guardada só neste navegador." Botões "Esvaziar sacola" e "Voltar para a loja".
- **Interações que precisam funcionar:** filtros combinados com contagem e vazio, ordenação, filtros em dialog no celular, troca de variante com foto e URL, quantidade, sacola com subtotal e persistência local, finalização declarada.

### 7.4 Imagens dos conceitos (Magnific)

Modelo: Seedream 5 Pro, 2k (parâmetro `mode` no `images_generate`; rodar `simulate_cost` antes de cada lote). Variantes de esmalte usam a imagem base como referência para manter a forma. Todos os prompts terminam com: "No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark." Exportar WebP em 3 larguras (1600/800/400 para 16:9, 3:2 e 4:5; 1200/600/300 para 1:1), guardar os IDs das criações em `docs/experiment.md` e nunca depender do serviço em runtime.

| Arquivo | Proporção | Prompt |
| --- | --- | --- |
| `codea-hero` | 4:5 | Round sourdough loaf with a deep golden-brown crust and a flour-dusted scored ear, one slice cut to show an open, airy crumb, on a worn light-wood bakery counter, early morning side light, warm egg-yolk yellow wall softly out of focus behind, editorial food photography. |
| `codea-pao-natural` | 1:1 | A single round sourdough loaf, 800 g, dark crisp crust with flour, three-quarter view, on pale kraft paper over a light wood table, soft window light from the left, warm yellow background. |
| `codea-baguete` | 1:1 | Two sourdough baguettes crossed, blistered golden crust, on pale kraft paper over light wood, soft window light, warm yellow background. |
| `codea-centeio` | 1:1 | Dark rye loaf with sunflower and flax seeds, two slices cut, on pale kraft paper over light wood, soft window light, warm yellow background. |
| `codea-pao-de-queijo` | 1:1 | Six small Brazilian cheese breads (pão de queijo), golden and cracked, in a small white enamel tray, on light wood, soft window light, warm yellow background. |
| `codea-focaccia` | 1:1 | Square slice of focaccia with roasted cherry tomatoes, rosemary and flaky salt, glossy olive oil, on pale kraft paper, soft window light, warm yellow background. |
| `codea-bolo-fuba` | 1:1 | Slice of Brazilian cornmeal cake with pieces of guava paste, crumbly texture, on a simple white plate, on light wood, soft window light, warm yellow background. |
| `codea-rosca` | 1:1 | Braided sweet bread ring glazed with orange syrup and orange zest, on pale kraft paper, soft window light, warm yellow background. |
| `codea-cookie` | 1:1 | Two dark chocolate chunk cookies, one broken in half, crisp edges, soft center, on pale kraft paper, soft window light, warm yellow background. |
| `codea-forno` | 3:2 | Open steel deck oven in a small bakery with a tray of freshly baked loaves inside, warm glow, flour dust on the steel edge, wooden peel leaning nearby, empty room. |
| `junco-sala` | 3:2 | Bright, calm physiotherapy treatment room, padded treatment table with a white sheet, light wood floor, large window with sheer curtain, potted plant, pale sage-green wall, minimal, soft daylight, empty room, no posters. |
| `junco-elasticos` | 4:5 | Resistance bands in muted green and grey, a small exercise ball and a folded white towel arranged on a light wood floor, top-down, soft daylight, minimal. |
| `junco-pilates` | 3:2 | Pilates reformer machine in a quiet studio with light wood floor and white walls, morning light, plant in the corner, empty room. |
| `junco-janela` | 4:5 | Tall green reeds in a matte ceramic planter beside a window, soft backlight, sage green and white tones, calm, minimal still life. |
| `lt-hero` | 16:9 | Table set with handmade stoneware: cobalt blue glazed plates, celadon green bowls and a slightly irregular chalk-white mug, on a pale grey linen tablecloth, three-quarter overhead view, soft cool daylight, editorial still life, no food packaging. |
| `lt-caneca-cobalto` | 1:1 | Handmade wheel-thrown stoneware mug with a wavy, slightly crooked rim and a thick handle, glossy cobalt blue glaze breaking to brown at the edges, centered on a seamless pale grey-green paper background, soft diffused daylight from the left, subtle shadow, product photography. |
| `lt-caneca-celadon` | 1:1 | Same mug as the reference image, same angle and light, translucent pale celadon green glaze pooling darker in the throwing lines. (referência: `lt-caneca-cobalto`) |
| `lt-caneca-giz` | 1:1 | Same mug as the reference image, same angle and light, matte chalk-white glaze with small dark speckles. (referência: `lt-caneca-cobalto`) |
| `lt-tigela-celadon` | 1:1 | Deep handmade stoneware bowl, irregular rim, translucent celadon green glaze, centered on a seamless pale grey-green paper background, soft daylight from the left, product photography. |
| `lt-tigela-preto` | 1:1 | Same bowl as the reference image, same angle and light, matte black glaze. (referência: `lt-tigela-celadon`) |
| `lt-prato-raso-cobalto` | 1:1 | Handmade 26 cm stoneware dinner plate with an irregular rim, cobalt blue glaze, seen from 30 degrees above, seamless pale grey-green background, soft daylight. |
| `lt-prato-sobremesa-giz` | 1:1 | Handmade 19 cm dessert plate, chalk-white speckled matte glaze, seen from 30 degrees above, seamless pale grey-green background, soft daylight. |
| `lt-vaso-giz` | 1:1 | Tall cylindrical handmade vase, visible throwing rings, matte chalk-white glaze, centered on a seamless pale grey-green background, soft daylight. |
| `lt-travessa-celadon` | 1:1 | Oval handmade stoneware serving dish, 32 cm, celadon green glaze, seen from 30 degrees above, seamless pale grey-green background, soft daylight. |
| `lt-xicara-preto` | 1:1 | Small handmade coffee cup with saucer, matte black glaze, centered on a seamless pale grey-green background, soft daylight. |
| `lt-pote-cobalto` | 1:1 | Handmade lidded stoneware jar, cobalt blue glaze, centered on a seamless pale grey-green background, soft daylight. |
| `lt-atelie` | 3:2 | Pottery studio shelves with rows of bisque and freshly glazed bowls and mugs drying, potter's wheel softly out of focus, natural light, clay dust, empty studio. |

Total: 27 imagens (cerca de 2.700 créditos em Seedream 5 Pro 2k, conferir com `simulate_cost`).

---

## 8. Vitrine

- **Na home:** a seção Trabalhos é a vitrine (seção 5.2). Desktop: linhas de largura total; painel com captura desktop 960w (srcset 480/960/1440, `sizes="(min-width: 1024px) 58vw, 100vw"`) num quadro com chanfro, a captura de celular 390 (srcset 390/780) sobreposta no canto inferior direito, cobrindo 22% da largura do quadro, e os marcadores A/B/C nas posições gravadas pelo script de capturas. Mobile: só a captura de celular, com seus marcadores.
- **Dados:** `src/data/conceitos.js` (slug, nome, eixos, linha de tipo, objetivo, decisões, URLs relativas, nomes das capturas) e `src/generated/decisoes.json` (posições em % dos elementos `[data-decisao]` em 1440×900 e em 390×844).
- **Link direto:** "Abrir demonstração" sempre visível, nunca só no hover, com URL relativa (`conceitos/codea/`), funcionando sob qualquer base path.
- **Testar aqui** (só `pointer: fine` e largura ≥ 1024px): `<dialog aria-labelledby>` com `showModal()` (foco preso, fundo inert e Escape nativos).
  - Cabeçalho: H2 "Côdea em teste" (`tabindex="-1"`, recebe o foco ao abrir); grupo de rádios "Largura": Celular, 390 px · Tablet, 768 px · Computador, 1280 px (padrão: Computador); link "Abrir em página inteira"; botão "Fechar".
  - Corpo: `<iframe title="Demonstração de Côdea">` com `src` definido só ao abrir; largura igual ao preset; se o preset não couber, um wrapper aplica `transform: scale()` com origem no topo esquerdo e o rótulo informa "Escala 72%".
  - Fechar: botão, Escape (evento `cancel` com animação de saída) ou clique no fundo; o iframe volta a `about:blank`; o foco volta ao botão "Testar aqui" que abriu (chamado explicitamente além do comportamento nativo).
- **Filme:** fachada de vídeo (seção 9.5).

---

## 9. Showreel Hyperframes

### 9.1 Especificação

1920×1080, 30 fps, 18,0 s (540 quadros), sem áudio. Projeto Hyperframes em `showreel/` (scaffold `HYPERFRAMES_SKIP_SKILLS=1 npx -y hyperframes@0.8.171 init showreel --non-interactive --resolution landscape`). GSAP 3.14.2 vendorizado (`showreel/assets/vendor/gsap.min.js` e `CustomEase.min.js` do mesmo pacote npm), fontes locais (os mesmos woff2 da Anybody e da Archivo), texturas locais, capturas locais. Sem WebGL. Uma `gsap.timeline({ paused: true })` por composição, registrada em `window.__timelines[id]` no fim; só `fromTo`; `.clip { position: absolute; inset: 0 }`; sem animação de saída exceto na última cena. `CustomEase.create('corte', '0.2,0,0,1')` e `CustomEase.create('saida', '0.3,0,0.8,0.15')`.

Transição primária entre cenas: **corte de 16°**. A cena que entra é revelada por `clip-path: polygon(0 0, 1920px 0, 1920px calc(Y + 551px), 0 Y)` com Y de −551px a 1080px, em 0,5 s, ease `corte`, sobreposta 0,5 s à cena anterior; uma faixa de 3px em Prata Luz acompanha a borda (polígono de 4 pontos no mesmo Y).

### 9.2 Storyboard

| Cena | Tempo | Conteúdo | Movimento |
| --- | --- | --- | --- |
| 1. O corte | 0,00–3,20 | Fundo preto. Letreiro WUNDERHUB em aço escovado, Anybody Letreiro 50/900, 501px de corpo (1792px de largura), centrado; capturas dos conceitos atrás de cada vão | 0,20–0,92: faixa especular percorre o corte de cada vão (0,52 s, stagger 0,09, `corte`). 0,72–1,18: metades de baixo descem 6px. 1,40–2,90: janelas abrem (baixo 0 → 300px e cima 0 → 80px na perpendicular), peso 900 → 300 (`--wght` via `font-variation-settings`), véu 0,75 → 0, todos em 1,5 s `corte`. 2,70–2,94: placas "Côdea, padaria de bairro", "Junco, fisioterapia", "Louça Torta, cerâmica" entram por clip-path ao longo do corte, stagger 0,09 |
| 2. Côdea | 3,20–6,40 (entra por corte de 16° em 3,20) | Nome "Côdea" (150/850, 160px) sobre faixa preta; placa "Padaria de bairro. Landing page."; captura desktop num quadro chanfrado de 1280×800 à esquerda e captura de celular 300×650 sobreposta à direita | Quadro de escala 1,04 → 1 ao longo da cena (`none`). 4,30: dentro do quadro, a captura com o filtro "Doces" ativo e a barra de encomenda entra por corte de 16° de 0,4 s. 4,90/5,00/5,10: marcadores A, B, C (opacidade e y 8px, 0,16 s) |
| 3. Junco | 6,40–9,60 (corte de 16°) | Nome "Junco" (62/400); placa "Clínica de fisioterapia. Site institucional."; captura de página inteira 1440 × cerca de 3200px dentro do quadro; celular no passo 3 do agendamento | 6,90–9,30: a captura de página inteira rola dentro do quadro (`y` de 0 até −(altura − 800px), `power1.inOut`); celular sobe 24px e aparece (0,3 s) em 7,40 |
| 4. Louça Torta | 9,60–12,80 (corte de 16°) | Nome "Louça Torta" (125/250); placa "Cerâmica feita à mão. Loja virtual."; captura da página de produto com esmalte cobalto | 10,90: crossfade de 0,3 s para a captura com celadon (a troca de esmalte). 11,50: captura da sacola aberta entra pela direita (x 420px → 0, 0,5 s, `corte`) |
| 5. O projeto ganha peso | 12,80–15,60 (corte de 16°) | Chapa de prata escovada (mesmo CSS do site). "SEU NEGÓCIO" a 160px, preto; fila de rótulos Conversa, Mapa, Desenho, Construção, No ar com marcador vermelho | 12,95 Conversa (100/50, contorno). 13,40 Mapa (300/50) e guias vermelhas desenhando em 0,4 s. 13,90 Desenho (560/62) e grade. 14,40 Construção (850/62), sólida. 14,90 No ar (900/150), corte e placa "No ar" em 0,24 s. Cada troca de eixos dura 0,4 s (`corte`); o marcador desliza junto |
| 6. A porta | 15,60–18,00 (corte de 16°) | Preto. Letreiro WUNDERHUB em 900 com fenda de 6px; atrás, "Vamos conversar sobre o seu site" (Anybody 62/800, 72px, Prata Luz), "WhatsApp +55 (11) 95930-0903", "kaueribeiro12@gmail.com" (Archivo 500, 36px, Prata) e "WunderHub, Kauê Ribeiro" | 15,90: fenda 6 → 14px (0,12 s). 16,02–16,74: folhas abrem na vertical (−190px e +190px, `corte`). 16,30–16,60: textos sobem 8px e aparecem. Segura até 18,00 (cartão final, sem fade) |

### 9.3 Assets do showreel

- `showreel/assets/fonts/`: `anybody-latin-wdth-normal.woff2`, `archivo-latin-wght-normal.woff2` (copiados de `src/assets/fonts/`).
- `showreel/assets/textura/`: `grao-2400.webp`, `grao-chapa-2400.webp`.
- `showreel/assets/img/` (gerados por `npm run capturas`, nunca feitos à mão): `codea-desktop-1440.webp`, `codea-doces-desktop-1440.webp`, `codea-celular-780.webp`, `junco-pagina-1440.webp` (página inteira), `junco-agendar-celular-780.webp`, `louca-torta-produto-cobalto-1440.webp`, `louca-torta-produto-celadon-1440.webp`, `louca-torta-sacola-1440.webp`, `louca-torta-celular-780.webp`.
- `showreel/assets/vendor/`: `gsap.min.js`, `CustomEase.min.js` (gsap@3.14.2).

### 9.4 Render e verificação

```sh
cd showreel
npx -y hyperframes@0.8.171 lint
npx -y hyperframes@0.8.171 check
npx -y hyperframes@0.8.171 snapshot --at 0.5,2.9,4.9,8.0,11.6,14.9,17.5 --no-end --output renders/snaps
npx -y hyperframes@0.8.171 render --quality delivery --fps 30 --output renders/showreel-master.mp4
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate,nb_frames -of default=nw=1 renders/showreel-master.mp4   # 18.000000, 1920x1080, 30/1, 540
# versões para a web (sem áudio, faststart)
ffmpeg -y -i renders/showreel-master.mp4 -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart -an ../public/media/showreel-1080.mp4
ffmpeg -y -i renders/showreel-master.mp4 -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -an ../public/media/showreel-1080.webm
ffmpeg -y -i renders/showreel-master.mp4 -vf scale=1280:-2 -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -an ../public/media/showreel-720.mp4
# poster: quadro de 3,00 s (janelas abertas com as placas)
ffmpeg -y -ss 3.0 -i renders/showreel-master.mp4 -frames:v 1 -vf scale=1280:-2 -c:v libwebp -quality 72 ../public/media/showreel-poster-1280.webp
ffmpeg -y -ss 3.0 -i renders/showreel-master.mp4 -frames:v 1 -vf scale=640:-2 -c:v libwebp -quality 72 ../public/media/showreel-poster-640.webp
```

Metas de peso: 1080p MP4 ≤ 4 MB, 720p ≤ 2 MB, poster 1280 ≤ 70 KB. Revisar quadros no começo, meio e fim e conferir o movimento entre eles (snapshots acima). Se o render falhar, registrar o erro concreto em `docs/experiment.md` e não declarar o vídeo como concluído.

### 9.5 Integração no site

- Na seção Trabalhos (desktop: colunas 9–12 ao lado do H2; mobile: depois das três linhas).
- **Fachada de vídeo:** `<figure>` com `<button class="filme__abrir">` contendo `<img>` do poster (srcset 640/1280, `loading="lazy"`, `alt=""`) e o texto "Assistir ao filme"; `<figcaption>` "Filme da fachada, 18 segundos, sem som. Mostra o letreiro abrindo, as três demonstrações e o contato." Nenhum byte de vídeo é baixado antes do clique.
- **No clique:** o botão é trocado por `<video controls muted playsinline preload="auto" poster="…">` com `<source>` WebM e MP4 (1080 para largura ≥ 1024px sem `saveData`; 720 nos demais) e `play()` chamado em seguida; o foco vai para o vídeo. Controles nativos (play, pausa, tela cheia). Muted por padrão; sem faixa de áudio.
- **Pausa:** `inView` ao sair da tela, `visibilitychange` com a aba oculta e `pagehide`.
- **Falha:** `error` no vídeo devolve o poster com "Não foi possível carregar o filme. Tente de novo." e o botão volta.
- URLs montadas com `import.meta.env.BASE_URL + 'media/…'` (arquivos em `public/media/`).

---

## 10. Stack e estrutura

**Decisão.** Vite 8.3.4 em modo multipágina, HTML semântico e JavaScript sem framework, Motion 14.3.0 via npm e fontes autohospedadas. O site é quase todo conteúdo estático com poucos módulos de interação, então um framework de componentes só aumentaria o JS inicial e a manutenção; o Vite já está instalado no projeto, gera cada página da demo como HTML próprio (bom para GitHub Pages e para o voltar do navegador), resolve e versiona assets e fontes com hash, aceita `base` configurável por variável de ambiente e faz tree-shaking do Motion (o UMD inteiro tem 154 KB; o conjunto `animate, scroll, inView, spring, stagger, frame, MotionGlobalConfig` mediu cerca de 27 KB gz). O Motion cobre exatamente o que a direção pede (progresso de rolagem, inView, springs, sequências e um agendador de quadros para um único escritor) sem trazer GSAP para o site; o GSAP fica isolado no showreel, onde o Hyperframes exige. CDNs estão bloqueadas neste ambiente e não são usadas: tudo vem do npm e é empacotado.

**Dependências** (versões exatas):

- `dependencies`: `motion@14.3.0`.
- `devDependencies`: `vite@8.3.4`, `playwright@1.56.1` (usa os navegadores de `/opt/pw-browsers`, `PLAYWRIGHT_BROWSERS_PATH`), `@fontsource-variable/anybody@5.3.0`, `@fontsource-variable/archivo@5.3.0`, `@fontsource-variable/bricolage-grotesque@5.3.0`, `@fontsource-variable/newsreader@5.3.0`, `@fontsource-variable/public-sans@5.3.0`, `@fontsource/young-serif@5.3.0`, `@fontsource-variable/instrument-sans@5.3.0`, `axe-core` (versão exata fixada na instalação, só para QA).

**`vite.config.js`:**

```js
import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { contato, whatsappUrl, mailtoUrl } from './src/config.js';

const paginas = {
  home: 'index.html',
  codea: 'conceitos/codea/index.html',
  junco: 'conceitos/junco/index.html',
  juncoTratamentos: 'conceitos/junco/tratamentos/index.html',
  juncoPrimeira: 'conceitos/junco/primeira-consulta/index.html',
  juncoAgendar: 'conceitos/junco/agendar/index.html',
  louca: 'conceitos/louca-torta/index.html',
  loucaProduto: 'conceitos/louca-torta/produto/index.html',
};

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  build: {
    target: 'es2022',
    rolldownOptions: { input: Object.fromEntries(Object.entries(paginas).map(([k, v]) => [k, resolve(import.meta.dirname, v)])) },
  },
  plugins: [{
    name: 'wh-contato', transformIndexHtml: { order: 'pre', handler: (html) => html
      .replaceAll('{{whatsappUrl}}', whatsappUrl())
      .replaceAll('{{whatsappExibicao}}', contato.whatsappExibicao)
      .replaceAll('{{email}}', contato.email)
      .replaceAll('{{mailtoUrl}}', mailtoUrl())
      .replaceAll('{{ano}}', String(new Date().getFullYear())) },
  }],
});
```

(No Vite 8 a chave é `build.rolldownOptions`; `rollupOptions` está marcada como obsoleta nos tipos instalados.)

**Estrutura de pastas:**

```
wunderhub-experiment/
  index.html                         home
  conceitos/
    codea/index.html
    junco/index.html  junco/tratamentos/index.html  junco/primeira-consulta/index.html  junco/agendar/index.html
    louca-torta/index.html  louca-torta/produto/index.html
  public/
    favicon.svg  og.png  robots.txt  .nojekyll
    media/  showreel-1080.mp4  showreel-1080.webm  showreel-720.mp4  showreel-poster-1280.webp  showreel-poster-640.webp
  src/
    config.js                        contatos e marca (única fonte)
    main.js                          entrada da home: header, menu, palco, carga, imports sob demanda
    data/conceitos.js                dados da vitrine
    generated/                       letreiro.json, decisoes.json, fallback.json (gerados, versionados)
    styles/
      tokens.css  fontes.css  base.css  header.css  abertura.css  palco.css
      trabalhos.css  servicos.css  processo.css  sobre.css  contato.css  rodape.css
      generated/letreiro.css         células, polígonos e wdth gerados
    js/
      motion/tokens.js  motion/preferencias.js     (reduced motion, pointer, saveData, altura)
      letreiro/render.js  letreiro/palco.js  letreiro/carga.js
      vitrine.js  teste-dialog.js  filme.js
      processo.js  porta.js  configurador.js  copiar-email.js
      menu.js  barra-whatsapp.js
    assets/
      fonts/        anybody-latin-wdth-normal.woff2  archivo-latin-wght-normal.woff2  OFL-*.txt
      textura/      grao-2400.webp  grao-chapa-2400.webp
      capturas/     <slug>-desktop-{480,960,1440}.webp  <slug>-celular-{390,780}.webp  (+ estados do showreel)
    conceitos/
      comum/selo.css  comum/selo.js
      codea/   main.js  codea.css  dados.js  fonts/  img/
      junco/   main.js  junco.css  dados.js  agendar.js  fonts/  img/
      louca-torta/  main.js  loja.css  dados.js  sacola.js  produto.js  fonts/  img/
  scripts/
    fontes.mjs                copia os woff2 e as licenças OFL de node_modules
    grao.sh                   gera as texturas (seção 2.2)
    metricas-letreiro.mjs     Playwright: células, wdth dos andares, polígonos dos cortes, larguras do processo
    metricas-fallback.mjs     Playwright: size-adjust e overrides dos fallbacks
    capturas.mjs              build + preview + capturas WebP + decisoes.json + assets do showreel
    og.mjs                    gera public/og.png (1200×630) a partir de uma página local
    qa/                       verificações Playwright (seção 12)
  showreel/                   projeto Hyperframes (index.html, compositions/, assets/, hyperframes.json, renders/)
  docs/  hypotheses.md  direction.md  experiment.md  research/
  README.md
```

**Scripts do `package.json`:** `dev`, `build`, `preview`, `fontes`, `grao`, `metricas` (letreiro e fallback), `capturas`, `showreel:assets`, `showreel:render`, `qa`.

**Carregamento:**

- `<head>`: CSS crítico do header e da abertura embutido pelo Vite no CSS de entrada; preload da Anybody; script inline mínimo (abaixo); `main.js` como módulo.
- Script inline (antes do CSS):

```html
<script>
(function () {
  var d = document.documentElement; d.classList.add('js');
  window.__wh = { teto: setTimeout(function () { d.classList.remove('js'); d.classList.add('js-falhou'); }, 3000) };
  if (document.fonts && document.fonts.load) {
    var ok = false;
    document.fonts.load('900 100px "Anybody Letreiro"').then(function () { ok = true; d.classList.add('fonte-pronta'); });
    setTimeout(function () { if (!ok) d.classList.add('fonte-lenta'); }, 900);
  }
})();
</script>
```

- `main.js` limpa o teto e marca `html.pronto`. Se `js-falhou` já estiver presente, roda em modo estático (menu, diálogos, copiar e configurador funcionam; palco e Porta ficam no estado final).
- Módulos sob demanda por `import()`: `vitrine.js` e `filme.js` quando `#trabalhos` chega a uma tela de distância (`inView` com margem de 100%) ou no primeiro `pointerdown`/`focusin` dentro dele; `processo.js` e `porta.js`/`configurador.js` da mesma forma nas suas seções.
- **Orçamentos (metas a medir):** JS inicial ≤ 60 KB gz (meta do briefing: < 180 KiB); CSS ≤ 25 KB gz; fontes 92 KB; primeira experiência mobile ≤ 400 KB sem mídia sob demanda (meta: ≤ 1 MB); LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms (laboratório, declarado como tal).
- **Detecção de capacidade:** `matchMedia` para `prefers-reduced-motion`, `(pointer: fine)`, `(hover: hover)`, `(max-height: 499px)`, `(prefers-reduced-data: reduce)`; `navigator.connection?.saveData`; `'inert' in HTMLElement.prototype`; `HTMLDialogElement.prototype.showModal`; `navigator.clipboard?.writeText`; `document.fonts`. Nenhuma adaptação por nome de aparelho.
- **Limpeza:** guardar os retornos de `scroll()` e `inView()` e chamá-los ao trocar reduced motion e ao desmontar; `pagehide` pausa o vídeo e devolve o iframe a `about:blank`; `visibilitychange` pausa o vídeo; `will-change` só durante o palco; nenhum `requestAnimationFrame` em laço ocioso.

**Publicação (GitHub Pages, quando o dono pedir):** `BASE_PATH=/<nome-do-repo>/ npm run build`; publicar `dist/` (contém `.nojekyll`). Todos os links internos são relativos, assets passam pelo Vite e mídias usam `import.meta.env.BASE_URL`, então o site funciona em subdiretório. Verificar com `npx vite preview --base /<nome-do-repo>/`.

---

## 11. Imagens Magnific para o portfólio

Nenhuma imagem fotográfica no portfólio em si. Motivos: o letreiro é tipografia e CSS; o que aparece nas janelas e na vitrine precisa ser o trabalho real (capturas Playwright das demos), e uma foto ilustrativa competiria com essa prova; o dono não forneceu retrato e não se gera imagem de pessoa. As texturas de prata são geradas por ffmpeg (seção 2.2), determinísticas e com cerca de 15 KB no total. O `og.png` (1200×630) é gerado por Playwright a partir de uma página local com o letreiro em p=0,62 e o H1. O Magnific é usado nas imagens dos três conceitos (seção 7.4).

---

## 12. Critérios de aceite e QA

1. **Quadros do palco:** screenshots de `.fachada` em p = 0; 0,12; 0,35; 0,62; 0,85; 1 em 1440×900, 390×844 e 360×780. Em p=0 o nome lê contínuo e a fenda é preta; em 0,35 as janelas estão totalmente abertas; em 0,85 as placas entram; nenhum quadro mostra metades desalinhadas fora do vetor do corte.
2. **Prata:** em p=0, comparar por screenshot com as regras anti-chrome; Chapa com preto ≥ 10:1 no pixel mais escuro sob texto.
3. **Primeira tela:** H1, lead e "Chamar no WhatsApp" visíveis no primeiro paint em 360, 390, 768 e 1440; base do letreiro a 32px da dobra em 1440×900.
4. **Sem JS** (JavaScript desligado): conteúdo completo, palco estático em p=0,62 com placas, painéis abertos, porta aberta, links de WhatsApp e e-mail corretos.
5. **Reduced motion:** mesmas informações e ações; nenhuma animação de deslocamento; palco sem pista.
6. **Altura < 500px e zoom de 200% em 1440×900:** palco sem pista; nada cortado; sem rolagem horizontal.
7. **Teclado:** skip link; ordem de Tab; foco visível em todas as superfícies; Escape fecha painel, menu e diálogos e devolve o foco; range com setas, Home e End.
8. **Leitor de tela:** árvore de acessibilidade sem duplicatas do letreiro e dos nomes partidos; `aria-valuetext` do range; anúncios de "E-mail copiado" e do resumo do configurador. axe-core sem violações sérias.
9. **Rolagem:** lenta, rápida, retorno pelas cenas, âncoras (`#trabalhos`, `#conceito-*`, `#contato`), recarregar no meio do palco, voltar pelo histórico (bfcache sem repetir a carga), resize de 1440 para 390.
10. **Rede:** nenhum 404, nenhum erro de console, vídeo só depois do clique, iframe só ao abrir "Testar aqui".
11. **Base path:** build com `BASE_PATH=/wunderhub/` servido em subdiretório: home, demos, fontes, imagens, vídeo e links de volta funcionando.
12. **Desempenho (laboratório, Lighthouse mobile no Chromium 141 local, declarado como tal):** Performance ≥ 90, Acessibilidade e SEO ≥ 95, JS inicial e bytes da primeira experiência medidos e registrados; elemento LCP identificado (esperado: H1 ou letreiro, nunca bloqueado por JS); quadros do palco ≤ 4ms de script com CPU 4x.
13. **Demos:** todas as interações da seção 7 funcionando em 390 e 1440; nenhuma envia dados; avisos de demonstração visíveis.
14. **Showreel:** `check` sem erros, 540 quadros, quadros revisados, reprodução real no site.

---

## 13. Evidência do protótipo de validação

Feito para este documento, fora do projeto (scratchpad), só para conferência:

- `/tmp/claude-0/-home-user-Portfolio-io/593fcf5b-2833-5caf-9c6d-13a4dc74bfa0/scratchpad/spec/proto-d-p0.png`: primeira versão; grão grosso demais (parecia estática de TV) e fenda colorida lendo como nome riscado. Ambos corrigidos.
- `/tmp/claude-0/-home-user-Portfolio-io/593fcf5b-2833-5caf-9c6d-13a4dc74bfa0/scratchpad/spec/proto-d-p0-C.png`: versão adotada para p=0 (grão fino, fenda preta, aresta polida).
- `/tmp/claude-0/-home-user-Portfolio-io/593fcf5b-2833-5caf-9c6d-13a4dc74bfa0/scratchpad/spec/proto-m-p0-C.png`: torre mobile justificada pelo wdth.
- `/tmp/claude-0/-home-user-Portfolio-io/593fcf5b-2833-5caf-9c6d-13a4dc74bfa0/scratchpad/spec/proto-d-p62.png`: estado estático com células fixas, letras como caixilhos e capturas simuladas atrás.
- Medições: `/tmp/claude-0/-home-user-Portfolio-io/593fcf5b-2833-5caf-9c6d-13a4dc74bfa0/scratchpad/spec/measure.mjs` e `measure2.mjs`.

Valores de referência medidos (o script `metricas-letreiro.mjs` regenera):

| Medida | Valor |
| --- | --- |
| WUNDERHUB, wdth 50, wght 900 | 3,5756em (W 0,6091; U 0,3725; N 0,4806; D 0,3706; E 0,2511; R 0,3761; H 0,3716; B 0,3720) |
| Vãos em 50/900 | WUN 1,462em; DER 0,9975em; HUB 1,1161em (queda do corte: 0,42em; 0,29em; 0,32em, sempre menor que a versal de 0,68em) |
| Mesmas letras em 50/140 | W 0,1886; U 0,1111; N 0,1275; D 0,0975; E 0,0816; R 0,1025; H 0,1036; B 0,1011 |
| Andares mobile em 3,0em, wght 900 | WUN wdth 110,5; DER 144,5; HUB 134 |
| Wordmark 150/800 | 10,311em |
| H1 "Sites para o seu negócio" 62/800 | 8,505em |
| Côdea 150/850; Louça Torta 125/250 | 5,362em; 7,321em |
| Formatos: Landing page 150/800; Loja virtual 50/800 | 11,235em; 3,163em |
| H2 da Porta 62/800 | 12,029em |

---

## 14. Pendências para Kauê confirmar antes de publicar

- O que a etapa "No ar" inclui além da publicação (registro de domínio, hospedagem, orientação para editar, manutenção). O texto atual promete só "o site publicado no endereço combinado".
- Quais formas de pagamento e plataformas ele integra em lojas virtuais (o texto diz "a forma de pagamento que combinarmos").
- Se quer mostrar a cidade ou região de atendimento (não aparece em lugar nenhum hoje).
- Nova busca de colisão dos nomes Côdea, Junco Fisioterapia e Louça Torta perto da publicação.
