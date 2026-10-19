# Plano de construção

Criado pela fundação. Vale junto com `docs/direction.md` (a especificação manda; este arquivo diz **quem edita o quê** e **como as partes se encaixam**). Tudo aqui foi verificado no build e no dev server da fundação (Vite 8.3.4, Chromium 141 via Playwright 1.56.1).

## 1. Como rodar

```sh
npm install                                   # dependências exatas (seção 10)
npx vite --port PORTA --strictPort            # dev da sua frente (porta na tabela 3)
npx vite build --outDir /tmp/wh-build-ROTULO --emptyOutDir   # build de verificação, nunca o dist/ do projeto
BASE_PATH=/wunderhub/ npx vite build --outDir /tmp/wh-build-ROTULO-base --emptyOutDir   # conferir subdiretório
```

Playwright: `import { chromium } from 'playwright'` (devDependency local). Os navegadores ficam em `/opt/pw-browsers` (`PLAYWRIGHT_BROWSERS_PATH`, já definido no ambiente; os scripts põem esse valor como padrão). Evidências em `docs/evidence/ROTULO/`. Encerre seu servidor no fim.

## 2. Posse de arquivos

Cada frente edita **somente** os arquivos dela. Precisa de algo de outra frente? Adapte no seu próprio arquivo (por exemplo, sobrescreva uma variável no seu CSS) e registre no relatório. Nunca edite `index.html`, `vite.config.js`, `package.json`, `src/main.js` nem os arquivos gerados.

| Frente | Arquivos que pode editar |
| --- | --- |
| **fundacao** | `package.json`, `package-lock.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/config.js`, `src/styles/tokens.css`, `src/styles/base.css`, `src/js/motion/tokens.js`, `src/js/motion/preferencias.js`, `src/conceitos/comum/*` (selo), `public/favicon.svg`, `public/robots.txt`, `public/.nojekyll`, `scripts/fontes.mjs`, `scripts/grao.sh`, `scripts/metricas-letreiro.mjs`, `scripts/metricas-fallback.mjs`, `scripts/simbolo.mjs`, `scripts/placeholders.mjs`, `docs/build-plan.md`. Gerados por scripts da fundação (não edite à mão, rode o script): `src/styles/fontes.css`, `src/styles/generated/letreiro.css`, `src/generated/letreiro.json`, `src/generated/fallback.json`, `src/partials/simbolo.html`, `src/assets/fonts/*`, `src/assets/textura/*`, `src/conceitos/*/fonts/*` |
| **topo** | `src/partials/header.html`, `src/partials/menu.html`, `src/partials/topo.html`, `src/partials/barra-whatsapp.html`, `src/styles/header.css`, `src/styles/abertura.css`, `src/styles/palco.css`, `src/js/menu.js`, `src/js/letreiro/palco.js`, `src/js/letreiro/render.js`, `src/js/letreiro/carga.js`, `src/js/barra-whatsapp.js` |
| **trabalhos** | `src/partials/trabalhos.html`, `src/styles/trabalhos.css`, `src/js/vitrine.js`, `src/js/teste-dialog.js`, `src/js/filme.js`, `src/data/conceitos.js` |
| **meio** | `src/partials/servicos.html`, `src/partials/processo.html`, `src/partials/sobre.html`, `src/styles/servicos.css`, `src/styles/processo.css`, `src/styles/sobre.css`, `src/js/processo.js` |
| **contato** | `src/partials/contato.html`, `src/partials/rodape.html`, `src/styles/contato.css`, `src/styles/rodape.css`, `src/js/porta.js`, `src/js/configurador.js`, `src/js/copiar-email.js` |
| **codea** | `conceitos/codea/index.html`, `src/conceitos/codea/**` exceto `fonts/` (gerado) e `img/` (frente de imagens) |
| **junco** | `conceitos/junco/index.html`, `conceitos/junco/tratamentos/index.html`, `conceitos/junco/primeira-consulta/index.html`, `conceitos/junco/agendar/index.html`, `src/conceitos/junco/**` exceto `fonts/` e `img/` |
| **louca-torta** | `conceitos/louca-torta/index.html`, `conceitos/louca-torta/produto/index.html`, `src/conceitos/louca-torta/**` exceto `fonts/` e `img/` |
| **imagens-&lt;slug&gt;** | `src/conceitos/<slug>/img/**` (originais em `img/originais/`, que o `.gitignore` exclui, e os WebP exportados em 3 larguras). `src/conceitos/codea/img/originais/codea-hero.png` já existe: não mexa |
| etapas seguintes (capturas, showreel, QA) | `src/assets/capturas/*`, `src/generated/decisoes.json`, `public/og.png`, `public/media/*`, `scripts/capturas.mjs`, `scripts/og.mjs`, `scripts/showreel-assets.mjs`, `scripts/showreel-render.mjs`, `scripts/qa/**`, `showreel/**` (hoje são stubs ou placeholders da fundação) |

**O que cada frente NÃO pode editar:** qualquer arquivo fora da sua linha acima; em especial `index.html` (a ordem dos includes é fixa), `src/main.js` (ordem do CSS e carga dos módulos), `tokens.css`, `base.css`, `fontes.css`, `src/styles/generated/*`, `src/generated/*` (exceto a etapa de capturas em `decisoes.json`), `src/conceitos/comum/*`, `vite.config.js`, `package.json` (não instale dependências; se faltar algo, registre). As demos não editam o portfólio e o portfólio não edita as demos.

## 3. Portas do dev server

| Frente | Porta |
| --- | --- |
| fundacao | 5170 |
| topo | 5171 |
| trabalhos | 5172 |
| meio | 5173 |
| contato | 5174 |
| codea | 5181 |
| junco | 5182 |
| louca-torta | 5183 |

Use `--strictPort`. Build de verificação: `--outDir /tmp/wh-build-ROTULO`.

## 4. Home: estrutura e partials

`index.html` tem o `<head>` completo (title, description, OG com `public/og.png`, favicon, script inline da seção 10, preload da Anybody) e o `<body>`:

```
a.pular (skip link "Pular para os trabalhos" → #trabalhos)
header   → src/partials/header.html     (topo)
menu     → src/partials/menu.html       (topo)   <dialog id="menu">
<main id="principal">
  topo      → src/partials/topo.html      (topo)      div.topo#topo > .abertura + .palco#palco
  trabalhos → src/partials/trabalhos.html (trabalhos) section#trabalhos, li#conceito-codea|junco|louca-torta, #painel-<slug>
  servicos  → src/partials/servicos.html  (meio)      section#servicos
  processo  → src/partials/processo.html  (meio)      section#processo, input#etapa
  sobre     → src/partials/sobre.html     (meio)      section#sobre
  contato   → src/partials/contato.html   (contato)   section#contato
</main>
rodape         → src/partials/rodape.html         (contato)  nav#mapa "Nesta página"
barra-whatsapp → src/partials/barra-whatsapp.html (topo)
```

Os ids `#topo`, `#trabalhos`, `#servicos`, `#processo`, `#sobre`, `#contato`, `#mapa`, `#conceito-<slug>` e `#painel-<slug>` são contrato entre frentes (links do header, menu, placas da fachada, "Ver o exemplo" dos serviços, rodapé). Não renomeie.

**Sintaxe de include** (plugin `wh-partials` em `vite.config.js`, `transformIndexHtml` ordem `pre`, antes do plugin de contato):

- `<!--#include src/partials/NOME.html -->` troca o marcador pelo arquivo (caminho relativo à raiz). Partials podem incluir partials (o rodapé inclui `src/partials/simbolo.html`).
- Com parâmetros: `<!--#include CAMINHO chave="valor" outra="valor" -->` troca `{{$chave}}` dentro do partial. Parâmetro pedido e não passado é erro de build.
- Não escreva o marcador de include dentro de um comentário HTML (ele seria processado).
- Depois dos includes, o plugin de contato troca `{{whatsappUrl}}`, `{{whatsappExibicao}}`, `{{email}}`, `{{mailtoUrl}}` e `{{ano}}` (valores de `src/config.js`). Use esses marcadores no HTML: os links funcionam sem JS.
- No dev, salvar um partial (em `src/partials/` ou `src/conceitos/comum/`) recarrega a página inteira.
- Assets referenciados em partials passam pelo Vite: `src="/src/assets/…"` vira URL com hash e base; arquivos de `public/` usam caminho absoluto (`/media/…`) e recebem o base path no build.

## 5. Contrato de módulos

Cada módulo de `src/js/` exporta:

```js
export function init(contexto) {
  // contexto = { raiz, estatico, gatilho, evento }
  //   raiz: document.documentElement
  //   estatico: true quando o teto de 3s estourou (html.js-falhou): menu, diálogos, copiar e
  //             configurador funcionam; palco e Porta ficam no estado final, sem animação
  //   gatilho: 'imediato' | 'vista' | 'ponteiro' | 'foco'
  //   evento: o PointerEvent/FocusEvent que disparou a carga (ou null)
  return () => { /* remove listeners, observers, timers, animações, will-change */ };
}
```

- Imediatos (importados por `src/main.js`): `menu.js`, `letreiro/palco.js`, `letreiro/carga.js`, `barra-whatsapp.js`. `letreiro/render.js` é usado só pelo `palco.js` (API livre da frente topo).
- Sob demanda por `import()`, quando a seção chega a uma tela de distância (`inView` com margem de 100%) ou no primeiro `pointerdown`/`focusin` dentro dela: `#trabalhos` → `vitrine.js`, `teste-dialog.js`, `filme.js`; `#processo` → `processo.js`; `#contato` → `porta.js`, `configurador.js`, `copiar-email.js`. Com `gatilho: 'foco'` a Porta abre sem animação (seção 2.9).
- Hoje todos são stubs que cumprem o contrato. `window.__wh.modulos` (Map nome → limpeza) mostra o que iniciou; `window.__wh.desmontar()` chama todas as limpezas (QA).
- Exceção lançada em `init` é registrada no console e o HTML segue funcionando; módulo que não carrega gera `console.warn`.

**Classes no `<html>`:** `js` (script inline rodou), `js-falhou` (teto de 3s; o `js` sai e o CSS cai no modo estático), `pronto` (main.js rodou), `fonte-pronta`, `fonte-lenta` (900ms sem a Anybody: `--fonte-letreiro` vira o fallback estreito), `economia` (saveData ou prefers-reduced-data: sem texturas), `com-barra` (barra de WhatsApp visível: soma `scroll-padding-bottom`), `em-teste` (só nas demos, dentro do iframe do "Testar aqui"). Estado inicial escondido só sob `.js`; sem JS tudo aparece.

## 6. Tokens disponíveis (`src/styles/tokens.css`)

- Cores (2.1): `--preto-acm`, `--grafite-parede`, `--grafite-fio` (só decorativo), `--prata-sombra` (texto só sobre preto), `--prata`, `--prata-luz`, `--chapa`, `--vermelho-acrilico`, `--vermelho-sinal`, `--branco`.
- Material (2.2): `--prata-escovada`, `--chapa-escovada`, `--especular` (resolve `--brilho`, que é `@property` sem herança; declarado em `:root`, `.fachada` e `[data-especular]`: escreva `--brilho` nesses elementos), `--grao-letreiro` e `--grao-chapa` (textura WebP a partir de 768px; abaixo, com `.economia` ou prefers-reduced-data, viram `--escovado-css`).
- Tipo (2.3/2.4): pilhas `--fonte-estrutura`, `--fonte-letreiro`, `--fonte-leitura` (em `fontes.css`); `--t-12`, `--t-14`, `--t-16`, `--t-18`, `--t-21`, `--t-24`, `--t-corpo`, `--t-lead`, `--t-h3`, `--t-h2`, `--t-h1`, `--t-nome`; `--lh-corpo`, `--lh-lead`, `--lh-titulo`, `--lh-h2`; `--medida` (64ch), `--medida-lead` (46ch).
- Espaço e grade (2.5): `--e-1` … `--e-24`; `--colunas`, `--gutter`, `--margem` (16/24/32 em <600, 600–1023, ≥1024); `--conteudo-max` (1536px); `--secao-y` (72/128); `--alvo-min` (48px), `--alvo-primario` (56px); `--header-h` (56px, 64px a partir de 768).
- Ângulo (2.6): `--corte` (16deg), `--corte-tan` (.2867), `--raio` (0).
- Camadas (2.7): `--z-fundo`, `--z-plano-tras`, `--z-letreiro`, `--z-conteudo`, `--z-header`, `--z-barra-whatsapp`, `--z-dialog`, `--z-pular`.
- Movimento (2.8): `--ease-corte`, `--ease-resposta`, `--ease-saida`, `--dur-toque`, `--dur-resposta`, `--dur-saida`, `--dur-saida-longa`, `--dur-placa`, `--dur-painel`, `--dur-revelacao`, `--dur-porta`, `--stagger-vao`, `--stagger-captura`.
- Foco (2.9): `--foco-contorno`, `--foco-anel`, `--foco-folga` (trocados pelas classes de superfície).

JS: `src/js/motion/tokens.js` (`easeCorte`, `easeResposta`, `easeSaida`, `dur`, `stagger`, `encaixe` = spring 0,3s sem quique, `CORTE_TAN`, `VETOR_CORTE`, `PERPENDICULAR`, `distancia`, `passoPeso`).

## 7. Geometria gerada (`npm run metricas`)

`src/generated/letreiro.json` e `src/styles/generated/letreiro.css` (importado pelo main.js antes do CSS das frentes). Valores conferidos com a seção 13 (diferença ≤ 0,0005em); o terminal do script imprime a tabela de conferência.

- **Versal da Anybody não fica centrada numa linha de .74em**: com `line-height: .74em` a base natural fica em 0,647em e o topo da versal em −0,028em (acima da caixa). O CSS gerado põe `padding-top: var(--letreiro-desvio-y)` (0,0605em) em toda `.letreiro [data-linha]`, e as coordenadas do corte contam com a versal centrada (0,0325em a 0,7075em). Use `data-linha` em cada linha de letras (letras, aresta, retorno). Versal medida por varredura de pixels: 0,675em (o `actualBoundingBoxAscent` do canvas devolve 0,6875, quantizado).
- Estrutura: `.letreiro.letreiro--linha | --torre | --auto` (auto = torre abaixo de 1024px, linha a partir de 1024px) › `[data-vao="0|1|2"]` › `[data-linha]` › `.cel[data-i="0|1|2"]`. Por vão: `--vao-wdth`, `--vao-l`, `--vao-x`, `--cel-0..2`, `--corte-y0` (borda esquerda) e `--corte-y1` (borda direita).
- Recortes estáticos de 4 pontos, calculados em cada elemento do vão: `--clip-cima`, `--clip-baixo` (caixa do vão ampliada por `--sangria-esq`, `--sangria-dir`, `--sangria-cima`, `--sangria-baixo`; a metade usa `inset` negativo e `padding` iguais às sangrias), `--clip-aresta` e `--clip-retorno` (tiras de 2px, caixa do vão sem sangria). Uma metade pode mudar as próprias sangrias e o polígono acompanha.
- **Ordem de pintura** (visto no teste de geometria da fundação): a sangria lateral de um vão cobre a ponta da letra do vizinho quando as metades têm fundo preto. Sugestão: metade de cima só com sangria à esquerda e z-index decrescente (WUN acima), metade de baixo só com sangria à direita e z-index crescente; sem `transform`/`opacity` no `.vao` para os z-index competirem no mesmo contexto.
- Torre: wdth 110,4 / 144,4 / 133,9 (arredondado para baixo, para o glifo nunca passar da célula; células escaladas para 3,0em exatos). A seção 2.3 cita 110,5 / 144,5 / 134 (arredondamento ao meio).
- `:root` também recebe `--letreiro-em-linha` (3,5756), `--letreiro-em-torre` (3), `--letreiro-linha`, `--letreiro-versal`, `--letreiro-base`, `--seu-negocio-em-1..5`, `--seu-em-1..5`, `--negocio-em-1..5`, `--formato-landing-em`, `--formato-institucional-em`, `--formato-loja-em`, `--wordmark-em`.
- Nomes partidos (5.2): `[data-nome="codea|junco|louca-torta"]` traz `--nome-wdth`, `--nome-wght`, `--largura-em` e `--clip-nome-cima`, `--clip-nome-baixo`, `--clip-nome-aresta`, `--clip-nome-retorno` (caixa inline-block, `white-space: nowrap`, `line-height: 1`, largura do texto; reta pelo centro da versal, polígono recortado numa caixa folgada de −4% a 104% e −0,35em a 1,35em para acentos e descendentes).
- No mobile, tamanhos que preenchem a linha usam a largura útil: `(100cqi - 2 * var(--margem)) / var(--largura-em)` dentro de uma seção com `container-type: inline-size`.

## 8. Utilidades compartilhadas (`src/styles/base.css` e JS)

- `.placa` (link ou botão vermelho com a borda direita a 16°; a placa é um `::before`, o foco fica no elemento): `--h` controla a altura; `.placa--compacta` (48px), `.placa--etiqueta` (32px, não interativa), `.placa--total` (largura total). Hover e foco sublinham; `:active` desloca 2px na perpendicular.
- `.botao` (secundário, 48px, contorno Prata Sombra; Prata sobre grafite).
- Superfícies: `.superficie-preto`, `.superficie-grafite`, `.superficie-chapa` (aplica a receita da Chapa e o foco preto com anel Vermelho Acrílico).
- `.aco-escovado` (texto em aço escovado com `--especular` e grão; decorativo, sempre em `aria-hidden`).
- Layout: `.conteudo` (largura útil até 1536px), `.grade` (12/6/4 colunas), `.secao` (corte entre seções).
- `.sr-only`, `.so-js`, `.sem-js`, `.wordmark`, `.pular` (skip link).
- Foco global em `:focus-visible` (contorno Prata Luz 2px, folga na cor da superfície, anel Vermelho Sinal) e `[tabindex="-1"]` sem anel. `scroll-padding-top` com o header; `html.com-barra` soma o da barra.
- Reduced motion: transições e animações CSS a 0ms; `preferencias.js` liga `MotionGlobalConfig.skipAnimations`.
- `src/js/motion/preferencias.js`: `preferencias.reduzido | ponteiroFino | hover | baixa | dadosReduzidos | saveData | economia | navegacao | desktop | jsFalhou | estatico | testarAqui | passoPeso`; `subscribe(fn, { imediato })` devolve o cancelamento (fn recebe o estado e a lista do que mudou, inclusive quando reduced motion muda em tempo real); `get()`; `suporta.inert | dialog | clipboard | fontes`.
- `src/config.js`: `contato`, `whatsappUrl(texto)`, `mailtoUrl(assunto, corpo)`.
- `src/data/conceitos.js`: `conceitos` (textos da vitrine, eixos, URLs relativas, âncoras, URLs com hash das capturas), `porSlug`, `posicoesDecisoes(slug, 'desktop'|'celular')`, `decisoesProvisorias`.
- Demos: selo comum no topo e no rodapé via include `src/conceitos/comum/selo.html` com `marca`, `voltar` (`../../#conceito-<slug>` ou `../../../` nas páginas internas) e `variante` (`topo`/`rodape`); `selo.css` + `selo.js` (`init()` marca `html.em-teste` dentro de iframe). Cada `main.js` de demo já importa o selo e o CSS da marca com as fontes autohospedadas.

## 9. Placeholders e scripts

| Script | O que faz | Estado |
| --- | --- | --- |
| `npm run fontes` | copia woff2 e `OFL-*.txt` para `src/assets/fonts/` e `src/conceitos/<slug>/fonts/` | pronto |
| `npm run grao` | texturas `grao-2400.webp` (luma 69–146, 11,4 KB) e `grao-chapa-2400.webp` (103–132, 3,9 KB) | pronto |
| `npm run metricas` | letreiro.json/css e fallback.json/fontes.css | pronto |
| `npm run placeholders` | capturas, pôsteres, og.png e decisoes.json provisórios (não sobrescreve; `-- --forcar` refaz) | pronto |
| `node scripts/simbolo.mjs` | favicon e símbolo do rodapé a partir do W da Anybody (precisa de `npm i --no-save fontkit@2.0.4 wawoff2@2.0.1`) | pronto |
| `npm run capturas`, `npm run og`, `npm run showreel:assets`, `npm run showreel:render`, `npm run qa` | etapas seguintes | stub (sai com código 1 e diz qual etapa implementa) |

Placeholders atuais (neutros, grafite com o nome do conceito e "captura provisória"): `src/assets/capturas/<slug>-desktop-{480,960,1440}.webp` (16:10), `<slug>-celular-{390,780}.webp` (390×844), `public/media/showreel-poster-{640,1280}.webp`, `public/og.png`, `src/generated/decisoes.json` (`"provisorio": true`).

## 10. Decisões e desvios da fundação

- `build.assetsInlineLimit: 0` no `vite.config.js` (fora do bloco da seção 10): sem isso as capturas pequenas entravam como base64 no HTML (index.html chegou a 77 KB) e as texturas no CSS.
- Script inline: além do texto da seção 10, marca `html.economia` com `navigator.connection.saveData` antes do CSS, para a textura nem ser pedida.
- Fallbacks de fonte: nesta máquina só existe a Liberation Sans (métrica igual à Arial). "Anybody Fallback" e "Archivo Fallback" foram medidas contra ela (local). "Anybody Fallback Estreita" não tem nenhuma face local aqui; foi medida contra uma cópia de referência da Roboto Condensed Bold (`@fontsource/roboto-condensed@5.3.0`, baixada para `node_modules/.cache`, nunca vai para o site). `src/generated/fallback.json` registra a razão de todos os candidatos (DejaVu Sans Condensed Bold seria 0,6855 contra 0,8734 da Roboto Condensed). Conferido: com `line-height: normal` a altura da linha é idêntica (104px/104px; 109px/109px) e o H1 e o lead quebram nas mesmas linhas em 390 e 1440.
- Medida de 64ch só em `p` e `dd` (não em `li`, que é estrutura de layout em várias seções).
- Demos com `<meta name="robots" content="noindex">` (marcas fictícias fora dos buscadores) e o favicon da WunderHub até cada frente decidir o seu (sem `<link rel=icon>` o navegador pede `/favicon.ico` e gera 404).
- Placas da fachada sem `inert` no HTML: sem JS elas ficam visíveis e focáveis (modo estático); `palco.js` aplica o `inert`.
- Foco: o anel vermelho fica por fora do contorno claro graças a uma folga na cor da superfície (`--foco-folga`); sem ela a sombra de 7px pintaria vermelho também entre o elemento e o contorno.
- CSS provisório das frentes (header, abertura, palco, trabalhos, serviços, processo, sobre, contato, rodapé) é ponto de partida, não especificação: cada frente reescreve o seu.
