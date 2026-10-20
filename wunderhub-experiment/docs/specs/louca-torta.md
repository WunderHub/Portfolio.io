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
| Geometria vertical do palco indefinida; com `contain: paint`, as metades abertas seriam cortadas (visto no quadro p=0,62 do protótipo) | Seção 5.1 fixa folgas acima e abaixo do letreiro, a fachada em largura total, a centralização na caixa sticky e a altura mínima da abertura |
| Foco podia ficar sob o header sticky, a barra de WhatsApp ou as folhas da Porta | `scroll-padding` no topo e na base, Porta aberta sem animação quando o gatilho é foco (seção 2.9) |

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

## 7. Conceitos demonstrativos

Três marcas fictícias novas, cada uma com estrutura, tipografia, paleta e interação próprias. Checagem de colisão feita para este documento (WebSearch em 18/10/2026 e refeita em 19/10/2026 com as buscas `"Côdea" padaria`, `"Junco Fisioterapia"` e `"Louça Torta" cerâmica`): nenhuma retornou negócio com esse nome; para Junco apareceram só pessoas com o sobrenome Junco e uma clínica na cidade de Juncos (Porto Rico). Limite: o buscador disponível é configurado para os EUA, então a cobertura de comércio local brasileiro é parcial. "Miolo Alto" foi descartado porque existem padarias "Miolo" em São Paulo. Antes de publicar, refazer a busca no Google Maps, no Instagram e no registro de marcas do INPI.

**Comum a todas as demos:**

- Faixa no topo, antes de tudo, em preto com texto Prata Luz (18,38:1): "Conceito da WunderHub. [Marca] é uma marca fictícia." e o link "Voltar ao portfólio" (`../../#conceito-<slug>`, relativo, funciona em subdiretório; páginas internas do Junco e da Louça Torta usam `../../../`). O link tem `target="_top"`, para que dentro do iframe do "Testar aqui" ele leve a janela inteira de volta, e não abra o portfólio dentro da prévia. Repetida no rodapé. Componente compartilhado em `src/conceitos/comum/selo.{css,js}`.
- Nenhuma demo envia dados, abre o WhatsApp de um número fictício ou processa pagamento. Toda ação que seria de backend mostra o resultado na tela e diz que é demonstração.
- Elementos ligados às decisões A/B/C levam `data-decisao="A|B|C"`; o script de capturas grava a posição deles para os marcadores da vitrine.
- Fontes autohospedadas (OFL), imagens WebP com `width`/`height`, `srcset`, `loading="lazy"` abaixo da dobra e `fetchpriority="high"` só na imagem principal do topo.
- Foco visível próprio de cada marca, reduced motion respeitado, alvos ≥ 44px (48px nos controles principais).

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

## 12. Critérios de aceite e QA

1. **Quadros do palco:** screenshots de `.fachada` em p = 0; 0,12; 0,35; 0,62; 0,85; 1 em 1440×900, 390×844 e 360×780. Em p=0 o nome lê contínuo e a fenda é preta; em 0,35 as janelas estão totalmente abertas; em 0,85 as placas entram; nenhum quadro mostra metades desalinhadas fora do vetor do corte.
2. **Prata:** em p=0, comparar por screenshot com as regras anti-chrome; Chapa com preto ≥ 10:1 no pixel mais escuro sob texto.
3. **Primeira tela:** H1, lead e "Chamar no WhatsApp" visíveis no primeiro paint em 360, 390, 768 e 1440; base do letreiro a 32px da dobra em 1440×900.
4. **Sem JS** (JavaScript desligado): conteúdo completo, palco estático em p=0,62 com placas, painéis abertos, porta aberta, links de WhatsApp e e-mail corretos.
5. **Reduced motion:** mesmas informações e ações; nenhuma animação de deslocamento; palco sem pista.
6. **Altura < 500px e zoom de 200% em 1440×900:** palco sem pista; nada cortado; sem rolagem horizontal.
7. **Teclado:** skip link; ordem de Tab; foco visível em todas as superfícies e nunca coberto pelo header, pela barra de WhatsApp ou pelas folhas da Porta; Escape fecha painel, menu e diálogos e devolve o foco; range com setas, Home e End; menu mobile sem JS leva a `#mapa`.
8. **Leitor de tela:** árvore de acessibilidade sem duplicatas do letreiro e dos nomes partidos; `aria-valuetext` do range; anúncios de "E-mail copiado" e do resumo do configurador. axe-core sem violações sérias.
9. **Rolagem:** lenta, rápida, retorno pelas cenas, âncoras (`#trabalhos`, `#conceito-*`, `#contato`), recarregar no meio do palco, voltar pelo histórico (bfcache sem repetir a carga), resize de 1440 para 390.
10. **Rede:** nenhum 404, nenhum erro de console, vídeo só depois do clique, iframe só ao abrir "Testar aqui".
11. **Base path:** build com `BASE_PATH=/wunderhub/` servido em subdiretório: home, demos, fontes, imagens, vídeo e links de volta funcionando.
12. **Desempenho (laboratório, Lighthouse mobile no Chromium 141 local, declarado como tal):** Performance ≥ 90, Acessibilidade e SEO ≥ 95, JS inicial e bytes da primeira experiência medidos e registrados; elemento LCP identificado (esperado: H1 ou letreiro, nunca bloqueado por JS); quadros do palco ≤ 4ms de script com CPU 4x.
13. **Demos:** todas as interações da seção 7 funcionando em 390 e 1440; nenhuma envia dados; avisos de demonstração visíveis.
14. **Showreel:** `check` sem erros, 540 quadros, quadros revisados, reprodução real no site.

---

