# WunderHub

Portfólio de Kauê Ribeiro: design e desenvolvimento de landing pages, sites institucionais e lojas virtuais. Publicação: <https://wunderhub.github.io/Portfolio.io/>.

Os trabalhos da vitrine são **conceitos autorais com marcas fictícias**, não projetos de clientes. O contato real é o WhatsApp **+55 (11) 95930-0903**.

## Estrutura

Site estático em HTML, CSS e JavaScript puros. Não há build nem dependências.

- `index.html`: página inicial (hero, vitrine, serviços, processo, sobre, dúvidas e contato).
- `assets/site.css`: identidade visual e layout responsivo.
- `assets/site.js`: interações (menu, revelação no scroll, cartões empilhados, inclinação 3D, prévia ao vivo).
- `assets/brand/`: símbolo em alta resolução (`w-mark.webp`), imagem de compartilhamento (`og-image.jpg`), ícone e o vídeo original do logo.
- `assets/work/`: capturas dos conceitos usadas na vitrine (página inteira no computador e primeira tela no celular).
- `concepts/`: as páginas reais dos cinco conceitos (Brasa, Aura Audio, Forma, Serena e Orbit) e `concepts.css`.
- `scripts/capture-work.mjs`: gera novamente as capturas de `assets/work/`.

Fontes da página inicial: Archivo e JetBrains Mono, via Google Fonts. Os conceitos usam Sora e DM Sans, servidas de `assets/fonts/`.

## Rodar localmente

```sh
python -m http.server 8000
```

Abra <http://127.0.0.1:8000/>.

## Prévia ao vivo

Os botões **Testar ao vivo**, o navegador e o celular de cada cartão abrem a página do conceito numa janela com opção de ver no computador ou no celular. Sem JavaScript, eles funcionam como links comuns para `concepts/`.

Dentro da prévia, links externos (WhatsApp) abrem em outra aba e o link de voltar à vitrine fecha a janela.

## Atualizar as capturas da vitrine

Com o servidor local rodando, em outro terminal:

```sh
node scripts/capture-work.mjs            # todos os conceitos
node scripts/capture-work.mjs brasa      # apenas um
```

O script usa o Chrome (ou Edge) instalado. Se ele não for encontrado, defina `CHROME_PATH`. Se a altura de uma página mudar, atualize `width` e `height` da imagem correspondente em `index.html`.

## Adicionar um conceito

1. Crie a página em `concepts/novo.html` seguindo as existentes.
2. Rode `node scripts/capture-work.mjs novo`.
3. Duplique um `<li class="stack-item">` em `index.html`, ajuste textos, cores (`--card`, `--card-ink`, `--card-soft`), links e o índice `--i`.

## GitHub Pages

Mantenha **Settings → Pages → Deploy from a branch → main → / (root)**. Cada push para `main` publica o site; acompanhe em **Actions → pages build and deployment**. O arquivo `.nojekyll` mantém o site estático e os caminhos relativos funcionam em `/Portfolio.io/`.
