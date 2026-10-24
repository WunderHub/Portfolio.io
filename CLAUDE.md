# WunderHub: instruções do projeto

## Fluxo de trabalho
- Um agente por vez, com contexto reduzido, sempre continuando a partir do trabalho existente. Quando houver trechos de especificação (por exemplo em `wunderhub-experiment/docs/specs/`), passe ao agente só o trecho da frente em que ele vai trabalhar.

## Política de modelos
Use sempre o modelo de menor custo que entregue qualidade profissional. Nunca sacrifique qualidade visual, criatividade, desempenho, animações ou funcionalidades para economizar.

- **Haiku:** tarefas simples, como pesquisas pontuais, localizar arquivos, verificações rápidas e operações de baixa complexidade.
- **Sonnet (padrão):** implementação frontend, componentes, animações, estilização, responsividade, testes e correções comuns.
- **Opus:** só para decisões arquiteturais complexas, problemas técnicos difíceis, planejamento avançado e revisões que exijam essa capacidade (por exemplo, a crítica de direção de arte). Não use Opus onde Sonnet resolve.

Em subagentes e workflows, defina o modelo de cada tarefa (opção `model`) sempre que disponível. Evite alternar modelos sem necessidade: cada troca reconstrói o cache. Mantenha o mesmo modelo do início ao fim de uma sessão ou de um agente.

## Política de recursos (skills, conectores MCP, plugins)

### Princípios
- Use só o que a tarefa atual exige. Não invoque um conector só porque ele está disponível, não repita a mesma função com duas ferramentas e reutilize resultados já obtidos.
- Ferramentas MCP deferidas não custam tokens ativos. O custo está nas skills listadas, nas ferramentas MCP carregadas (via ToolSearch) e nas instruções dos servidores. Por isso, carregue uma ferramenta deferida só no momento em que for usá-la, e todas as que a etapa precisar numa única chamada.
- Reavalie os recursos só numa mudança de fase (por exemplo, de construção para revisão final ou para o showreel), não a cada mensagem.

### Como decidir por tarefa
Antes de começar, classifique a tarefa e use a linha correspondente. Se ela cruzar duas linhas, some só o que cada uma pede.

| Tipo de tarefa | Recursos a usar | Não usar |
| --- | --- | --- |
| Código do site (HTML, CSS, JS, animação) | Bash/Read/Edit/Grep/Glob, skills `frontend-design` e `motion` | Figma, Magnific, navegadores externos |
| Ver ou testar a página | Playwright local (já instalado) e a skill `run` | Claude in Chrome, navegador embutido, a menos que o dono peça |
| Faltou uma imagem ou textura | Magnific, carregando só as ferramentas da geração necessária | Gerar imagem "para testar" sem uso definido |
| O dono mandou um link do Figma | Conector Figma e a skill dele indicada pelo servidor | Figma sem link |
| Showreel em vídeo | Família `hyperframes*`, `media-use`, `general-video` ou `motion-graphics` | Outras skills de vídeo (ficam desligadas) |
| Revisão final antes do PR | `code-review`, `security-review` ou `simplify` | Revisão a cada commit |
| GitHub (PR, CI, comentários) | GitHub MCP | `gh`/API direta |
| Página para mostrar ao dono | Skills `artifact-*` | Artifact para algo que cabe numa resposta curta |

### Estado de cada recurso
O estado das skills está versionado em `.claude/settings.json` (`skillOverrides`), para valer também nas sessões na nuvem:
- **Ligadas (padrão):** `frontend-design`, `motion`, `run` e as demais que não aparecem no arquivo.
- **`name-only` (sob demanda):** revisão (`code-review`, `security-review`, `simplify`), `artifact-*`, skills de navegador, `find-skills`, `skill-creator`, `deep-research` e a família Hyperframes do showreel. Aparecem só pelo nome; use quando a tabela acima pedir.
- **`off` (irrelevantes neste projeto):** Office e PDF (`docx`, `xlsx`, `pptx`, `pdf`), `docs`, `google-workspace`, `expo-skill-eval`, `material-3`, `dataviz`, `claude-api`, `agent-tools` (host bloqueado pelo proxy), `morning`, `import-memory`, `setup-writing-style`, `computer-use` e as skills de vídeo que não servem ao showreel.
- **Conectores da conta (Expo, Figma, Magnific, Claude Docs, Claude in Chrome):** não dá para desligá-los pelo repositório. Expo não tem uso aqui: nunca carregue as ferramentas dele. Figma e Magnific seguem a tabela acima.
- **Mobbin** segue proibido pelo briefing.

### Limites
- Desativar uma skill aqui é local ao projeto e reversível: para reativar, apague a entrada em `.claude/settings.json` ou use `/skills`.
- Conectores da conta, plugins e configuração global só mudam com autorização do dono. Nada é desinstalado nem apagado.
- Se uma tarefa precisar de um recurso marcado como `off`, avise o dono e peça para reativá-lo, em vez de contornar com outra ferramenta.
