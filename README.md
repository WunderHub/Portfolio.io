# WunderHub

Portfólio de Kauê Ribeiro com design, desenvolvimento e experiências de movimento. Publicação: <https://wunderhub.github.io/Portfolio.io/>.

Os trabalhos são **estudos autorais**, não projetos de clientes. Aura é um produto fictício com imagem conceitual gerada para a demonstração; seus controles não realizam compras. O contato real é o WhatsApp **+55 (11) 95930-0903**.

## Experiências implementadas

- **Aura Audio:** protótipo de interface de produto com abas acessíveis, quantidade, seleção e reset. Motion dá feedback às interações.
- **Frame:** composição HTML de 10 segundos, com timeline GSAP e player HyperFrames. Permite reproduzir, pausar e buscar qualquer instante.
- **Filme WunderHub:** composição Remotion de 14 segundos com controles de reprodução, executada em React no navegador. Não é um MP4 pré-renderizado.

As duas experiências de vídeo são silenciosas e carregadas somente quando abertas. O filme não inicia automaticamente quando o visitante prefere movimento reduzido. Fechar a janela interrompe e desmonta o player. Texto, links, WhatsApp e acordeões funcionam sem JavaScript.

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
```

O teste cobre teclado, abas, quantidades, reset, foco, carregamento tardio, reprodução Remotion, busca e reprodução HyperFrames, ausência de erros de runtime e layout em 320, 390, 768, 1024 e 1440 pixels. As capturas são gravadas em `/tmp/wunder-v2-*.png`.

## GitHub Pages

Mantenha **Settings → Pages → Deploy from a branch → main → / (root)**.

Após alterar o código, execute `npm ci`, `npm run build` e `npm run check`, e envie também os arquivos compilados de `assets/dist/`, `assets/vendor/`, `assets/fonts/` e as imagens otimizadas para `main`. Eles são versionados para que o Pages publique diretamente, sem workflow personalizado. `.nojekyll` mantém o site estático. Os caminhos relativos suportam `/Portfolio.io/`.

Cada push para `main` dispara o deploy padrão do GitHub Pages. O envio do commit e a conclusão do deploy são etapas diferentes; acompanhe **Actions → pages build and deployment**.
