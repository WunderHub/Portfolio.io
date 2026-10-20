# WunderHub: instruções do projeto

## Fluxo de trabalho
- Um agente por vez, com contexto reduzido (trechos de especificação em `wunderhub-experiment/docs/specs/`), sempre continuando a partir do trabalho existente.

## Política de modelos
Use sempre o modelo de menor custo que entregue qualidade profissional. Nunca sacrifique qualidade visual, criatividade, desempenho, animações ou funcionalidades para economizar.

- **Haiku:** tarefas simples, como pesquisas pontuais, localizar arquivos, verificações rápidas e operações de baixa complexidade.
- **Sonnet (padrão):** implementação frontend, componentes, animações, estilização, responsividade, testes e correções comuns.
- **Opus:** só para decisões arquiteturais complexas, problemas técnicos difíceis, planejamento avançado e revisões que exijam essa capacidade (por exemplo, a crítica de direção de arte). Não use Opus onde Sonnet resolve.

Em subagentes e workflows, defina o modelo de cada tarefa (opção `model`) sempre que disponível. Evite alternar modelos sem necessidade: cada troca reconstrói o cache. Mantenha o mesmo modelo do início ao fim de uma sessão ou de um agente.

## Política de recursos (skills, conectores, plugins)
- Use só o que a tarefa atual exige. Não invoque conector só porque está disponível, não repita a mesma função com duas ferramentas, reutilize resultados já obtidos e só reavalie os recursos numa mudança de fase.
- Ferramentas MCP deferidas não custam tokens ativos; o custo ativo medido está nas skills listadas, nas ferramentas MCP carregadas e nas instruções dos servidores.
- **Essenciais:** Bash/Read/Edit/Grep/Glob, Agent, Workflow, GitHub MCP, Playwright local (testes), skills `motion` e `frontend-design`.
- **Sob demanda:** família Hyperframes e `media-use` (etapa do showreel), Magnific (só se faltar imagem), `code-review`/`security-review` (revisão final), Figma (só se houver link), skills de navegador, `artifact-*`. Ficam só com o nome listado (`name-only`) em `.claude/settings.local.json`; para reativar, apague a entrada ou use `/skills`.
- **Redundantes ou irrelevantes (skills desligadas só neste projeto):** Office/PDF/Docs/Google, Expo, Material 3, vídeos que não são showreel, `dataviz`, `claude-api` e afins. Mobbin segue proibido pelo briefing.
- Desativação só local ao projeto e reversível; conectores da conta, plugins e configuração global exigem autorização do dono. Nada é desinstalado nem apagado.
