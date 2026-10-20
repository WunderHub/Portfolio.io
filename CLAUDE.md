# WunderHub: instruções do projeto

## Fluxo de trabalho
- Um agente por vez, com contexto reduzido (trechos de especificação em `wunderhub-experiment/docs/specs/`), sempre continuando a partir do trabalho existente.

## Política de modelos
Use sempre o modelo de menor custo que entregue qualidade profissional. Nunca sacrifique qualidade visual, criatividade, desempenho, animações ou funcionalidades para economizar.

- **Haiku:** tarefas simples, como pesquisas pontuais, localizar arquivos, verificações rápidas e operações de baixa complexidade.
- **Sonnet (padrão):** implementação frontend, componentes, animações, estilização, responsividade, testes e correções comuns.
- **Opus:** só para decisões arquiteturais complexas, problemas técnicos difíceis, planejamento avançado e revisões que exijam essa capacidade (por exemplo, a crítica de direção de arte). Não use Opus onde Sonnet resolve.

Em subagentes e workflows, defina o modelo de cada tarefa (opção `model`) sempre que disponível. Evite alternar modelos sem necessidade: cada troca reconstrói o cache. Mantenha o mesmo modelo do início ao fim de uma sessão ou de um agente.
