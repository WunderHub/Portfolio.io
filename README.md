# WunderHub — Portfólio

Landing page responsiva em português, feita com HTML, CSS e JavaScript e preparada para GitHub Pages. Não precisa instalar dependências nem executar um build.

## Executar localmente

Na pasta do repositório:

```sh
python3 -m http.server 8000
```

Abra a porta 8000 no seu navegador local. O conteúdo e a navegação também funcionam sem JavaScript.

## Personalizar

- `index.html`: nome, apresentação, projeto, descrição e links de contato.
- `assets/styles.css`: paleta, tipografia, espaçamento e estilos para celular.
- `assets/logo.png`: versão do símbolo com fundo transparente, preparada a partir do logo enviado pelo proprietário e usada também como ícone da página.
- `assets/main.js`: animação inicial opcional.

A marca é **WunderHub**. Os botões principais levam ao WhatsApp **+55 (11) 95930-0903**, usando `https://wa.me/5511959300903`. O único projeto apresentado é este próprio portfólio. O símbolo foi preparado a partir do logo enviado pelo proprietário, removendo o fundo e os textos para uso na interface. A paleta usa preto, vermelho e prata. Os textos de apresentação e os demais projetos ainda podem ser personalizados.

## Publicar no GitHub Pages

O Pages está configurado para **Deploy from a branch → main → / (root)**.

1. Envie `index.html`, `assets/` e `.nojekyll` para a branch `main` de `WunderHub/Portfolio.io`.
2. O GitHub executará automaticamente a publicação. Acompanhe em **Actions → pages build and deployment**.
3. Após a execução terminar, acesse `https://wunderhub.github.io/Portfolio.io/`.

Atualizações enviadas para `main` publicam uma nova versão automaticamente. Não é necessário configurar um workflow próprio nem um domínio personalizado. O arquivo `.nojekyll` permite servir os arquivos estáticos diretamente, e os caminhos relativos funcionam no subdiretório `/Portfolio.io/`.

Não há formulário com backend, integração de e-mail ou ferramentas de rastreamento. Os botões abrem uma conversa no WhatsApp.

## Validação desta versão

Verificado em Chromium em larguras de 320, 390, 768, 1024 e 1440 pixels: carregamento dos recursos, ausência de transbordamento horizontal, links internos e atalho de teclado para o conteúdo. Também foi verificado o funcionamento sem JavaScript e com preferência por movimento reduzido. A publicação remota precisa ser validada após o deploy automático do GitHub.
