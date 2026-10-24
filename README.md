# WunderHub

Portfólio de Kauê Ribeiro: landing pages, sites institucionais e lojas virtuais para pequenos negócios. Publicação: <https://wunderhub.github.io/Portfolio.io/>.

Por enquanto a página não tem vitrine de trabalhos: ela apresenta os serviços, como funciona, quem faz e o contato. Os trabalhos autorais entram depois, conforme novos sites forem criados. O contato real é o WhatsApp **+55 (11) 95930-0903**.

## O topo

No computador, o topo é um vídeo guiado pela rolagem: a câmera sai do alto de uma cidade de chips, segue os pulsos vermelhos do circuito e chega ao W da WunderHub. Rolar para baixo avança o vídeo; rolar para cima volta. Três legendas aparecem ao longo da descida e o título assenta quando o W chega.

Imagens e vídeo foram gerados no Magnific (Seedream 5 Pro para as imagens, Seedance 2.5 para o vídeo) a partir de cenas aprovadas uma a uma.

## Estrutura

Site estático em HTML, CSS e JavaScript puros, sem build e sem dependências.

- `index.html`: a página inteira, com textos em português.
- `assets/site.css`: identidade visual, layout e animações.
- `assets/site.js`: vídeo guiado pela rolagem, legendas que montam letra a letra, menu e imagens de fundo que carregam perto da tela.
- `assets/hero-scrub.mp4`: o vídeo do topo, recodificado com um quadro-chave a cada 8 para a rolagem ficar suave.
- `assets/hero-poster.jpg` e `assets/hero-ending.jpg`: primeiro e último quadro (o último vira a imagem fixa no celular e o fundo do contato).
- `assets/apoio-*.jpg`: imagens de apoio geradas no Magnific, usadas no fundo das seções "Como funciona" e "Sobre mim".
- `assets/brand/`: logos novos (`w-mark.svg` em vetor, `w-3d.webp` em 3D), ícones e imagem de compartilhamento. Os arquivos originais ficam em `assets/brand/originais/`.

## Texto e visual: o que evitar

A página foi revisada para não ter a cara de site gerado por IA. Ao mexer nela, mantenha:

- Títulos diretos, sem etiqueta pequena em maiúsculas acima deles e sem numeração de seção ("01 ·").
- Texto concreto, em primeira pessoa, sem slogans em frases soltas ("Pagou. Esperou."), sem metáforas forçadas e sem a mesma ideia repetida em várias seções.
- Nada de brilhos, bolhas de luz, grade ou granulado no fundo, cards iguais com ícone, borda colorida na lateral dos cards ou barra falsa de navegador.
- Animação só onde ajuda: o vídeo do topo.
- No máximo dois links de WhatsApp: o botão "Orçamento" no cabeçalho e o botão da seção de contato.

## Celular e acessibilidade

Celulares, tablets em pé, telas de toque em pé, celulares deitados e quem pede movimento reduzido veem o topo como uma imagem fixa bem composta, sem baixar o vídeo. As cinco condições estão iguais no CSS e no JavaScript e são reavaliadas ao girar a tela. Se o vídeo não carregar, a página continua completa.

## Rodar localmente

```sh
python -m http.server 8000
```

Abra <http://127.0.0.1:8000/> no navegador. Abrir o `index.html` com dois cliques mostra a versão com imagem fixa, porque o navegador bloqueia o carregamento do vídeo fora de um servidor.

## GitHub Pages

**Settings → Pages → Deploy from a branch → main → / (root)**. Cada push para `main` publica o site em cerca de um minuto.
