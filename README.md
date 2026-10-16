# WunderHub

Portfólio de Kauê Ribeiro com design, desenvolvimento e experiências de movimento. Publicação: <https://wunderhub.github.io/Portfolio.io/>.

Os trabalhos são **estudos autorais**, não projetos de clientes. Aura é um produto fictício com imagem conceitual gerada para a demonstração; seus controles não realizam compras. O contato real é o WhatsApp **+55 (11) 95930-0903**.

## Experiências implementadas

- **Revelação no scroll:** sequência de 240 WEBP em canvas responsivo, fixo durante a rolagem. Implementada em HTML, CSS e JavaScript puros, sem depender das bibliotecas das outras demonstrações.

- **Aura Audio:** protótipo de interface de produto com abas acessíveis, quantidade, seleção e reset. Motion dá feedback às interações.
- **Frame:** composição HTML de 10 segundos, com timeline GSAP e player HyperFrames. Permite reproduzir, pausar e buscar qualquer instante.
- **Filme WunderHub:** composição Remotion de 14 segundos com controles de reprodução, executada em React no navegador. Não é um MP4 pré-renderizado.

As duas experiências de vídeo são silenciosas e carregadas somente quando abertas. O filme não inicia automaticamente quando o visitante prefere movimento reduzido. Fechar a janela interrompe e desmonta o player. Texto, links, WhatsApp e acordeões funcionam sem JavaScript.

## Animação de scroll do logo

O arquivo enviado pelo proprietário é um MP4 de 8 segundos, 1280×720 a 24 fps (192 quadros). A sequência contém **240 arquivos a 30 fps**, obtidos por repetição de quadros para preservar a duração, sem interpolação de movimento. Há duas variantes: desktop em 1280×720 (~2,72 MiB) e mobile em 768×432 (~1,30 MiB).

A seção usa `position: sticky` e o scroll nativo, inclusive na subida. O `requestAnimationFrame` suaviza o índice e desenha apenas quando necessário. A seção ocupa uma tela, com um percurso adicional de 2,2 telas no desktop (`220svh`) e 1,8 no celular (`180svh`). O botão “Pular apresentação” leva diretamente ao conteúdo.

- `assets/logo-scroll.js`: implementação independente, carregada com `defer`; não precisa de build.
- `assets/logo-scroll.css`: viewport, sticky, controles e fallback.
- `assets/logo-sequence/desktop/frame-0001.webp` até `frame-0240.webp`: sequência desktop.
- `assets/logo-sequence/mobile/`: os mesmos 240 frames em menor resolução.
- `assets/logo-sequence/poster.webp` e `poster-mobile.webp`: quadro final estático.
- `assets/logo-sequence/manifest.json`: dimensões, duração e origem dos arquivos.
- `src/media/logo-reveal.mp4`: vídeo original fornecido pelo proprietário.

O canvas preenche a tela. `data-fit="contain"` mantém a imagem inteira e sua proporção; por isso há margens pretas nas telas com proporção diferente do vídeo, especialmente em retrato. `data-fit="cover"` pode preencher a área cortando bordas, mas não é o padrão para preservar o símbolo e os efeitos laterais.

São permitidos até quatro downloads simultâneos e duas decodificações simultâneas. Os arquivos comprimidos são pré-carregados progressivamente quando a seção está próxima da tela; o cache mantém até 20 imagens decodificadas no desktop e 14 no celular. Ao sair da seção, são liberadas as imagens decodificadas que não estão sendo exibidas. A densidade do canvas é limitada a 2× e aproximadamente 3 milhões de pixels.

Com `prefers-reduced-motion: reduce`, o site mostra apenas o quadro final, não baixa os frames e remove o percurso extra de rolagem. Sem JavaScript ou em falha de carregamento, há a mesma imagem estática e navegação normal. A preferência também pode mudar enquanto a página está aberta.

Para regenerar os frames (exige FFmpeg com `libwebp` e FFprobe):

```sh
npm run frames
# Ou usar outro vídeo; a conversão sempre gera 240 arquivos por variante:
npm run frames -- /caminho/para/video.mp4
```

Se você já tiver uma sequência pronta, substitua os WEBP mantendo os nomes e atualize dimensões e origem no manifesto. O build normal não executa FFmpeg.

## Desenvolver

Requisitos: Node.js 22 ou superior e Python 3 para o servidor local.

```sh
npm ci
npm run build
npm run dev
```

O servidor local usa a porta 8000. Não requer chaves, serviços pagos ou backend.

Arquivos principais:

- `index.html`: conteúdo, estrutura e protótipo Aura.
- `assets/styles.css`: layout responsivo e identidade visual.
- `src/main.js`: interação com Motion e carregamento dos players.
- `src/reel.jsx`: composição e player Remotion.
- `frame.html`: composição GSAP/HyperFrames.
- `scripts/build.mjs`: bundle ESM, divisão dos players, fontes e otimização das imagens.

As dependências têm versões exatas e lockfile. Bibliotecas, fontes, imagens e runtime são servidos pelo próprio site; o visitante não depende de CDNs para executar as demonstrações. Consulte `THIRD_PARTY_NOTICES.md` para fontes e licenças.

## Validar

```sh
npm run build
npm run check
```

O check valida recursos locais, limite do JavaScript inicial, separação dos players e a composição pelo linter oficial do HyperFrames.

O teste funcional usa Python Playwright e Chromium:

```sh
# Terminal 1, na pasta do projeto
python3 -m http.server 8000

# Terminal 2, com Playwright e Chromium disponíveis
PORTFOLIO_URL=http://127.0.0.1:8000/ CHROMIUM_PATH=/usr/bin/chromium python3 tests/browser_smoke.py
PORTFOLIO_URL=http://127.0.0.1:8000/ CHROMIUM_PATH=/usr/bin/chromium python3 tests/scroll_sequence.py
```

O teste cobre teclado, abas, quantidades, reset, foco, carregamento tardio, reprodução Remotion, busca e reprodução HyperFrames, ausência de erros de runtime e layout em 320, 390, 768, 1024 e 1440 pixels. O teste da sequência verifica os extremos e pontos intermediários na ida e volta, sticky, troca de orientação, limite de memória, preferência de movimento reduzido, independência do bundle principal, fallback sem JavaScript e frames indisponíveis. As capturas são gravadas em `/tmp/wunder-v2-*.png` e `/tmp/wunder-scroll-*.png`.

## GitHub Pages

Mantenha **Settings → Pages → Deploy from a branch → main → / (root)**.

Após alterar o código, execute `npm ci`, `npm run build` e `npm run check`, e envie também os arquivos compilados de `assets/dist/`, `assets/vendor/`, `assets/fonts/` e as imagens otimizadas para `main`. Inclua também `assets/logo-scroll.js`, `assets/logo-scroll.css` e `assets/logo-sequence/`, que são servidos diretamente. Esses arquivos são versionados para que o Pages publique diretamente, sem workflow personalizado. `.nojekyll` mantém o site estático. Os caminhos relativos suportam `/Portfolio.io/`.

Cada push para `main` dispara o deploy padrão do GitHub Pages. O envio do commit e a conclusão do deploy são etapas diferentes; acompanhe **Actions → pages build and deployment**.

## Vitrine de sites

O catálogo em `#trabalhos` apresenta cinco conceitos autorais: Aura Audio (loja), Serena (clínica), Brasa (restaurante), Forma (imóveis) e Orbit (serviços). Cada prévia abre uma página HTML real em `concepts/`, com navegação, conteúdo e contato contextual pelo WhatsApp. As marcas são fictícias e os exemplos não representam trabalhos de clientes. Não há checkout, reservas ou agendamento real nesses conceitos; essas funcionalidades são possibilidades de escopo.

- `assets/showcase.css`: fundos, catálogo e adaptação responsiva.
- `assets/showcase.js`: filtros acessíveis por segmento, sem dependências; sem JavaScript, todos os conceitos continuam disponíveis.
- `concepts/concepts.css` e `concepts/*.html`: identidades e páginas dos exemplos.
- `assets/showcase/`: imagens locais otimizadas e capturas reais das páginas.

Para verificar os filtros, a navegação, os contatos, o layout de 320 a 1440 pixels e a experiência sem JavaScript, com o servidor local iniciado:

```sh
PORTFOLIO_URL=http://127.0.0.1:8000/ python3 tests/showcase.py
```

Ao mudar o visual dos conceitos, atualize as capturas com Python Playwright e Chromium disponíveis:

```sh
PORTFOLIO_URL=http://127.0.0.1:8000/ python3 scripts/capture-concepts.py
node --input-type=module - <<'JS'
import sharp from 'sharp';
for (const slug of ['aura', 'serena', 'brasa', 'forma', 'orbit']) {
  await sharp(`/tmp/wunder-concept-captures/${slug}.png`)
    .webp({ quality: 88 })
    .toFile(`assets/showcase/${slug}-preview.webp`);
}
JS
```

As páginas e imagens de `concepts/` e `assets/showcase/` também são versionadas e publicadas diretamente pelo Pages. A sequência do logo continua em canvas, sem barra de progresso visual.
