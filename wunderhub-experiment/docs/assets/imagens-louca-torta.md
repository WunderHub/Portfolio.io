# Imagens do conceito Louça Torta

Frente: imagens-louca-torta. Especificação: `docs/direction.md`, seções 7.3 e 7.4. Geradas em 19/10/2026 com o conector Magnific.

- Modelo: Seedream 5 Pro (`mode: "seedream-5-pro"`), `resolution: "2k"`, `count: 1`, um prompt por chamada.
- Custo conferido antes com `simulate_cost` para 1:1, 16:9 e 3:2: 100 créditos por imagem (exato). Gasto total: 1.400 créditos (13 imagens finais e 1 tentativa descartada).
- Prompts: exatamente os da tabela da seção 7.4, com o final obrigatório "No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark." A única exceção é a segunda tentativa de `lt-pote-cobalto`, explicada na tabela.
- Variantes de esmalte: geradas depois das bases, com a base como referência (`references: [{ type: "image", identifier: <criação base> }]`). As notas "(referência: ...)" da tabela da especificação não entram no prompt.
- Originais (PNG, sem tokens) em `src/conceitos/louca-torta/img/originais/`, pasta ignorada pelo git. Os links de download assinados não ficam registrados aqui.
- O site não depende do serviço em runtime: só usa os WebP locais.

## Proporções

O Seedream 5 Pro aceita 1:1, 4:3, 3:4, 16:9, 9:16, 3:2, 2:3 e 21:9 (`images_models_list`), sem 4:5. Nenhuma imagem da Louça Torta pede 4:5, então não houve desvio: 16:9 saiu em 2560 × 1440, 3:2 em 2496 × 1664 e 1:1 em 2048 × 2048.

## Tabela

| Arquivo | Prompt final | Modelo | Proporção | Criação | Créditos | Observações |
| --- | --- | --- | --- | --- | --- | --- |
| `lt-hero` | Table set with handmade stoneware: cobalt blue glazed plates, celadon green bowls and a slightly irregular chalk-white mug, on a pale grey linen tablecloth, three-quarter overhead view, soft cool daylight, editorial still life, no food packaging. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 16:9 (2560 × 1440) | [Xml4gbRBfo](https://www.magnific.com/app/creation/Xml4gbRBfo) | 100 | Aceita na primeira. Seed 923743. Cinco pratos cobalto, três tigelas celadon e uma caneca branco giz amassada à mão sobre linho cinza claro, luz fria. Sem texto nem embalagens. Os pratos das bordas saem cortados de propósito (mesa continua fora do quadro). |
| `lt-caneca-cobalto` | Handmade wheel-thrown stoneware mug with a wavy, slightly crooked rim and a thick handle, glossy cobalt blue glaze breaking to brown at the edges, centered on a seamless pale grey-green paper background, soft diffused daylight from the left, subtle shadow, product photography. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 1:1 (2048 × 2048) | [5jAMG4mKxe](https://www.magnific.com/app/creation/5jAMG4mKxe) | 100 | Aceita na primeira. Seed 313433. Base das variantes da caneca. Borda ondulada, esmalte quebrando para marrom na borda e na alça, pé de argila crua. |
| `lt-caneca-celadon` | Same mug as the reference image, same angle and light, translucent pale celadon green glaze pooling darker in the throwing lines. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k, referência `lt-caneca-cobalto` | 1:1 (2048 × 2048) | [UPphdR6wny](https://www.magnific.com/app/creation/UPphdR6wny) | 100 | Aceita na primeira. Seed 884464. Mesma forma, ângulo e luz da base; o celadon escurece nas linhas do torno. Posição da caneca praticamente igual à da base, bom para o crossfade. |
| `lt-caneca-giz` | Same mug as the reference image, same angle and light, matte chalk-white glaze with small dark speckles. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k, referência `lt-caneca-cobalto` | 1:1 (2048 × 2048) | [JNXfoAjOq4](https://www.magnific.com/app/creation/JNXfoAjOq4) | 100 | Aceita na primeira. Seed 441864. Branco fosco com pintas escuras. A borda ondula um pouco mais que na base e a caneca está uns 3% mais à direita; no crossfade de 200ms isso passa como "outra peça da mesma fornada". Alça conferida em tamanho real, sem deformação. |
| `lt-tigela-celadon` | Deep handmade stoneware bowl, irregular rim, translucent celadon green glaze, centered on a seamless pale grey-green paper background, soft daylight from the left, product photography. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 1:1 (2048 × 2048) | [s7T8VAvl8e](https://www.magnific.com/app/creation/s7T8VAvl8e) | 100 | Aceita na primeira. Seed 958720. Base da variante da tigela. Borda irregular, anéis do torno visíveis por dentro, brilho translúcido. |
| `lt-tigela-preto` | Same bowl as the reference image, same angle and light, matte black glaze. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k, referência `lt-tigela-celadon` | 1:1 (2048 × 2048) | [kszpYyh16B](https://www.magnific.com/app/creation/kszpYyh16B) | 100 | Aceita na primeira. Seed 420067. Mesma borda irregular e mesmo enquadramento; preto acetinado, quase fosco. Diferença: aparece um pé torneado que na base fica escondido, e a tigela fica um pouco mais aberta. Aceitável para peça feita à mão. |
| `lt-prato-raso-cobalto` | Handmade 26 cm stoneware dinner plate with an irregular rim, cobalt blue glaze, seen from 30 degrees above, seamless pale grey-green background, soft daylight. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 1:1 (2048 × 2048) | [O6BCoVbynm](https://www.magnific.com/app/creation/O6BCoVbynm) | 100 | Aceita na primeira. Seed 905195. Borda ondulada, cobalto com pintas, pé de argila crua aparecendo por baixo. |
| `lt-prato-sobremesa-giz` | Handmade 19 cm dessert plate, chalk-white speckled matte glaze, seen from 30 degrees above, seamless pale grey-green background, soft daylight. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 1:1 (2048 × 2048) | [vQy2PUKa47](https://www.magnific.com/app/creation/vQy2PUKa47) | 100 | Aceita na primeira. Seed 740438. Branco fosco com pintas marrons. A borda é mais regular que a dos outros pratos, mas a textura deixa claro que é feito à mão. Prato menor no quadro, coerente com os 19 cm. |
| `lt-vaso-giz` | Tall cylindrical handmade vase, visible throwing rings, matte chalk-white glaze, centered on a seamless pale grey-green background, soft daylight. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 1:1 (2048 × 2048) | [aFPA47jfSh](https://www.magnific.com/app/creation/aFPA47jfSh) | 100 | Aceita na primeira. Seed 226775. Cilindro alto com anéis do torno discretos. O fundo escurece mais no topo que nas outras fotos (vinheta leve). |
| `lt-travessa-celadon` | Oval handmade stoneware serving dish, 32 cm, celadon green glaze, seen from 30 degrees above, seamless pale grey-green background, soft daylight. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 1:1 (2048 × 2048) | [gOMtD0ySXO](https://www.magnific.com/app/creation/gOMtD0ySXO) | 100 | Aceita na primeira. Seed 736039. Travessa oval funda, celadon um pouco mais saturado que o da tigela; fundo levemente mais verde que o das outras peças. |
| `lt-xicara-preto` | Small handmade coffee cup with saucer, matte black glaze, centered on a seamless pale grey-green background, soft daylight. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 1:1 (2048 × 2048) | [Lw0oTW7swO](https://www.magnific.com/app/creation/Lw0oTW7swO) | 100 | Aceita na primeira. Seed 800625. Xícara bojuda e pires em preto fosco, alça bem resolvida. |
| (descartada) `lt-pote-cobalto` v1 | Handmade lidded stoneware jar, cobalt blue glaze, centered on a seamless pale grey-green background, soft daylight. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 1:1 (2048 × 2048) | [lJVIMTXgv9](https://www.magnific.com/app/creation/lJVIMTXgv9) | 100 | Descartada. Seed 465602. Halo escuro de nitidez em volta da tampa, vinheta forte e fundo mais escuro e mais verde que o resto do conjunto (cara de foto antiga de catálogo); esmalte manchado de cinza. Não exportada. |
| `lt-pote-cobalto` | Handmade wheel-thrown lidded stoneware jar with a small knob on the lid, glossy cobalt blue glaze breaking to brown at the edges, centered on a seamless pale grey-green paper background, soft diffused daylight from the left, subtle shadow, product photography. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 1:1 (2048 × 2048) | [3za5EziREY](https://www.magnific.com/app/creation/3za5EziREY) | 100 | Escolhida (segunda tentativa). Seed 241544. Prompt ajustado com o vocabulário da caneca base (torneado, pegador na tampa, cobalto quebrando para marrom, papel de fundo, luz da esquerda) para o pote conversar com o resto do conjunto. Bojo redondo, linhas do torno, sem halo. |
| `lt-atelie` | Pottery studio shelves with rows of bisque and freshly glazed bowls and mugs drying, potter's wheel softly out of focus, natural light, clay dust, empty studio. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 3:2 (2496 × 1664) | [u56Yi6eQLD](https://www.magnific.com/app/creation/u56Yi6eQLD) | 100 | Aceita na primeira. Seed 524739. Prateleiras com tigelas em biscoito e canecas esmaltadas em azul claro, torno desfocado à esquerda, janela estourada ao fundo. Tom mais quente e empoeirado que as fotos de produto, o que combina com "Do ateliê". Alças e bordas conferidas em tamanho real; sem texto nem etiquetas. |

## Arquivos exportados

WebP com Pillow 12.3 (Lanczos, `quality=78`, `method=6`, sem metadados), proporção mantida. Fotos 1:1 em 1200, 600 e 300 px; `lt-hero` (16:9) e `lt-atelie` (3:2) em 1600, 800 e 400 px.

| Arquivo | Dimensões | Bytes |
| --- | --- | --- |
| `lt-hero-1600.webp` | 1600 × 900 | 94.916 |
| `lt-hero-800.webp` | 800 × 450 | 19.024 |
| `lt-hero-400.webp` | 400 × 225 | 7.094 |
| `lt-atelie-1600.webp` | 1600 × 1067 | 72.432 |
| `lt-atelie-800.webp` | 800 × 533 | 30.640 |
| `lt-atelie-400.webp` | 400 × 267 | 13.736 |
| `lt-caneca-cobalto-1200.webp` | 1200 × 1200 | 39.246 |
| `lt-caneca-cobalto-600.webp` | 600 × 600 | 10.732 |
| `lt-caneca-cobalto-300.webp` | 300 × 300 | 3.686 |
| `lt-caneca-celadon-1200.webp` | 1200 × 1200 | 23.458 |
| `lt-caneca-celadon-600.webp` | 600 × 600 | 6.860 |
| `lt-caneca-celadon-300.webp` | 300 × 300 | 2.608 |
| `lt-caneca-giz-1200.webp` | 1200 × 1200 | 21.584 |
| `lt-caneca-giz-600.webp` | 600 × 600 | 6.026 |
| `lt-caneca-giz-300.webp` | 300 × 300 | 2.112 |
| `lt-tigela-celadon-1200.webp` | 1200 × 1200 | 17.292 |
| `lt-tigela-celadon-600.webp` | 600 × 600 | 5.676 |
| `lt-tigela-celadon-300.webp` | 300 × 300 | 2.372 |
| `lt-tigela-preto-1200.webp` | 1200 × 1200 | 26.888 |
| `lt-tigela-preto-600.webp` | 600 × 600 | 7.498 |
| `lt-tigela-preto-300.webp` | 300 × 300 | 2.766 |
| `lt-prato-raso-cobalto-1200.webp` | 1200 × 1200 | 32.120 |
| `lt-prato-raso-cobalto-600.webp` | 600 × 600 | 10.358 |
| `lt-prato-raso-cobalto-300.webp` | 300 × 300 | 3.878 |
| `lt-prato-sobremesa-giz-1200.webp` | 1200 × 1200 | 21.262 |
| `lt-prato-sobremesa-giz-600.webp` | 600 × 600 | 6.184 |
| `lt-prato-sobremesa-giz-300.webp` | 300 × 300 | 1.986 |
| `lt-vaso-giz-1200.webp` | 1200 × 1200 | 10.564 |
| `lt-vaso-giz-600.webp` | 600 × 600 | 3.416 |
| `lt-vaso-giz-300.webp` | 300 × 300 | 1.256 |
| `lt-travessa-celadon-1200.webp` | 1200 × 1200 | 16.558 |
| `lt-travessa-celadon-600.webp` | 600 × 600 | 5.788 |
| `lt-travessa-celadon-300.webp` | 300 × 300 | 2.342 |
| `lt-xicara-preto-1200.webp` | 1200 × 1200 | 18.210 |
| `lt-xicara-preto-600.webp` | 600 × 600 | 5.994 |
| `lt-xicara-preto-300.webp` | 300 × 300 | 2.574 |
| `lt-pote-cobalto-1200.webp` | 1200 × 1200 | 48.254 |
| `lt-pote-cobalto-600.webp` | 600 × 600 | 11.764 |
| `lt-pote-cobalto-300.webp` | 300 × 300 | 3.610 |

Total dos 39 WebP: 622.764 bytes. Conferido com contraste esticado no fundo liso do vaso e da tigela: sem faixas de cor (banding) em relação ao PNG original.

## Uso na página

- Mapa produto e esmalte para arquivo (`dados.js` da frente louca-torta):
  - `caneca-torta`: cobalto `lt-caneca-cobalto`, celadon `lt-caneca-celadon`, branco giz `lt-caneca-giz`.
  - `tigela-funda`: celadon `lt-tigela-celadon`, preto fosco `lt-tigela-preto`.
  - `prato-raso`: cobalto `lt-prato-raso-cobalto`.
  - `prato-sobremesa`: branco giz `lt-prato-sobremesa-giz`.
  - `vaso-alto`: branco giz `lt-vaso-giz`.
  - `travessa-oval`: celadon `lt-travessa-celadon`.
  - `xicara-pires`: preto fosco `lt-xicara-preto`.
  - `pote-tampa`: cobalto `lt-pote-cobalto`.
- `width`/`height` no `<img>`: 1200 × 1200 para as peças, 1600 × 900 para `lt-hero`, 1600 × 1067 para `lt-atelie`.
- `srcset`: peças com `-300.webp 300w, -600.webp 600w, -1200.webp 1200w`; `lt-hero` e `lt-atelie` com `-400.webp 400w, -800.webp 800w, -1600.webp 1600w`.
- `lt-hero` é a imagem do topo da loja: `fetchpriority="high"`, sem `loading="lazy"`. Peças abaixo da dobra e `lt-atelie`: `loading="lazy"`.
- Se o topo recortar a `lt-hero` no celular (`object-fit: cover`), use `object-position: 62% 50%`: em 1:1 e em 4:5 o recorte mantém a caneca branca, um prato cobalto e duas tigelas (conferido em `docs/evidence/imagens-louca-torta/lt-hero-cortes-1x1-e-4x5.png`).
- Cor de espera para os quadros das peças enquanto a imagem carrega: `#C3CCC6` (média do fundo das fotos, que vai de cerca de `#B6C1BA` no topo a `#D0D8D4` embaixo). Os fundos variam um pouco entre as fotos (o vaso é mais escuro no topo e a travessa um pouco mais verde); na grade isso passa como luz natural, mas não ponha as fotos encostadas umas nas outras sem espaço entre elas.
- Cantos de 2px (seção 7.3) ficam por conta do CSS da frente louca-torta.

## Evidência

- `docs/evidence/imagens-louca-torta/folha-de-contato-desktop.png` (1440 px) e `folha-de-contato-mobile.png` (390 px, DPR 2): topo com `lt-hero`, grade da loja com a primeira peça em 2×2, as variantes de esmalte lado a lado, `lt-atelie` e os 39 WebP. Renderizada no Chromium (Playwright): 54 de 54 imagens decodificadas, Young Serif e Instrument Sans carregadas, zero erros de console, zero requisições com falha, sem rolagem horizontal no celular.
- `docs/evidence/imagens-louca-torta/lt-hero-cortes-1x1-e-4x5.png`: recortes 1:1 e 4:5 da `lt-hero` com `object-position: 62% 50%`.
