# Imagens do conceito Junco Fisioterapia

Frente: imagens-junco. Especificação: `docs/direction.md`, seções 7.2 e 7.4. Geradas em 19/10/2026 com o conector Magnific.

- Modelo: Seedream 5 Pro (`mode: "seedream-5-pro"`), `resolution: "2k"`, `count: 1`, um prompt por chamada.
- Custo conferido antes com `simulate_cost`: 100 créditos por imagem (exato). Gasto total: 500 créditos (4 imagens finais e 1 tentativa descartada).
- Prompts: exatamente os da tabela da seção 7.4, com o final obrigatório "No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark."
- Originais (PNG, sem tokens) em `src/conceitos/junco/img/originais/`, pasta ignorada pelo git. Os links de download assinados não ficam registrados aqui.
- O site não depende do serviço em runtime: só usa os WebP locais.

## Desvio de proporção: 4:5 virou 3:4

O Seedream 5 Pro não oferece 4:5 (`images_models_list` lista 1:1, 4:3, 3:4, 16:9, 9:16, 3:2, 2:3 e 21:9; 3:2 e 1:1 existem). `junco-elasticos` e `junco-janela`, pedidas em 4:5, foram geradas em 3:4 (1728 × 2304), igual ao `codea-hero` da fundação. Os WebP mantêm a proporção 3:4. Para mostrar em 4:5 na página, use `aspect-ratio: 4 / 5` com `object-fit: cover`: o corte tira cerca de 3% em cima e 3% embaixo, e nas duas fotos o assunto continua inteiro (conferido na folha de contato).

## Tabela

| Arquivo | Prompt final | Modelo | Proporção | Criação | Créditos | Observações |
| --- | --- | --- | --- | --- | --- | --- |
| `junco-sala` | Bright, calm physiotherapy treatment room, padded treatment table with a white sheet, light wood floor, large window with sheer curtain, potted plant, pale sage-green wall, minimal, soft daylight, empty room, no posters. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 3:2 (2496 × 1664) | [lJVI0zpgv9](https://www.magnific.com/app/creation/lJVI0zpgv9) | 100 | Aceita na primeira. Seed 921705. Parede verde-sálvia, maca com lençol branco, cortina translúcida, planta. Sem texto nem cartazes; só uma tomada pequena na borda direita. Base da maca conferida em tamanho real, sem deformação visível. |
| `junco-elasticos` | Resistance bands in muted green and grey, a small exercise ball and a folded white towel arranged on a light wood floor, top-down, soft daylight, minimal. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 3:4 (1728 × 2304), pedida em 4:5 | [Bhg9srOoQR](https://www.magnific.com/app/creation/Bhg9srOoQR) | 100 | Escolhida. Seed 118081. Faixa verde-musgo e faixa cinza com textura em relevo (sem letras), bola verde-sálvia, toalha branca, luz rasante. Câmera alta em cerca de 45°, não exatamente de cima: por isso houve uma nova tentativa (linha abaixo), que saiu pior e foi descartada. |
| (descartada) `junco-elasticos` v2 | Resistance bands in muted green and grey, a small exercise ball and a folded white towel arranged on a light wood floor, top-down flat lay photographed from directly above, camera pointing straight down, soft daylight, minimal. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 3:4 (1728 × 2304) | [ovSNgjt829](https://www.magnific.com/app/creation/ovSNgjt829) | 100 | Descartada. Seed 574224. Continuou em ângulo (cerca de 60°), o verde virou menta saturado (não "muted") e destoa do Musgo e do Broto da marca; o chão parece tampo de mesa. Não exportada. |
| `junco-pilates` | Pilates reformer machine in a quiet studio with light wood floor and white walls, morning light, plant in the corner, empty room. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 3:2 (2496 × 1664) | [DoxJ15Rpcl](https://www.magnific.com/app/creation/DoxJ15Rpcl) | 100 | Aceita na primeira. Seed 910905. Reformer coerente (barra de pés, carrinho com apoios de ombro, cordas e roldanas na outra ponta). Luz da manhã em faixas no chão, um pouco mais quente que as outras. Prédio do lado de fora desfocado, sem texto. |
| `junco-janela` | Tall green reeds in a matte ceramic planter beside a window, soft backlight, sage green and white tones, calm, minimal still life. No people, no hands, no faces, no text, no letters, no logos, no labels, no watermark. | Seedream 5 Pro, 2k | 3:4 (1728 × 2304), pedida em 4:5 | [kszpAZu16B](https://www.magnific.com/app/creation/kszpAZu16B) | 100 | Aceita na primeira. Seed 610485. Juncos finos verde-sálvia num vaso branco fosco, contraluz suave, parede verde à esquerda. Vaso sem deformação em tamanho real. |

## Arquivos exportados

WebP com Pillow (Lanczos, `quality=78`, `method=6`, sem metadados), proporção mantida. Fotos não quadradas em 1600, 800 e 400 px de largura (não há imagem 1:1 no Junco).

| Arquivo | Dimensões | Bytes |
| --- | --- | --- |
| `junco-sala-1600.webp` | 1600 × 1067 | 36.474 |
| `junco-sala-800.webp` | 800 × 533 | 14.674 |
| `junco-sala-400.webp` | 400 × 267 | 5.662 |
| `junco-elasticos-1600.webp` | 1600 × 2133 | 119.466 |
| `junco-elasticos-800.webp` | 800 × 1067 | 29.860 |
| `junco-elasticos-400.webp` | 400 × 533 | 8.442 |
| `junco-pilates-1600.webp` | 1600 × 1067 | 50.872 |
| `junco-pilates-800.webp` | 800 × 533 | 20.780 |
| `junco-pilates-400.webp` | 400 × 267 | 8.048 |
| `junco-janela-1600.webp` | 1600 × 2133 | 79.048 |
| `junco-janela-800.webp` | 800 × 1067 | 33.676 |
| `junco-janela-400.webp` | 400 × 533 | 13.484 |

Total dos 12 WebP: 420.486 bytes. Conferido em 1600 px: sem faixas de cor (banding) nas paredes lisas nem no fundo claro da janela.

## Uso na página

- `width`/`height` no `<img>`: 1600 × 1067 para `junco-sala` e `junco-pilates`; 1600 × 2133 para `junco-elasticos` e `junco-janela`.
- `srcset` com `-400.webp 400w, -800.webp 800w, -1600.webp 1600w`.
- `junco-sala` é a imagem do topo do Início: `fetchpriority="high"`, sem `loading="lazy"`. As outras três ficam abaixo da dobra: `loading="lazy"`.
- Cantos de 16px nas imagens (seção 7.2) ficam por conta do CSS da frente junco.

## Evidência

`docs/evidence/imagens-junco/folha-de-contato.png`: as quatro imagens no fundo Névoa, com `srcset` e as duas 3:4 recortadas em 4:5, mais as 12 variantes. Renderizada no Chromium (Playwright): as 12 decodificaram, zero erros de console e zero falhas de requisição.
