---
name: conferir-site
description: Confere a página da WunderHub antes de dar algo por pronto. Abre o site em celular (360 px) e computador (1440 px), com movimento reduzido e sem JavaScript, mede o peso baixado, procura erros, roda o axe (acessibilidade), percorre a página com Tab e tira capturas. Com --lighthouse, também dá as notas do Lighthouse no celular. Use antes de abrir ou atualizar um PR que mexa na página.
---

# Conferir o site

O CLAUDE.md pede que toda mudança seja vista em celular e computador, com movimento reduzido, sem JavaScript e só pelo teclado. Este script faz essa rodada de uma vez.

## Como rodar

Na raiz do repositório:

```sh
node .claude/skills/conferir-site/conferir.mjs                 # serve a pasta atual e confere
node .claude/skills/conferir-site/conferir.mjs previa-x/       # confere outra pasta
node .claude/skills/conferir-site/conferir.mjs https://wunderhub.github.io/Portfolio.io/   # confere o site no ar
node .claude/skills/conferir-site/conferir.mjs --lighthouse --saida /caminho/para/capturas
```

Leva cerca de 1 minuto (2 a 3 com `--lighthouse`). Usa o Playwright e o Chromium que já vêm no ambiente. O axe-core e o Lighthouse são baixados na primeira vez para `~/.cache/conferir-site/`, fora do repositório.

## O que sai

- `relatorio.md` na pasta de saída (padrão: pasta temporária do sistema), com uma linha por situação: peso baixado, erros no console, problemas de acessibilidade, rolagem lateral indesejada e a ordem do Tab.
- Capturas `<situação>-topo.png` e `<situação>-inteira.png`. Olhe as capturas: o script não julga se o visual está bom.

## Como ler

- **Peso no celular**: a análise dos premiados do Awwwards sugere ficar abaixo de ~3 MB no celular. O computador pode passar disso por causa do vídeo do topo.
- **Sem JS**: o texto inteiro precisa aparecer. O axe não roda nessa situação.
- **Teclado**: "sem anel de foco" quer dizer que o item focado não mostra contorno; "fora da tela" quer dizer que o foco foi para algo que não aparece. Os dois precisam ser zero.
- O Lighthouse simula um celular em 4G lento; use as notas para comparar antes e depois, não como verdade absoluta.
