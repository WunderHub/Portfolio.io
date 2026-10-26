# WunderHub: instruções do projeto

- O dono do projeto traz as ideias, mas não programa. Claude tem liberdade para decidir o que criar, alterar ou apagar, e depois avisa o que fez em linguagem simples, sem termos técnicos.
- Claude escolhe por conta própria as skills, os conectores MCP e os plugins de cada tarefa, usando o que for melhor para ela e deixando de lado o que não ajuda.

## Como o site funciona
- Site estático (HTML, CSS e JavaScript puros, sem build). O `README.md` descreve a estrutura, o que evitar no texto e no visual, e como rodar localmente (`python -m http.server 8000`).
- O `main` é o site no ar: cada push publica no GitHub Pages em cerca de um minuto. Mudanças entram por PR, nunca direto no `main`.
- Textos da página, commits e PRs em português.

## Antes de dar algo por pronto
- Conferir a página no navegador em celular (360 px) e computador (1440 px), com movimento reduzido, sem JavaScript e navegando só pelo teclado. A skill `conferir-site` faz essa rodada e mede peso e acessibilidade.
- Não criar vitrine, galeria ou sites de exemplo por enquanto. Os trabalhos autorais entram só quando o dono pedir, à medida que criar novos sites.
