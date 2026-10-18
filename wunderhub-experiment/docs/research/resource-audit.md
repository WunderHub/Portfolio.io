# Auditoria de recursos da sessão (bruta, 2026-10-18)

Gerada por 5 agentes em paralelo. Texto original dos agentes, sem edição.



######## skills:design+motion
- [skill] anthropic-skills:frontend-design | available=True
  evidence: Loaded with Skill. The full SKILL.md (9.4 KB) was returned. Its folder contains only SKILL.md and LICENSE.txt, so there are no internal references to read.
  applicability: High. It gives the method for direction (plan tokens, then check against the brief, then build, then critique), lists the AI-generated looks to avoid, and covers type, hero, motion and copy rules. It applies directly to a static, distinctive WunderHub portfolio.
- [skill] anthropic-skills:motion | available=True
  evidence: Loaded with Skill. Only SKILL.md (5.2 KB) exists on disk. The subfolders it points to (best-practices/, codex/, css-spring/, performance-audit/, transition-preview/) are NOT present: find in the skill folder returned only ./SKILL.md. ListMcpResourcesTool shows only the Figma (119) and Magnific (16) servers. There is no Motion/Motion+ MCP server, so docs search, the CSS spring generator, MotionScore and the transition editor are unavailable.
  applicability: Partial. The policy rules from SKILL.md still apply (tiers, no motion-plus, upgrades, never install framer-motion alongside motion). The API guidance below was checked directly against the package types (motion@14.3.0), not against the skill's references.
- [conector] Motion MCP / Motion+ MCP server | available=False
  evidence: No mcp__motion* tool is in the tool list or found by ToolSearch('motion'), which only returned Figma and Magnific tools. ListMcpResourcesTool shows no Motion server.
  applicability: Not available. Per the skill, tell the user the Motion MCP server is not connected and point to https://motion.dev/docs/ai-kit. Do not reconstruct the audit methodology or the gated source code.
- [cli] npm registry / package motion | available=True
  evidence: Ran `npm view motion`: latest=14.3.0, modified 2026-10-15, MIT license, deps framer-motion@14.3.0. `npm pack` worked and was extracted to /tmp/wh-audit/pkg/x/package. dist/motion.js is a 154 KB self-contained UMD bundle that exposes window.Motion. curl to cdn.jsdelivr.net returned 403 and connect_rejected from the proxy. unpkg and cdnjs returned 000 (blocked). registry.npmjs.org returned 200.
  applicability: High. Vendor the UMD bundle into the project (copy /tmp/wh-audit/pkg/x/package/dist/motion.js) instead of using a CDN. The ES build (dist/es/index.mjs) re-exports 'framer-motion/dom' and does not run in the browser without a bundler.
- [conector] Figma MCP resources: figma-implement-motion (framework-recommendations.md, gotchas.md) | available=True
  evidence: Read with ReadMcpResourceTool as a supplementary source, since the motion skill's references are missing. Both returned full text.
  applicability: Medium. They give general performance and gotcha rules, summarised below and marked [Figma ref]. The rest is Figma-specific.

GUIDANCE:
FRONTEND-DESIGN (SKILL.md em sua totalidade)
Postura: líder de design de estúdio; cliente já rejeitou propostas genéricas; escolhas opinativas de paleta/tipo/layout específicas do briefing; risco estético se justificado. Ancorar no assunto: definir sujeito, público e tarefa principal; o vernáculo/materiais do setor (aqui: pequenos negócios locais) geram as escolhas visuais; usar conteúdo real do briefing.
Hero: abrir com a coisa mais característica do mundo do assunto (headline, imagem, animação, demo, interação). Evitar o default "número grande + label pequena + stats + acento em gradiente".
Tipografia carrega a personalidade: 1 família ou 2 claramente distintas, nada de defaults; escala segundo The Elements of Typographic Style, pesos/larguras/espaçamento intencionais; tipo como elemento ativo do design. Linhas <80 caracteres; serifa pode ser um pouco mais longa e com mais line-height. Proibido: destacar uma única palavra do título (itálico/negrito/cor), labels em CAIXA ALTA, labels desnecessários acima do conteúdo.
Estrutura = informação: bordas, numeração, eyebrows, divisores só se codificam informação; 01/02/03 apenas para sequência real (processo, timeline).
Motion não disparado pelo usuário: raro e deliberado; UM momento orquestrado (um page-load ou um reveal). Fade+slide-up em cada seção e hover em todo card = cara de IA. Motion em resposta a ação (abrir, expandir, confirmar) é bem-vindo quando mostra o que mudou.
Clichês a evitar quando o briefing deixa o eixo livre (o texto do briefing sempre vence): (1) fundo creme ~#F4F1EA + serifa display + terracota ~#D97757; (2) quase-preto + um acento verde-ácido/vermelhão; (3) broadsheet com hairlines, radius zero, colunas densas; (4) kit SaaS: cards idênticos arredondados, mesmo radius, sombra rgba(0,0,0,.1), gradientes decorativos; (5) chrome de template: eyebrow CAPS espaçado, metadados "A · B · C", "PALAVRA — fragmento", #0B0B0B/#111 no lugar de preto, monoespaçada em labels pequenos, "→" em links/botões.
Processo em 2 passes: (a) plano compacto de tokens: 4–6 cores hex nomeadas; fontes e papéis; conceito de layout em prosa de 1 frase + wireframes ASCII comparados, com regra de alinhamento; princípios. (b) Revisar contra o briefing: se algo sairia igual para um prompt similar, revisar e declarar o que mudou e por quê. Só então codar. Cuidado com especificidade CSS (ex.: .section vs .cta anulando padding/margin).
Contenção: ousadia em um só lugar; resto quieto. Piso de qualidade sem anunciar: responsivo até mobile, foco de teclado visível, reduced motion respeitado, contraste acessível, paleta harmônica. Autocrítica com screenshots; "tirar um acessório" (Chanel); anotar o que já tentou.
Copy: palavras só para entender/usar; perspectiva do usuário, linguagem simples, voz ativa; CTA diz o que acontece ("Pedir orçamento", não "Enviar") e o mesmo verbo segue no fluxo; erros explicam o que houve e como resolver, sem pedir desculpas; vazio convida à ação; sentence case, sem enchimento.

MOTION (só SKILL.md disponível; referências e MCP ausentes)
Regras da skill: best-practices/ seria autossuficiente, mas não está no disco. Busca de docs, gerador de springs CSS linear(), editor de transição e auditoria MotionScore exigem o servidor Motion MCP; MotionScore e código-fonte de exemplos são Motion+ (motion://skills/performance-audit). Não estão conectados, logo NÃO há sintaxe de ferramenta a usar; avisar o usuário e apontar https://motion.dev/docs/ai-kit; não reconstruir a metodologia gated. Não importar motion-plus (splitText, Ticker, AnimateNumber, Typewriter, ScrambleText, Cursor) se não estiver instalado, nem instalar sem acordo do usuário. Não citar Motion+ para o que o pacote free cobre. Upgrade: ler a versão instalada, buscar "upgrade" (js/upgrade-guide), seguir em ordem; nunca ter framer-motion e motion juntos. A skill cita "Motion 12" só como exemplo de upgrade e não recomenda versão.
Versão verificada no npm: motion@14.3.0 (latest, 2026-10-15, MIT). As CDNs estão bloqueadas neste sandbox, então: vendorizar /tmp/wh-audit/pkg/x/package/dist/motion.js (UMD autocontido, global window.Motion) em wunderhub-experiment/assets/vendor/motion-14.3.0.js e carregar com <script src defer>; depois `const { animate, scroll, inView, stagger, spring, hover, press } = window.Motion;`. Se usar CDN em produção, fixar a versão exata.
Exports confirmados no bundle: animate, animateMini, animateView, scroll, inView, stagger, spring, hover, press, resize, frame, cancelFrame, delay, cubicBezier, easeIn/easeOut/easeInOut, backOut, anticipate, steps, transform, interpolate, mix, wrap, clamp, prefersReducedMotion, MotionGlobalConfig. NÃO existe export `timeline`: a sequência é feita com animate([[el, kf, opts], ...]) (conhecimento geral, não verificado na skill).
Assinaturas (motion-dom/framer-motion 14.3.0 .d.ts):
- inView(elOrSelector, (element, entry) => void | onLeave, { root, margin, amount: "some"|"all"|0–1 }) → função stop.
- scroll(onScroll(progress, info) | animação, { source, container, target, axis: "x"|"y", offset }) → cancel. Ex.: scroll(animate(el,{y:[0,-80]}), { target: sec, offset: ["start end","end start"] }).
- stagger(duration, { startDelay, from: "first"|"last"|"center"|"edges"|"random"|índice, ease, grid: [cols, rows] }), usado em delay: stagger(0.05).
- spring(optionsOrVisualDuration, bounce); opções: stiffness, damping, mass, bounce, visualDuration, restSpeed, restDelta. Em animate: { type: spring, visualDuration: 0.4, bounce: 0.2 }.
- hover(el, (el, ev) => onEnd?, opts); press(el, (el, ev) => (ev,{success}) => …); resize(cb) | resize(el, cb); animateView(update, opts) usa View Transitions.
- MotionGlobalConfig.skipAnimations: boolean (existe nos tipos).
Performance [Figma ref + geral]: animar só transform/opacity (x, y, scale, rotate, opacity); evitar width/height/top/left. will-change apenas em elementos ativamente animando, removendo depois. Nunca aproximar spring com cubic-bezier. O transform inline do Motion sobrescreve transforms de classe (ex.: translate de centralização): pôr o posicionamento estático num wrapper e a animação num filho. Não animar elementos display:contents. Cores saturadas distantes interpolam turvo em RGB: preferir OKLCH. Duração 0: aplicar o estado final como estilo estático. Cancelar inView/scroll ao desmontar.
Reduced motion (piso exigido pela frontend-design; detalhes da skill indisponíveis): checar matchMedia('(prefers-reduced-motion: reduce)') ou Motion.prefersReducedMotion; com reduce, trocar deslocamentos por fades curtos ou setar MotionGlobalConfig.skipAnimations = true; espelhar em CSS @media (prefers-reduced-motion: reduce). Conteúdo visível sem JS: só aplicar estados iniciais ocultos via classe .js no <html>.
Springs CSS linear(): o gerador da skill não está disponível. Alternativa (não verificada): amostrar o gerador spring() do pacote vendorizado em Node para gerar uma string linear(...), ou usar Motion em JS.


######## skills:outras
- [skill] anthropic-skills:agent-tools | available=False
  evidence: Skill carregada (SKILL.md documenta `curl -fsSL https://cli.inference.sh | sh` + `belt login`; o CLI hoje se chama `belt`). `which infsh`, `which belt` e `which inferencesh` retornaram exit=1 (não instalados). Tentei o instalador baixando para arquivo (sem pipe para sh), com timeout 60s: `curl -fsSL https://cli.inference.sh` → `curl: (22) ... error: 403`. Testei também o host da instalação manual, `https://dist.inference.sh/cli/manifest.json` → 403. Com `curl -v`: `CONNECT cli.inference.sh:443` → `HTTP/1.1 403 Forbidden`, `CONNECT tunnel failed, response 403`. O status do proxy registra `cli.inference.sh:443` e `dist.inference.sh:443`: 'gateway answered 403 to CONNECT (policy denial or upstream failure)'. Nada foi instalado. Não usei nem pedi chave de API (o CLI exigiria `belt login`).
  applicability: Inutilizável aqui: o proxy bloqueia o host, e o serviço exige login/conta com chave de API. Ele serviria para gerar imagem/vídeo/3D para o hero ou para mockups. Sem ele, os assets precisam ser CSS/SVG/canvas próprios ou vir de outra fonte.
- [skill] anthropic-skills:find-skills | available=True
  evidence: `npx -y skills` funciona (versão 1.7.2; registry.npmjs.org está no no_proxy). Rodei `npx skills find` para: webgl, threejs, playwright, visual regression, accessibility, lighthouse e web performance. Todos retornaram 'No skills found' com exit 0. É FALSO NEGATIVO: `curl https://skills.sh/` e `https://skills.sh/api/search` dão `CONNECT tunnel failed, response 403`, e o status do proxy registra skills.sh:443 negado. O CLI engole o erro. `gh api repos/anthropics/skills/...` → 403 'GitHub access to this repository is not enabled for this session'. Fallback que funcionou: `git clone --depth 1` (somente leitura, em /tmp/wh-audit/repos) de anthropics/skills (20 SKILL.md), vercel-labs/agent-skills (9) e ComposioHQ/awesome-claude-skills (864). Fiz grep por three.js/webgl, playwright, wcag/axe, lighthouse/web vitals. NADA FOI INSTALADO.
  applicability: Útil só para descoberta via git clone; as contagens de instalação do skills.sh não puderam ser verificadas (o passo 4 da skill ficou bloqueado). Candidatos relevantes estão no campo guidance. Não há skill de WebGL/three.js, de acessibilidade dedicada nem de Lighthouse nesses índices.
- [skill] anthropic-skills:material-3 | available=True
  evidence: Skill carregada. No disco só existe SKILL.md (31 KB). O diretório `references/` (color-system, typography-and-shape, component-catalog, layout etc.) NÃO está sincronizado: `ls .../material-3/` mostra apenas SKILL.md. A análise vale só para o conteúdo do SKILL.md. Ele se declara Compose-first. @material/web está em modo manutenção e M3 Expressive não existe na web.
  applicability: Aplicável como fonte de PRINCÍPIOS (tokens semânticos, pares de contraste, hierarquia tipográfica, curvas de motion, acessibilidade, layout por largura). Não convém como biblioteca: @material/web depende de JS/web components, impõe a estética Google e conflita com uma identidade autoral. O que é transferível e o que é exclusivo de Android/Compose está no campo guidance.
- [skill] anthropic-skills:expo-skill-eval | available=True
  evidence: Skill carregada; no disco só existe SKILL.md (sem `scripts/`, sem `references/runtime-matrix.md`, sem `agents/visual-grader.md`). A skill avalia skills em `plugins/expo/skills/` e exige macOS + Xcode (simuladores iOS), Android SDK com AVD e bun. Ambiente: `uname` = Linux; xcrun, adb e emulator ausentes; bun presente em /root/.bun/bin/bun.
  applicability: NÃO se aplica. Ela serve para avaliar skills Expo/React Native (trigger, código, screenshots em Expo Go), não um site estático sem Expo. Além disso, os pré-requisitos (macOS/Xcode/Android) e os scripts dela não existem neste ambiente. A única ideia aproveitável é o método: comparar com e sem a skill e avaliar por screenshot. Isso dá para replicar com o Playwright local.

GUIDANCE:
MATERIAL-3: O QUE TRANSFERE PARA A WEB (só SKILL.md; references/ ausente)
1. Tokens semânticos em :root: cores definidas como papéis (primary/on-primary, surface/on-surface, on-surface-variant para texto secundário), nunca hex solto no componente. Dark mode = redefinir os mesmos tokens. Usar só pares on-X sobre X; combinações arbitrárias quebram o contraste.
2. Hierarquia por superfície tonal: a escala surface-container lowest → highest (e surface-dim/bright) dá profundidade sem sombra. Sombra só para separar do fundo movimentado, o que é útil sobre um fundo WebGL/animado. outline serve para bordas importantes (campos); outline-variant, para divisórias.
3. Tipografia por papéis: Display / Headline / Title / Body / Label (L/M/S), cada um com font, weight, size, line-height e tracking, mais variantes "emphasized" com peso maior. A ideia de papéis fixos se transfere; Roboto não precisa ser adotada.
4. Escala de forma fixa: 4/8/12/16/20/28/32/48px e full. Usar tokens de canto, não raios mágicos.
5. Elevação e interação: hover e foco sobem a elevação (níveis 4 e 5 servem só para isso), comunicada pelo tom da superfície. As opacidades exatas de state layer estão nos references não sincronizados, então não as cito.
6. Motion (fallback web oficial, já que molas não existem na web):
   - emphasized: cubic-bezier(0.2,0,0,1), 500ms;
   - entrada (emphasized decelerate): cubic-bezier(0.05,0.7,0.1,1), 400ms;
   - saída (emphasized accelerate): cubic-bezier(0.3,0,0.8,0.15), 200ms;
   - standard: 300ms; standard decelerate: (0,0,0,1), 250ms; standard accelerate: (0.3,0,1,1), 200ms.
   Regra útil: a saída é mais curta que a entrada.
7. Acessibilidade: contraste de 4.5:1 para texto normal e 3:1 para texto grande e bordas de UI; alvos de toque de ~48px; ordem de foco e teclado; ARIA. A noção de 3 níveis de contraste mapeia para @media (prefers-contrast: more).
8. Layout: quebras em ~600 / 840 / 1200 / 1600px. Em telas largas, limitar o conteúdo a 840–1040px (linhas infinitas são ilegíveis). Espaçamento em grade de 8px.

EXCLUSIVO DE ANDROID/COMPOSE (descartar): MaterialTheme, dynamicLight/DarkColorScheme (cor do wallpaper, API 31+), WindowInsets/edge-to-edge, @OptIn experimental, MotionScheme e física de molas, shape morphing, componentes Expressive (botões XS–XL, toggle, FAB menu), relógios/XR, predictive back, TalkBack/semantics e dobradiça de foldables. @material/web está em modo manutenção, usa web components que exigem JS (sem SSR) e não tem Expressive. Não recomendo para um portfólio com identidade própria.

FIND-SKILLS: ACHADOS (NADA INSTALADO)
- `npx skills find` devolve "No skills found" para tudo porque o skills.sh está bloqueado (403). As contagens de instalação não foram verificadas. Descoberta feita por git clone dos índices.
- anthropics/skills@webapp-testing: testes de apps web locais com Playwright, screenshots e logs do browser. Útil para QA visual do site. Scripts em Python Playwright; o módulo Python está AUSENTE, mas existem Playwright Node 1.56.1 global e Chromium em /opt/pw-browsers (PLAYWRIGHT_BROWSERS_PATH). Instalação: `npx skills add anthropics/skills@webapp-testing`
- vercel-labs/agent-skills@web-design-guidelines: revisão de UI/acessibilidade/UX contra as Web Interface Guidelines. Busca as regras em raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md, que respondeu HTTP 200 aqui. Instalação: `npx skills add vercel-labs/agent-skills@web-design-guidelines`
- lackeyjb/playwright-skill: citado no README do ComposioHQ/awesome-claude-skills como "Playwright Browser Automation". Não verificado (popularidade desconhecida); tratar com cautela.
- vercel-labs/agent-skills@vercel-optimize cita Core Web Vitals, mas depende de métricas de deploy na Vercel; não serve para auditoria Lighthouse local.
- Não há skill de WebGL/three.js, de acessibilidade dedicada (axe/WCAG) nem de Lighthouse nos 3 índices. Alternativa sem skill: Playwright local + Chromium.
- Skills já disponíveis na sessão e relevantes: anthropic-skills:motion (animação e auditoria de jank), anthropic-skills:frontend-design e anthropic-skills:built-in-browser.

INCIDENTE A REGISTRAR: um `cd` para a pasta references/ inexistente falhou, e o `grep -n ... *.md` seguinte rodou no cwd padrão /home/user/Portfolio.io. Ele casou 1 linha do README.md raiz (instrução de deploy do GitHub Pages). Foi acidental e o conteúdo não foi usado; depois disso usei apenas caminhos absolutos. Temporários ficam em /tmp/wh-audit/ (repos clonados em /tmp/wh-audit/repos).


######## hyperframes
- [cli] hyperframes CLI (npx -y hyperframes@0.8.171) | available=True
  evidence: `doctor`: Version 0.8.171 (latest), Node v22.22.0, FFmpeg/FFprobe 6.1.1 at /usr/bin. Na primeira execução: ✗ Chrome ('Chrome Headless Shell is required… Run: npx hyperframes browser ensure'), ✗ Docker running, ✗ whisper/Kokoro/MusicGen (opcionais). Depois rodei `browser path`, que baixou o chrome-headless-shell 152.0.7977.30 para /root/.cache/hyperframes/chrome/chrome-headless-shell/linux-152.0.7977.30/chrome-headless-shell-linux64/chrome-headless-shell (diretório criado às 13:34, quando o comando rodou). Em seguida, `browser ensure` respondeu 'Browser found, Source: cache… Ready to render' e o `doctor` passou a mostrar ✓ Chrome. Não precisei usar /opt/pw-browsers (lá existe um chromium_headless_shell-1194 do Playwright). `docs` tem 6 tópicos: data-attributes, examples, rendering, gsap, troubleshooting, compositions. Esses docs embutidos estão um pouco desatualizados: citam a qualidade draft/standard/high, mas o `render --help` real traz draft|looks|delivery (o padrão é looks, CRF 16).
  applicability: Alta. Gera o showreel MP4 de 1920x1080 a partir de HTML+GSAP com renderização determinística e local, sem precisar de cloud nem Docker. Serve para fazer o vídeo de apresentação/hero do portfólio (exportado em MP4 ou WebM) que o site estático depois embute com <video>.
- [skill] Skills do Hyperframes instaladas (`hyperframes skills`) | available=True
  evidence: `npx -y hyperframes@0.8.171 skills` terminou com 'Done!'. Cada skill foi copiada para ~/.claude/skills/<nome> e também para ~/.agents/skills/<nome>, 21 no total: hyperframes, hyperframes-core, hyperframes-animation (inclui adapters/gsap.md, gsap-easing-and-stagger.md, gsap-timeline-and-labels.md, gsap-transforms-and-perf.md e transitions/), hyperframes-keyframes, hyperframes-cli, hyperframes-creative, hyperframes-registry, hyperframes-studio, hyperframes-audio, media-use, figma, general-video, motion-graphics, music-to-video, pr-to-video, product-launch-video, faceless-explainer, embedded-captions, slideshow, talking-head-recut, remotion-to-hyperframes. Não existe uma skill 'gsap' separada: o GSAP fica dentro de hyperframes-animation/adapters. Elas já aparecem na lista de skills desta sessão. Li os SKILL.md de hyperframes, hyperframes-core, hyperframes-cli e hyperframes-animation, além das refs minimal-composition, data-attributes, determinism-rules, variables-and-media, tracks-and-clips, sub-compositions, init-and-scaffold, a seção de render em preview-render, snapshot, transitions/overview e adapters/gsap.
  applicability: Alta. Como guia de autoria: para um showreel de imagens com texto, a rota que se aplica é /general-video (montage/sizzle reel) ou /motion-graphics se o vídeo tiver menos de 10s. O agente deve carregar /hyperframes-core antes de escrever o HTML e /hyperframes-animation para transições e GSAP.
- [cli] Render local (Chrome headless + FFmpeg) | available=True
  evidence: Teste 1, /tmp/wh-audit/hf-test (texto animado + retângulo vermelho, 2s). `lint`: 0 erros e 1 warning (nested_structure_needs_subcomposition). O primeiro `check` FALHOU com 'request_failed: Failed to load npm/gsap@3.14.2/dist/gsap.min.js: net::ERR_TUNNEL_CONNECTION_FAILED': o Chrome headless não alcança a CDN através do proxy. Corrigi vendorizando o gsap.min.js (npm pack gsap@3.14.2) em assets/vendor/, e o `check` passou. O primeiro render saiu com o layout errado, porque o clip na raiz ficou absolute top/left com tamanho shrink-to-fit. Corrigi com `.clip{position:absolute;inset:0}`. O render final gerou /tmp/wh-audit/hf-test/renders/test.mp4: h264, 1920x1080, 30/1 fps, 60 frames, duração 2.000000, 36.787 bytes, 'beginframe capture · software gpu', em 5,6s. Inspecionei os frames 0,3s e 1,2s e estão corretos. Teste 2, /tmp/wh-audit/hf-img (PNG dentro de uma sub-composição, WebP numa cena inline, crossfade, Ken Burns, Inter local via @font-face). O `check` primeiro falhou por contraste (1.42:1); com um scrim, passou com 7/7 checagens WCAG AA. `snapshot` registrou 'Fonts: 2 loaded'. O `render --quality delivery --fps 30` gerou /tmp/wh-audit/hf-img/renders/hf-img.mp4: h264 High, 1920x1080, 150 frames, 5.000000s, 1,17MB, em 12,8s. Frames verificados.
  applicability: Alta. Foi validado de ponta a ponta neste ambiente. Condições: GSAP e fontes têm de ser locais (a rede não funciona dentro do Chrome de render), e as imagens PNG/WebP precisam estar no diretório do projeto.

GUIDANCE:
GUIA HYPERFRAMES 0.8.171 (verificado na prática em 2026-10-18)

1) AMBIENTE (já pronto)
- Rode sempre `npx -y hyperframes@0.8.171 <cmd>` de dentro do diretório do projeto. O Chrome já está em cache (~/.cache/hyperframes/chrome/...); se ele sumir, rode `npx -y hyperframes@0.8.171 browser ensure`. FFmpeg fica em /usr/bin. O Docker não está rodando, então não use --docker.
- REGRA CRÍTICA: o Chrome do render NÃO acessa a internet. A CDN deu net::ERR_TUNNEL_CONNECTION_FAILED. GSAP, fontes e imagens precisam estar dentro do projeto. Arquivos prontos para copiar: /tmp/wh-audit/gsap-dl/package/dist/gsap.min.js (GSAP 3.14.2) e /tmp/wh-audit/font-dl/package/files/inter-latin-{400,700,800}-normal.woff2 (Inter). Para outras fontes, use `npm pack @fontsource/<fonte>@<versão>`; o npm funciona pelo proxy.
- Em `init`, defina HYPERFRAMES_SKIP_SKILLS=1 para evitar o check de skills no GitHub.

2) SCAFFOLD
`HYPERFRAMES_SKIP_SKILLS=1 npx -y hyperframes@0.8.171 init showreel --non-interactive --resolution landscape`
Gera index.html, hyperframes.json (paths: blocks=compositions, assets=assets), package.json (scripts dev/check/render, com a versão 0.8.171 fixada), meta.json, CLAUDE.md e AGENTS.md. Depois, crie assets/vendor/gsap.min.js, assets/fonts/*.woff2, assets/img/*.png|webp e, se for usar, compositions/*.html.

3) COMPOSIÇÃO RAIZ (index.html standalone, SEM <template>)
```html
<!doctype html><html lang="pt-BR" data-resolution="landscape"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=1920, height=1080"/>
<script src="assets/vendor/gsap.min.js"></script>
<style>
@font-face{font-family:"Inter";src:url("assets/fonts/inter-latin-800-normal.woff2") format("woff2");font-weight:800;}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:#0a0a0a}
#root{position:relative;width:100%;height:100%;overflow:hidden;font-family:"Inter",sans-serif}
.clip{position:absolute;inset:0}   /* OBRIGATÓRIO na prática, ver item 4 */
.frame{position:absolute;inset:0}
.frame img{display:block;width:100%;height:100%;object-fit:cover}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="18" data-width="1920" data-height="1080">
  <section id="s1" class="clip" data-start="0" data-duration="3.6" data-track-index="0">
    <div id="s1-frame" class="frame"><img id="s1-img" src="assets/img/a.webp" alt=""/></div>
    <div id="s1-scrim"></div><h2 id="s1-title">Texto</h2>
  </section>
  <section id="s2" class="clip" data-start="3.2" data-duration="3.6" data-track-index="1">…</section>
</div>
<script>
const tl = gsap.timeline({ paused: true });
tl.fromTo("#s1-frame",{scale:1.12,x:40},{scale:1,x:0,duration:3.6,ease:"none"},0);       // Ken Burns no wrapper
tl.fromTo("#s1-title",{opacity:0,y:60},{opacity:1,y:0,duration:0.7,ease:"power3.out"},0.2);
const T=3.2; // crossfade: saída e entrada no MESMO instante
tl.fromTo("#s1",{opacity:1},{opacity:0,duration:0.4,ease:"sine.inOut"},T);
tl.fromTo("#s2",{opacity:0},{opacity:1,duration:0.4,ease:"sine.inOut"},T);
window.__timelines["main"] = tl;  // a chave é igual ao data-composition-id e o registro vem no FIM
</script></body></html>
```

4) REGRAS DE TEMPO E CLIP
- Raiz: data-composition-id, data-width, data-height e data-duration (em segundos). O data-duration define o tamanho do render: se a timeline for mais longa, o excedente é cortado; se for mais curta, o último frame fica congelado. Ele é lido uma única vez, na compilação, então não dá para alterá-lo por script. data-fps é opcional (o padrão é 30; --fps tem prioridade).
- Clip é qualquer elemento com data-start (+ data-duration; um <img> sem duração dura 3s por padrão). A janela é semiaberta, [start, start+duration): termine as animações um pouco ANTES do fim. data-track-index só serve como faixa no Studio e não afeta o render. A ordem de empilhamento vem de CSS/z-index ou da ordem no DOM. Clips podem se sobrepor no tempo, e é assim que se faz o crossfade.
- ARMADILHA VERIFICADA: clips filhos diretos da raiz recebem position:absolute + top/left 0 com tamanho shrink-to-fit. Sem `.clip{position:absolute;inset:0}`, o flex/centralização não funciona (no teste, o texto foi parar no canto superior esquerdo).
- Elementos não temporizados de fundo precisam de position:absolute;inset:0 próprio.
- O runtime esconde o clip fora da janela dele. Não use tl.set visibility:hidden.
- Clips aninhados geram o warning `nested_structure_needs_subcomposition`. É só um warning: render e check passam.

5) IMAGENS PNG/WebP
- Coloque `<img>` dentro de um wrapper não temporizado e anime o wrapper (scale/x/y), nunca as dimensões do clip. Use object-fit:cover. Os dois formatos renderizaram sem problema. Em PNG grande, prefira WebP ou JPG por peso.
- Texto sobre foto: o `check` reprova contraste abaixo do WCAG AA, e isso é ERRO que bloqueia. Use um scrim (por exemplo linear-gradient rgba(0,0,0,.55–.8)) atrás do texto.
- Ken Burns que sai do frame gera info container_overflow. Ponha `data-layout-allow-overflow` no wrapper da imagem, o mais estreito possível.

6) GSAP DETERMINÍSTICO
- Uma única gsap.timeline({paused:true}) por composição, registrada em window.__timelines["<id>"] DEPOIS de adicionar todos os tweens. Nunca chame tl.play().
- Use fromTo (o estado inicial fica explícito). Não combine transform CSS inicial com tween na mesma propriedade (gsap_css_transform_conflict). Centralize com flex/inset, nunca com translate(-50%).
- Proibido: Date.now/performance.now, Math.random sem seed, fetch, hover/scroll, repeat:-1 sem data-duration finito, tweens de display/visibility/autoAlpha em elemento .clip (gsap_animates_clip_element). Opacity em .clip é permitido e foi testado. Não use <br> em texto corrido (use max-width). Elementos com transform precisam ser block e ter tamanho.
- Prefira x, y, scale, rotation e opacity. Não meça getBoundingClientRect no momento do tween.
- Transições: todas as cenas entram com animação. Animação de SAÍDA é proibida, exceto na última cena (fade to black). A própria transição faz a saída. Escolha 1 transição primária (crossfade ou blur-crossfade de 0,4–0,6s; push com power2/power3) e no máximo 1–2 de acento. O catálogo está em ~/.claude/skills/hyperframes-animation/transitions/catalog.md.
- Contador: tl.to(el,{innerText:100,snap:{innerText:1}}).

7) SUB-COMPOSIÇÕES (opcional, uma por cena)
Host: `<div id="scene-a" data-composition-id="scene-a" data-composition-src="compositions/scene-a.html" data-start="0" data-duration="2.8" data-width="1920" data-height="1080"></div>`. No arquivo, TUDO fica dentro de <template> (o <head> é descartado): <style> com `#root{position:absolute;inset:0}` (estilize pelo #root, nunca por classe), `<div id="root" data-composition-id="scene-a" data-width="1920" data-height="1080">` e um <script> que registra `window.__timelines["scene-a"]`. O GSAP global vem do index.html. Os ids do host, do template e da chave da timeline precisam ser IGUAIS; se não forem, aparece o timeout de 45s e a cena fica congelada. A timeline da sub-composição não alcança elementos do host. Para fazer crossfade do slot, anime #scene-a pela timeline principal. Testado: `src="../assets/img/shot-a.png"` dentro de compositions/ resolveu certo, e o @font-face declarado no index.html valeu dentro da sub-composição. Mantenha ids únicos em toda a página montada (use prefixos como sa-, s2-).

8) COMANDOS (todos no diretório do projeto)
- `npx -y hyperframes@0.8.171 lint` faz a checagem estática (errors/warnings).
- `npx -y hyperframes@0.8.171 check` é o gate final: lint + runtime (requests e erros JS) + layout + motion + contraste. Exit 1 se falhar. `--snapshots` adiciona os frames anotados e `--strict` faz warnings também bloquearem. Erro de lint desliga as auditorias de layout e contraste. validate/inspect/layout estão deprecated.
- `npx -y hyperframes@0.8.171 snapshot --at 1,4.2,9 --no-end --output /tmp/wh-audit/snaps` gera PNGs + contact-sheet.jpg. Também existem `--frames N`, `--range 3:5`, `--composition <id>` e `--zoom "#sel"`.
- `npx -y hyperframes@0.8.171 timeline --json` lista clips e tempos absolutos.
- Render. Flags: -o/--output, -f/--fps (24|25|30|50|60…, padrão = data-fps ou 30), -q/--quality draft|looks(padrão, CRF16)|delivery, --format mp4|webm|mov|gif|png-sequence|hls, --crf N ou --video-bitrate 10M (mutuamente exclusivos), -w/--workers, --strict, --resolution (supersample com DPR inteiro), -c compositions/x.html. Sem -o, a saída vai para renders/<nome>_<timestamp>.mp4.
- COMANDO QUE FUNCIONOU AQUI: `cd <projeto> && npx -y hyperframes@0.8.171 render --quality delivery --fps 30 --output renders/showreel.mp4`. Para iterar: `--quality draft`. A segunda linha do resumo mostrou 'beginframe capture · software gpu' (é o caminho bom; WebGL fica indisponível, então evite shaders e WebGL). Velocidade observada: 5s a 30fps (150 frames) em 12,8s, então um vídeo de 18s deve levar cerca de 45–60s. Se o seu tool encerra o grupo de processos, use `bash -c 'set -m; HYPERFRAMES_RENDER_DETACHED=1 npx -y hyperframes@0.8.171 render … < /dev/null > render.log 2>&1 &'`.
- Verificação: `ls -la renders/showreel.mp4; ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate,nb_frames -of default=nw=1 renders/showreel.mp4`. A duração tem de bater com o data-duration da raiz. Extraia frames com `ffmpeg -v error -ss 4.2 -i renders/showreel.mp4 -frames:v 1 /tmp/wh-audit/f.png` e confira visualmente.
- Para web: `--format webm` gera VP9 (com alpha). Para o hero do site, MP4 h264 yuv420p já sai assim por padrão.
- Não rode `feedback`: envia para um canal público. A telemetria anônima vem ligada por padrão (`hyperframes telemetry disable` desliga, mas só se o usuário quiser).

9) ROTEIRO SUGERIDO PARA 18s
5 cenas de cerca de 3,6s, sobrepostas 0,4s nos crossfades (starts 0 / 3.2 / 6.4 / 9.6 / 12.8, duration 3.6, última até 18; root data-duration="18"). Em cada cena: imagem com Ken Burns (scale 1.12→1, ease "none", ao longo de toda a duração), título com fromTo y:60→0 em 0,7s power3.out, scrim por baixo. A última cena tem logo + CTA e pode fazer fade to black em 17,2–17,9s.

10) ARQUIVOS DE REFERÊNCIA GERADOS
- Vídeo de teste pedido (texto + retângulo vermelho, 2s): /tmp/wh-audit/hf-test/renders/test.mp4 (h264, 1920x1080, 30fps, 60 frames, 2.000000s). Fonte: /tmp/wh-audit/hf-test/index.html.
- Teste com imagens (PNG em sub-composição + WebP + crossfade + Inter local, 5s): /tmp/wh-audit/hf-img/renders/hf-img.mp4. Fontes: /tmp/wh-audit/hf-img/index.html e /tmp/wh-audit/hf-img/compositions/scene-a.html. Snapshots em /tmp/wh-audit/hf-img-snaps/.


######## conectores
- [conector] Figma | available=True
  evidence: mcp__Figma__whoami OK: handle 'kaue ribeiro', 1 plano 'A equipe de kaue ribeiro' (tier starter, key team::…, role admin), seat = View, user_can_access_figma_ai=true, code_layers_enabled=false. get_figma_skill: li skill://index.json (15 skills), figma-create-new-file/SKILL.md e figma-use/SKILL.md. ToolSearch carregou create_new_file (editorType design|figjam|slides|figmake, exige planKey), use_figma (JS da Plugin API, exige fileKey) e send_code_to_figma (descrição: 'Requires edit access to a standalone Code or Design file'). ToolSearch 'generate_figma_design' NÃO retornou essa ferramenta: ela não está disponível nesta sessão. A página de rate limits (developers.figma.com) está bloqueada pelo proxy (CONNECT 403), então os limites não puderam ser confirmados. Nenhum arquivo foi criado.
  applicability: Baixa/incerta. Escrever (use_figma/send_code_to_figma) exige acesso de edição ao arquivo; com seat View num plano Starter é provável que a edição seja recusada ou bem limitada, mas isso NÃO foi testado (proibido criar arquivo). Pelo que eu sabia antes (não verificado aqui), o Figma MCP limita contas Starter e seats View/Collab a poucas chamadas por mês. Não colocar o Figma no caminho crítico. No máximo, um único create_new_file + use_figma opcional para um moodboard/frame, aceitando falha.
- [conector] Magnific | available=True
  evidence: account_balance: plano Premium+ (pago), 35.254 créditos disponíveis de 45.000 (9.746 gastos), sem modo ilimitado. images_models_list (onlyRecommended + search 'flux') retornou o catálogo. simulate_cost (somente leitura, não cobra) para images_generate 16:9 x1: Seedream 5 Pro 2k = 100 cr; Magnific One 2k medium = 180 cr; Flux.2 Pro 2k = 75 cr; Google Nano Banana Pro 2k = 75 cr; Recraft V4.1 = 60 cr; Nano Banana 2 Lite = 60 cr; Flux.1 Realism = 40 cr. Obs.: o parâmetro do modelo em simulate_cost/images_generate é 'mode', não 'model' (com 'model' o custo volta 'variable/Auto').
  applicability: Alta para imagens fotográficas genéricas (produto, comida, arquitetura, interiores, mãos e objetos sem rosto identificável). Modelos sugeridos: Seedream 5 Pro (padrão sota, fotorrealista, aceita referências de produto/estilo, 100 cr); Magnific One (estético e premium, escolhe luz e lente sozinho, 180 cr, rotulado private/feature-flagged no catálogo); Flux.2 Pro (fotorrealismo, referências, 1k/2k, 75 cr); Recraft V4.1 (rápido, sota para texto-para-imagem e exploração, 60 cr); Nano Banana 2 Lite (rascunhos baratos, 60 cr); Flux.1 Realism (fotorrealismo barato, 40 cr, sem referências). Saldo comporta ~300+ imagens a 100 cr. Evitar GPT 2 / 2.5 para fotos (o próprio catálogo indica uso não fotorrealista).
- [conector] GitHub (MCP) | available=True
  evidence: get_me: login 'WunderHub'. search_repositories 'repo:heygen-com/hyperframes' → 1 resultado público (TypeScript, 'Write HTML. Render video. Built for agents.', topics gsap/puppeteer/ffmpeg/mcp, branch main). 'repo:motiondivision/motion' → 1 resultado (TypeScript, 'A modern animation library for React and JavaScript', branch main).
  applicability: Útil para ler código e README de bibliotecas de referência (Motion, HyperFrames) via get_file_contents/search_code e, se o usuário pedir, para criar repo ou PR. Não é necessário para construir o site.
- [cli] git / npm / node (CLI) | available=True
  evidence: git ls-remote em heygen-com/hyperframes e motiondivision/motion retornou HEAD (git funciona pelo proxy). npm view motion version → 14.3.0; npm view hyperframes → 0.8.171 (repo heygen-com/hyperframes, bins hyperframes e hyperframes-localize-fonts); @hyperframes/cli → 404. Tarball npm baixado (200). node v22.22.0; gh, python3 e ffmpeg presentes. Globais: playwright 1.56.1, serve, http-server, prettier, eslint, typescript, pnpm, yarn.
  applicability: Caminho principal para dependências: instalar via npm e empacotar/servir localmente (CDNs estão bloqueadas). 'serve'/'http-server' servem o site estático; prettier/eslint ajudam no QA.
- [cli] Playwright + Chromium headless | available=True
  evidence: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers (chromium-1194, headless_shell, ffmpeg). Teste com chromium.launch() + setContent funcionou: Chromium 141.0.7390.37.
  applicability: Substitui o Claude in Chrome no QA visual: screenshots desktop/mobile, checagem de overflow horizontal, prefers-reduced-motion, console errors e gravação de motion.
- [conector] Expo | available=True
  evidence: search_documentation('web static export') retornou 7 URLs (router/web/static-rendering, eas/hosting, guides/publishing-websites etc.). read_documentation de publishing-websites: export via 'npx expo export -p web' para dist/, web.output single|server|static (static = um HTML por rota do Expo Router), hospedagem EAS/Netlify/Vercel/GitHub Pages.
  applicability: Não pertinente. Exige um app Expo/React Native Web com Expo Router e Metro, sobrecarga desnecessária para um site estático de marketing. O guia de deploy em GitHub Pages/Netlify vale só como referência genérica.
- [conector] Shadcn UI | available=False
  evidence: ToolSearch 'shadcn' → 'No matching deferred tools found'. ToolSearch 'ui components registry' só retornou ferramentas não relacionadas (Figma list_file_components_for_code_connect, SearchMcpRegistry, Expo build_*). Nenhuma ferramenta shadcn.
  applicability: Indisponível como conector. Também é pouco relevante: shadcn é React+Tailwind, e um site estático autoral não precisa dele.
- [conector] Claude in Chrome / Claude_Browser | available=False
  evidence: ToolSearch 'claude-in-chrome' e 'Claude_Browser' → 'No matching deferred tools found'. As skills anthropic-skills:chrome-browser e built-in-browser aparecem listadas, mas sem as ferramentas mcp__claude-in-chrome__* ou mcp__Claude_Browser__*.
  applicability: Indisponível. Usar o Playwright/Chromium local para QA.
- [skill] Skills HyperFrames (hyperframes, hyperframes-animation, hyperframes-cli, motion-graphics etc.) e anthropic-skills:motion | available=True
  evidence: Aparecem na listagem de skills disponíveis do Skill tool (as HyperFrames entraram durante esta sessão). NÃO foram invocadas nesta auditoria.
  applicability: anthropic-skills:motion: boas práticas de Motion e CSS (vanilla JS, springs com linear(), auditoria de performance), direto ao ponto para o motion do site. HyperFrames renderiza vídeo a partir de HTML (GSAP, puppeteer, ffmpeg): serve para gerar um MP4 ou loop de showreel e embuti-lo no site, não para o site em si. hyperframes.heygen.com está bloqueado (403), mas o pacote npm 'hyperframes' é acessível.
- [cli] Rede (proxy de saída) | available=True
  evidence: curl com timeout 10s. OK: fonts.googleapis.com (css2 → 200), fonts.gstatic.com (arquivo de fonte → 200, 71 KB), registry.npmjs.org (200; tarball 200), raw.githubusercontent.com (README motion e hyperframes → 200), git via github.com (ls-remote OK). BLOQUEADOS (CONNECT tunnel 403): cdn.jsdelivr.net, unpkg.com, cdnjs.cloudflare.com, hyperframes.heygen.com, developers.figma.com. github.com HTTP: raiz 400, /heygen-com 403; api.github.com 403 (usar o GitHub MCP ou git).
  applicability: Bibliotecas de motion precisam ser instaladas via npm e auto-hospedadas no projeto (copiar o bundle ESM de node_modules para /vendor ou usar um bundler). Fontes: o Google Fonts funciona em runtime, mas é melhor baixar woff2 e auto-hospedar.

GUIDANCE:
CAPACIDADES CONFIRMADAS
- Magnific (melhor fonte de imagens): Premium+, 35.254 créditos livres. Em images_generate e simulate_cost o modelo vai em `mode` (ex.: {"mode":"seedream-5-pro","aspectRatio":"16:9","resolution":"2k","count":1}). Custos exatos por imagem 16:9: Seedream 5 Pro 2k 100; Magnific One 2k medium 180; Flux.2 Pro 2k 75; Nano Banana Pro 2k 75; Recraft V4.1 60; Nano Banana 2 Lite 60; Flux.1 Realism 40. Antes de lotes, rodar simulate_cost (não cobra). O catálogo pede, para Magnific One, só sujeito e momento no prompt, sem descrever luz ou lente. Para evitar pessoas reais identificáveis, pedir objetos, mãos, ambientes e comida, sem rostos. Para baixar os resultados, ver creations_get/creation_status/creations_wait, que não testei.
- GitHub MCP: login WunderHub. search_repositories funciona; heygen-com/hyperframes e motiondivision/motion são públicos (branch main). Pelo proxy, git clone/ls-remote funciona; a API REST via curl (api.github.com) e as páginas github.com voltam 403/400. Para ler arquivos, usar o MCP (get_file_contents) ou raw.githubusercontent.com.
- npm: registry acessível. motion@14.3.0 (latest) e hyperframes@0.8.171 (CLI da HeyGen). O pacote @hyperframes/cli não existe. Node 22, pnpm e yarn disponíveis.
- QA: Playwright 1.56.1 global + Chromium 141 headless em /opt/pw-browsers, lançamento testado. Importar de /opt/node-tools/node_modules/playwright. Também há `serve`/`http-server` globais e ffmpeg.
- Fontes: fonts.googleapis.com e fonts.gstatic.com respondem 200. Recomendo baixar os arquivos e auto-hospedar.

LIMITES
- CDNs bloqueadas (CONNECT 403): cdn.jsdelivr.net, unpkg.com, cdnjs.cloudflare.com, hyperframes.heygen.com, developers.figma.com. Num artifact publicado no claude.ai, quem carrega é o navegador do usuário, então isso não se aplica. Mas o projeto local não pode depender delas para build ou teste: instalar via npm e copiar o bundle (ex.: node_modules/motion/dist/…) para uma pasta vendor, ou usar um bundler (vite/esbuild via npm).
- Figma: seat View, plano Starter (role admin, AI liberada, Code Layers off). use_figma, create_new_file e send_code_to_figma estão disponíveis; generate_figma_design NÃO está nesta sessão. Escrever exige acesso de edição ao arquivo (send_code_to_figma diz isso explicitamente). Com seat View, criar ou editar frames é incerto, provavelmente bloqueado ou muito limitado. Não testei (proibido criar arquivos), e a página de rate limits está inacessível. Pelo que eu sabia antes (não verificado), Starter/View tem cota mensal pequena de chamadas MCP. Tratar o Figma como opcional e fora do caminho crítico. Se for usar: carregar figma-create-new-file + figma-use (+ figma-generate-design para mudanças visíveis); planKey = o único plano do whoami; editorType 'design'; em use_figma, retornar todos os IDs de nós, cores em 0–1, carregar fontes antes de editar texto, usar `await figma.setCurrentPageAsync`, nunca createImageAsync/notify.
- Expo: o MCP funciona, mas é irrelevante. O export estático do Expo ('npx expo export -p web', web.output 'static') pressupõe Expo Router/RN Web.
- Shadcn UI, Claude in Chrome e Claude_Browser: nenhuma ferramenta presente (ToolSearch sem resultados).
- Mobbin não foi invocado (fora de escopo).

SKILLS ÚTEIS LISTADAS (não invocadas)
- anthropic-skills:motion (Motion, CSS, springs com linear(), auditoria de performance).
- anthropic-skills:frontend-design.
- artifact-design (obrigatória se o site for publicado como Artifact).
- A família HyperFrames (hyperframes, hyperframes-animation, motion-graphics, hyperframes-cli). Ela serve para renderizar vídeo MP4 a partir de HTML+GSAP, o que permite gerar um showreel ou loop para embutir no site. Não é framework do site.

Temporários: /tmp/wh-audit/ (apenas logs de curl). Nenhum arquivo fora de wunderhub-experiment foi lido ou listado.


######## referencias
- [cli] WebSearch | available=True
  evidence: Carregado via ToolSearch e executado em cerca de 35 consultas (modos standard e extended). Devolveu resultados reais de tympanus.net/codrops, abduzeedo.com, designrush.com, awards.europeandesign.org, media-marketing.com e de listagens da awwwards.com (muitas vezes como snapshots com o título 'The Creative Pass'). Limites observados: a busca por 'FWA of the day 2026' não trouxe nenhuma entrada de 2026; prêmios da Awwwards só aparecem como selos lidos de listagens raspadas, então ficam provisórios. Também não achou o domínio ao vivo de alguns sites (Pacôme Pertant, Giulio Collesei, HAOQI.DESIGN).
  applicability: Fonte principal da pesquisa de referências. Serve para achar estudos de caso (Codrops) com as decisões técnicas e de composição descritas pelos próprios autores. Não substitui ver as páginas: todas as observações abaixo vêm de descrições e trechos, não da renderização.
- [cli] WebFetch | available=False
  evidence: Um único teste, conforme pedido: WebFetch em https://www.awwwards.com/websites/sites_of_the_day/ retornou o erro 'getaddrinfo ENOTFOUND www.awwwards.com' (falha de DNS no ambiente). Não tentei de novo nem procurei alternativa via curl.
  applicability: Indisponível. Por isso nenhuma página de referência foi aberta nem inspecionada (layout, código, mobile). Se precisar validar visualmente, o caminho é abrir manualmente no navegador.

GUIDANCE:
AVISO GERAL: nenhuma página foi aberta. Todas as observações abaixo vêm de descrições e trechos que o WebSearch retornou, em geral estudos de caso na Codrops escritos pelos autores, Abduzeedo, DesignRush e listagens da Awwwards. Os prêmios da Awwwards foram lidos de selos em listagens raspadas e devem ser tratados como provisórios.

AS 6 REFERÊNCIAS
1) Exat microsite (Studio Size + RISE2 Studio, para a fundidora Hot Type), categoria marca/produto com tipografia cinética.
URL: https://exat.hottype.co/. Estudo de caso: https://tympanus.net/codrops/2026/04/10/the-exat-microsite-pushing-a-typography-showcase-to-new-creative-extremes/
Observado, só por descrição:
- Abertura com um campo de letras minúsculas que reage ao cursor em 7 anéis concêntricos. O anel mais próximo deixa as letras vermelhas e no peso máximo.
- Numerais grandes oscilam em senoide conforme a velocidade da rolagem.
- Rolagem vertical contínua; stack GSAP + ScrollTrigger + SplitText + Lenis + fontes variáveis com peso e largura animados ao vivo.
- No mobile as interações são simplificadas, não replicadas.
- Prêmios citados: Ouro no European Design Awards 2026, Red Dot Best of the Best (nota de 24/08/2026) e indicação a Site of the Year na Awwwards.
Princípio transferível: o vermelho aparece só como estado de intensidade (proximidade ou velocidade), nunca como fundo. A reação é em faixas discretas (7 anéis), não em gradiente contínuo, o que combina com uma linguagem angular. Ligar o eixo de peso da fonte variável a uma variável de entrada. No mobile, trocar o cursor por velocidade de rolagem ou toque.

2) Lando Norris (OFF+BRAND), categoria marca com loja e conteúdo.
URL: https://landonorris.com
Observado, só por descrição (DesignRush e listagens da Awwwards):
- No hero, formas reativas tipo blob seguem o cursor sobre a foto e repetem o grafismo do capacete.
- Acentos neon tirados do capacete.
- Layout modular separado em 'On Track' (resultados) e 'Off Track' (cultura e parcerias).
- Selo 'Site Of The Year 2025' visto em listagens da Awwwards, sem anúncio oficial encontrado. Melhor site no DesignRush de abril de 2026.
Princípio: o vocabulário de movimento sai da marca. Para a WunderHub, seriam facetas e cortes angulares do 'W' ou do logo, e não blobs. Dividir a vitrine em duas trilhas claras com nomes próprios.

3) Vivid (template Webflow), categoria máscaras e transições ligadas a gesto.
URL: https://tympanus.net/codrops/2026/09/15/vivid-turning-a-visual-experiment-into-an-interactive-webflow-experience/
Observado, só por descrição:
- Não há rolagem de página: a página é uma sequência de estados.
- Roda do mouse, swipe e scroll são interceptados e viram só duas intenções, avançar ou voltar.
- Durante uma transição a navegação fica travada, e uma fila pequena guarda o próximo gesto.
- As transições usam canvas, máscaras e compositing.
- Um resumo citou um reveal diagonal em tiras de pixels no slider, mas esse detalhe não foi confirmado nos trechos.
Princípio: para a abertura, usar uma máquina de estados curta (3 ou 4 estados), com trava de entrada e fila de 1 gesto, para que nenhuma máscara seja cortada no meio. Depois da abertura, devolver a rolagem nativa; o sequestro de rolagem fica só na intro.

4) SVG Mask Transitions on Scroll (Hiroki Watanabe, Codrops, 11/03/2026), categoria máscaras ligadas à rolagem. É tutorial com demo, não site de marca.
URL: https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/
Observado, só por descrição (Codrops e Abduzeedo). Quatro padrões de reveal de imagem em tela cheia:
- 30 persianas horizontais que abrem a partir do centro, com stagger de 0,02 s entre pares.
- Grade aleatória.
- 12 persianas verticais da esquerda para a direita.
- Colunas da esquerda para a direita, com ordem aleatória dentro de cada coluna.
Detalhes técnicos: a máscara usa viewBox="0 0 100 100" (unidades virtuais, não pixels); ScrollTrigger com scrub de 2.0 a 2.5 e Lenis. Não achei menção a prefers-reduced-motion.
Princípio: geometria da máscara em unidades normalizadas, então funciona igual no mobile. Scrub com atraso dá peso à transição. Para a linguagem angular, inclinar as tiras (polígonos) em vez de retângulos.

5) Stefan Vitasović Portfolio25, categoria vitrine navegável no mobile e portfólio premiado.
URLs: https://stefanvitasovic.dev (domínio citado na listagem de júri da Awwwards). Estudo de caso: https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/. Awwwards: https://www.awwwards.com/sites/stefan-vitasovic-portfolio25
Observado, só por descrição:
- Grade de projetos em vídeo com WebGL no desktop.
- O mobile mantém a mesma UI e os mesmos princípios de movimento, mas retira a camada WebGL e usa vídeo HTML5 nativo.
- Um motor de rolagem compartilhado mantém o mesmo 'feel' entre a grade WebGL e o DOM.
- Visual de grid suíço com espaço vazio.
- Notas na Awwwards de 7.25 (SOTD) e 8.04 (Dev).
Princípio: definir a coreografia uma vez e ter duas camadas de render. No mobile, o efeito pesado sai e o ritmo e a hierarquia de movimento ficam.

6) Stas Bondar '25, categoria portfólio premiado com vitrine.
URL: https://tympanus.net/codrops/2025/03/25/stas-bondar-25-the-code-techniques-behind-a-next-level-portfolio/ e https://www.awwwards.com/case-study-stas-bondar-25.html
Observado, só por descrição:
- A grade virou colunas que rolam de forma independente, com roda ou arraste (GSAP Draggable).
- As miniaturas esticam conforme a velocidade da rolagem e voltam ao normal quando ela desacelera.
- Feito em Astro, GSAP e Three.js. Site of the Week e Site of the Month do GSAP.
- Não achei detalhes de mobile.
Princípio: a vitrine é um objeto manipulável (arrastar), não uma lista. A deformação ligada à velocidade dá feedback físico. Para a linguagem angular, usar skew ou cisalhamento em vez de distorção orgânica. No mobile, uma coluna com swipe horizontal.

Alternativas vistas e não usadas:
- Pacôme Pertant Portfolio (SOTD da Awwwards em 09/06/2026): só nomes de elementos (list view, page transition, menu), sem URL.
- Giulio Collesei (Codrops, 14/04/2026): abertura como cena de filme com fechamento narrativo, mas a estética é cyberpunk com chuva e neon.
- Yestalgia/Decathlon (Codrops, 12/09/2026): layout editorial 'product-first' com interlúdios só gráficos.
- HAOQI.DESIGN (SOTD e FWA, segundo o autor): DOM para texto e canvas fixo sincronizado com a rolagem.

NOTAS TÉCNICAS COLHIDAS
- clip-path polygon só interpola se os estados tiverem o mesmo número de pontos.
- Para um único reveal de hero, clip-path é mais leve que mask (opinião de um autor, não benchmark).
- Codrops tem um starter de transições de página GSAP no client router do Astro (07/10/2026).
- prefers-reduced-motion não apareceu em nenhuma fonte, então precisa ser implementado por nós.

5 TENDÊNCIAS-CLICHÊ A EVITAR
É síntese minha a partir dos padrões recorrentes nas referências e de artigos de tendência 2026 (graphicdesignjunction, de 08/2026, diz que WebGL estoura o orçamento de performance; um post no Patreon diz que mais animação não significa UX melhor). São opiniões, não dados.
1) Preloader com contador de 0 a 100% seguido de cortina revelando o hero.
2) Cursor custom em círculo ou blob com rótulo 'View' e botões magnéticos: são só desktop e somem no mobile.
3) Smooth-scroll e sequestro de rolagem no site inteiro, com toda manchete em split-text subindo linha a linha.
4) Dashboard inclinado em perspectiva no hero, cards de glass ou liquid-glass e distorção WebGL fluida ou RGB-shift em hover de imagem.
5) Marquee infinito ('Let's work together' ou logos) com bento grid. No caso de preto e vermelho, cair em estética cyberpunk ou gamer (neon, chuva, glitch).
