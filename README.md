# WunderHub

Portfólio de Kauê Ribeiro: landing pages, sites institucionais e lojas virtuais para pequenos negócios. Publicação: <https://wunderhub.github.io/Portfolio.io/>.

Os trabalhos da vitrine são **conceitos autorais com marcas fictícias**, não projetos de clientes. O contato real é o WhatsApp **+55 (11) 95930-0903**.

## O conceito: Núcleo

O topo do site é uma descida cinematográfica guiada pela rolagem: a câmera sai do alto de uma cidade de chips, segue os pulsos vermelhos do circuito e chega ao núcleo, onde está o W da WunderHub. Rolar para baixo avança o vídeo; rolar para cima volta. Os textos aparecem em trechos ao longo da descida e o site termina de assentar quando o W chega.

Imagens e vídeo foram gerados no Magnific (Seedream 5 Pro para as imagens, Seedance 2.5 para o vídeo) a partir de cenas aprovadas uma a uma.

## Estrutura

Site estático em HTML, CSS e JavaScript puros, sem build e sem dependências.

- `index.html`: a página inteira, com textos em português.
- `assets/site.css`: identidade visual, layout e animações.
- `assets/site.js`: vídeo guiado pela rolagem, textos que montam letra a letra, trilha de circuito, vitrine, prévia ao vivo, "segure para ligar" e menu.
- `assets/hero-scrub.mp4`: o vídeo do topo, recodificado com um quadro-chave a cada 8 para a rolagem ficar suave.
- `assets/hero-poster.jpg` e `assets/hero-ending.jpg`: primeiro e último quadro (o último vira a imagem fixa no celular e o fundo do contato).
- `assets/apoio-*.jpg`: imagens de apoio das seções.
- `assets/brand/`: logos novos (`w-mark.svg` em vetor, `w-3d.webp` em 3D), ícones e imagem de compartilhamento. Os arquivos originais ficam em `assets/brand/originais/`.
- `assets/work/`: capturas dos conceitos usadas na vitrine.
- `concepts/`: as páginas reais dos cinco conceitos.
- `scripts/capture-work.mjs`: gera de novo as capturas de `assets/work/`.

## Celular e acessibilidade

Celulares, tablets em pé, telas de toque em pé, celulares deitados e quem pede movimento reduzido veem o topo como uma imagem fixa bem composta, sem baixar o vídeo. As cinco condições estão iguais no CSS e no JavaScript e são reavaliadas ao girar a tela. Se o vídeo não carregar, a página continua completa.

## Rodar localmente

```sh
python -m http.server 8000
```

Abra <http://127.0.0.1:8000/> no navegador. Abrir o `index.html` com dois cliques mostra a versão com imagem fixa, porque o navegador bloqueia o carregamento do vídeo fora de um servidor.

## Atualizar as capturas da vitrine

Com o servidor rodando:

```sh
node scripts/capture-work.mjs            # todos os conceitos
node scripts/capture-work.mjs brasa      # apenas um
```

## GitHub Pages

**Settings → Pages → Deploy from a branch → main → / (root)**. Cada push para `main` publica o site em cerca de um minuto.
