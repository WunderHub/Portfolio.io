## 1. Conceito e princípios

**Conceito.** O site é a fachada da WunderHub, montada como o letreiro em letra-caixa do comércio de bairro: letras de aço inox escovado presas num painel de ACM preto, sobre a parede grafite, com placas de acrílico vermelho. A paleta pedida pelo dono ganha origem material: a prata é o aço das letras, o vermelho é o acrílico das placas, o preto é o painel, o grafite é a parede. O wordmark WUNDERHUB, na Anybody variável, é a estrutura da primeira tela. Três cortes a 16° (um por vão: WUN, DER, HUB) atravessam as letras. Ao rolar, os cortes se abrem como janelas, as letras perdem massa até virar caixilhos e, atrás delas, acendem as capturas reais dos três conceitos: a fachada vira vitrine. O roteiro termina com o mesmo letreiro abrindo como porta para o contato. A direção pertence a este estúdio porque descreve o trabalho de Kauê: montar a fachada digital que leva quem passa na calçada até a porta, que é a conversa.

**Princípios.**

1. **Um ângulo só: 16°.** Cortes, chanfros, placas e trajetórias derivam dele. Nada gira, nada quica, não há 3D, blur nem sombra.
2. **Prata é material, vermelho é placa.** A prata aparece como aço escovado (letreiro, chapa do processo, arestas). O vermelho só aparece como placa de ação ou de estado e ocupa no máximo cerca de 5% da área de qualquer tela; nunca é fundo de seção nem palavra destacada em título.
3. **A fachada mostra o trabalho real.** O que aparece pelas janelas são capturas das demos implementadas. Imagens nunca preenchem letras; aparecem atrás e entre elas.
4. **Um acontecimento, um scrub, dois gestos, uma porta.** Intensidade reservada: o corte na carga, o palco na rolagem, o painel de decisões, o trilho do processo e a porta do contato. O resto é estático: nenhuma seção entra com fade, hover só muda cor ou sublinhado.
5. **O texto comercial chega antes do espetáculo.** H1, lead e botão de WhatsApp são HTML real, visíveis no primeiro paint, nunca animados. O letreiro é decorativo (`aria-hidden`) e a página inteira funciona sem JavaScript.

---

### 3.4 Texto da home (final, PT-BR)

Regras de escrita aplicadas: primeira pessoa, voz ativa, frases curtas, sem travessões, sem "não é X, é Y", sem rótulos em caixa alta, sem slogans picados, CTA dizendo o que acontece.

**Head.** `<title>WunderHub, sites para pequenos negócios por Kauê Ribeiro</title>`. Description: "Kauê Ribeiro cria landing pages, sites institucionais e lojas virtuais para pequenos negócios e profissionais. Fale pelo WhatsApp ou por e-mail." `lang="pt-BR"`.

**Skip link** (primeiro elemento focável, visível só no foco): "Pular para os trabalhos" → `#trabalhos`.

**Header.** Wordmark (link para `#topo`, nome acessível "WunderHub, início"). Navegação (≥768px): Trabalhos · Serviços · Como trabalho · Contato (os links são separados por espaço, sem pontos no texto). Abaixo de 768px: botão-ícone de WhatsApp (`aria-label="Chamar no WhatsApp"`, ícone genérico de balão de conversa desenhado em SVG, sem logo de terceiros) e botão "Menu".

**Menu mobile** (<768px, `src/js/menu.js`):

- Sem JS: "Menu" é um link `<a href="#mapa">Menu</a>` que leva à lista "Nesta página" do rodapé (`<nav id="mapa" aria-label="Nesta página">`, com os mesmos quatro destinos). Nada fica inacessível.
- Com JS: o link vira `<button aria-haspopup="dialog" aria-controls="menu">Menu</button>`, que abre `<dialog id="menu" aria-label="Menu">` com `showModal()` (foco preso, fundo inert e Escape nativos). Ocupa a tela inteira sobre Grafite Parede.
- Conteúdo, de cima para baixo: linha do header repetida (wordmark e botão **Fechar**, que recebe o foco ao abrir); os quatro destinos compostos como andares em Anybody 150/800 a 32px, um por linha, alvos de 64px de altura, alinhados à esquerda: **Trabalhos**, **Serviços**, **Como trabalho**, **Contato**; abaixo, a placa **Chamar no WhatsApp** (56px, largura total) e o e-mail em texto (link `mailto`).
- Fechar: botão Fechar, Escape (evento `cancel`, com a animação de saída) ou escolher um destino. Ao escolher um destino, o menu fecha e a rolagem vai para a âncora (sem `smooth` com reduced motion); nos outros casos o foco volta ao botão "Menu".
- Animação: tabela da seção 6 (entra em 280ms, sai em 200ms). Reduced motion: abre e fecha sem deslocamento.
- Se a janela passar de 767px com o menu aberto (`matchMedia('(min-width: 768px)')`, evento `change`), o menu fecha sem animação.

**Abertura.**

- H1: **Sites para o seu negócio ser encontrado e chamado.**
- Lead: "Sou Kauê Ribeiro, da WunderHub. Crio landing pages, sites institucionais e lojas virtuais para pequenos negócios e profissionais. Quem atende você sou eu, da primeira conversa à publicação."
- Placa: **Chamar no WhatsApp** (`{{whatsappUrl}}`, `target="_blank" rel="noopener"`).
- Link: **Ver os trabalhos** (`#trabalhos`).
- Placas da fachada (aparecem no fim do palco): "Côdea, padaria de bairro" · "Junco, fisioterapia" · "Louça Torta, cerâmica" (cada uma é um link para `#conceito-<slug>`).

**Trabalhos.**

- H2: **Três negócios fictícios, três demonstrações navegáveis**
- Texto: "Criei estas marcas para mostrar decisões diferentes de estrutura, texto e interação. Nenhuma delas é cliente real, e cada demonstração avisa isso na própria página."
- Filme: botão "Assistir ao filme" com legenda "Filme da fachada, 18 segundos, sem som. Mostra o letreiro abrindo, as três demonstrações e o contato."

Linha 1, `#conceito-codea`:
- Nome: **Côdea**
- Linha de tipo: "Padaria de bairro. Landing page de uma página."
- Objetivo: "Fazer quem passa ver o que saiu do forno hoje e encomendar para retirar."
- Decisões:
  - A: "Horário e aviso de aberto ou fechado no topo, porque a primeira dúvida de quem passa é se a padaria está aberta."
  - B: "Cardápio do dia com filtros e preço visível, para escolher sem precisar perguntar."
  - C: "A encomenda monta a mensagem pronta, então o pedido chega organizado para quem atende."

Linha 2, `#conceito-junco`:
- Nome: **Junco**
- Linha de tipo: "Clínica de fisioterapia. Site institucional com quatro páginas."
- Objetivo: "Explicar os tratamentos com calma e levar a pessoa a pedir a primeira avaliação."
- Decisões:
  - A: "A primeira pergunta do site é o que a pessoa sente, como dor nas costas ou volta ao treino. O nome técnico do tratamento aparece depois dessa escolha."
  - B: "Uma página só para explicar a primeira consulta, que é onde aparecem as dúvidas."
  - C: "Pedido de horário em quatro passos curtos, com resumo antes de enviar."

Linha 3, `#conceito-louca-torta`:
- Nome: **Louça Torta**
- Linha de tipo: "Cerâmica feita à mão. Loja virtual."
- Objetivo: "Mostrar cada peça de perto e deixar a compra simples."
- Decisões:
  - A: "Filtros por tipo de peça, cor do esmalte e pronta entrega."
  - B: "Na página do produto, trocar o esmalte troca a foto, para ver a cor antes de comprar."
  - C: "Sacola lateral com subtotal e prazo, sem tirar a pessoa da página."

Ações de cada linha: link **Abrir demonstração**; botão **Ver decisões** (nome acessível "Ver decisões de Côdea"; quando aberto, "Fechar decisões"); dentro do painel, **Testar aqui** (só com `pointer: fine` e largura ≥ 1024px).

**Serviços.**

- H2: **Três formatos de site**
- Texto: "Cada formato resolve um tipo de pedido. Se você ainda não sabe qual é o seu, a gente decide na primeira conversa."

Landing page:
- Resumo: "Uma página com um objetivo só: pedir orçamento, reservar, encomendar ou chamar no WhatsApp."
- Para quem é: "Para quem tem um serviço ou produto principal e quer que a pessoa tome uma ação clara."
- O que inclui: "Uma página pensada primeiro para o celular, texto em blocos curtos, botão de contato sempre por perto e link direto para o WhatsApp."
- O que você precisa me mandar: "O que você vende, para quem, os preços que quiser mostrar e as fotos que já tiver."
- Link: "Ver o exemplo: Côdea" → `#conceito-codea`

Site institucional:
- Resumo: "Poucas páginas, cada uma respondendo a uma pergunta de quem pensa em contratar você."
- Para quem é: "Para profissionais e empresas de serviço que precisam explicar o que fazem e passar confiança antes do primeiro contato."
- O que inclui: "Páginas como início, serviços, como funciona e contato, com navegação simples e textos revisados junto com você."
- O que você precisa me mandar: "A lista dos seus serviços, as perguntas que os clientes mais fazem, endereço e horários, se houver."
- Link: "Ver o exemplo: Junco" → `#conceito-junco`

Loja virtual:
- Resumo: "Catálogo com filtros, página de produto e sacola, para quem vende peças ou produtos pela internet."
- Para quem é: "Para quem tem produtos com fotos, preços e variações e quer vender sem depender só de mensagens."
- O que inclui: "Catálogo com filtros, uma página para cada produto com suas variações, sacola e a forma de pagamento que combinarmos."
- O que você precisa me mandar: "Fotos dos produtos, preços, variações como cor ou tamanho, e como você entrega."
- Link: "Ver o exemplo: Louça Torta" → `#conceito-louca-torta`

**Como trabalho** (sobre a Chapa).

- H2: **Como trabalho**
- Texto: "O projeto ganha peso aos poucos. Escolha uma etapa para ver o que muda nela."
- Rótulo do trilho: "Etapa do projeto"
- Lista sempre visível (`<ol>`):

1. **Conversa**
   - O que eu faço: "Pergunto o que você vende, para quem e o que a pessoa precisa conseguir fazer no site."
   - O que você recebe: "Um resumo escrito com o objetivo do site e o público."
   - O que preciso de você: "Uma conversa, por chamada ou por mensagem, e exemplos de sites que você gosta ou não gosta."
2. **Mapa**
   - O que eu faço: "Organizo o conteúdo: quais páginas, em que ordem e que pergunta cada uma responde."
   - O que você recebe: "O mapa das páginas e a lista do que falta, como textos, fotos e preços."
   - O que preciso de você: "Que você revise o mapa e me mande o material da lista."
3. **Desenho**
   - O que eu faço: "Desenho as telas começando pelo celular, com a cara do seu negócio."
   - O que você recebe: "Uma prévia navegável para aprovar ou pedir ajustes."
   - O que preciso de você: "Seus comentários sobre a prévia, de uma vez só sempre que der."
4. **Construção**
   - O que eu faço: "Escrevo o código, testo em telas de vários tamanhos e confiro velocidade e acessibilidade."
   - O que você recebe: "O site completo num endereço de teste."
   - O que preciso de você: "Uma última conferência de textos, preços e contatos."
5. **No ar**
   - O que eu faço: "Publico o site e confiro com você se o WhatsApp e o e-mail estão funcionando."
   - O que você recebe: "O site publicado no endereço combinado."
   - O que preciso de você: "Acesso ao domínio, se você já tiver um."
- Linha final: "Você fala comigo em todas as etapas. O prazo de cada projeto a gente combina na primeira conversa."

**Quem cuida do seu site** (Grafite Parede, colunas 3 a 9).

- H2: **Quem cuida do seu site**
- Parágrafo 1: "Sou Kauê Ribeiro, e WunderHub é o nome do meu trabalho. Eu mesmo converso com você, organizo o conteúdo, desenho as telas, escrevo o código e publico o site."
- Parágrafo 2: "Por isso você não precisa repetir o pedido para várias pessoas, e cada decisão tem alguém que responde por ela."
- Parágrafo 3: "Os projetos desta página são conceitos que criei com marcas fictícias. Quando você me chamar, mostro de perto por que cada escolha foi feita."

**Contato (Porta).**

- H2: **Vamos conversar sobre o seu site**
- Texto: "Me conte o que você vende e o que precisa no site. Respondo pelo WhatsApp ou por e-mail."
- Placa: **Chamar no WhatsApp**, com o número visível ao lado: "+55 (11) 95930-0903".
- E-mail: link **kaueribeiro12@gmail.com** (`{{mailtoUrl}}`) e botão **Copiar e-mail** (só com JS e Clipboard API). Confirmação: o botão passa a "E-mail copiado" por 2s e uma região `role="status"` anuncia "E-mail copiado". Falha: "Não deu para copiar. Selecione o endereço acima e copie."

**Configurador** (depois da Porta, sobre Grafite Parede; só com JS, `hidden` no HTML até o módulo carregar):

- H3: **Monte um rascunho do pedido**
- Texto: "Marque o que você imagina. Eu recebo a mensagem pronta e a gente ajusta na conversa."
- Fieldset 1, legenda "Que tipo de site você precisa?": Landing page · Site institucional · Loja virtual · Ainda não sei (rádios; padrão: nenhum).
- Fieldset 2, legenda "O que o site precisa ter?": Botão de WhatsApp · Cardápio ou catálogo · Lista de serviços · Horários ou agenda · Mapa e endereço · Galeria de fotos · Sacola de compras · Perguntas frequentes (checkboxes).
- Campo: "Nome do negócio (opcional)".
- Prévia: rótulo "Sua mensagem", `<output>` com quebra de linha preservada.
- Modelo da mensagem: "Oi, Kauê! Vim pelo site da WunderHub.{ Meu negócio se chama NOME.}{ Preciso de TIPO.}{ O site precisa ter: ITEM1, ITEM2 e ITEM3.} Podemos conversar?" (cada trecho entre chaves só entra se preenchido; "Ainda não sei" vira "Ainda não sei qual tipo de site preciso.").
- Botões: **Enviar este rascunho pelo WhatsApp** (link `wa.me` com o texto) e **Enviar por e-mail** (mailto com assunto "Site para o meu negócio" e o corpo).
- Aviso fixo: "O site não envia nada sozinho. O WhatsApp ou o seu e-mail abre com a mensagem pronta e você revisa antes de mandar."
- Resumo para leitor de tela (`aria-live="polite"`, atualizado 500ms depois da última mudança): "Rascunho com 4 itens: landing page, botão de WhatsApp, cardápio ou catálogo, mapa e endereço."

**Barra de WhatsApp no mobile** (<768px): "Chamar no WhatsApp".

**Rodapé.** Wordmark e símbolo exploratório; "WunderHub, sites para pequenos negócios e profissionais. Feito por Kauê Ribeiro."; `<nav id="mapa" aria-label="Nesta página">` com Trabalhos, Serviços, Como trabalho e Contato; links WhatsApp e e-mail; "Côdea, Junco e Louça Torta são marcas fictícias criadas como demonstração."; "© {{ano}} WunderHub"; link "Voltar ao topo".

---

### 5.2 Momento 2: o letreiro se parte (vitrine)

- **Gatilho:** botão "Ver decisões" de cada linha (`aria-expanded`, `aria-controls="painel-<slug>"`), por clique, toque, Enter ou Espaço. Também abre por `hashchange` para `#conceito-<slug>` (placas da fachada, links "Ver o exemplo" dos serviços).
- **Nome partido:** o `<h3>` tem o nome em texto real (visualmente oculto) e duas cópias `aria-hidden` sobrepostas, recortadas por uma reta de 16° que passa pelo centro do nome (polígonos estáticos gerados pelo script de métricas; quando a reta sai pela base ou pelo topo do nome, o polígono é recortado na caixa).
- **Estado inicial (fechado):** fenda de 4px (a de baixo deslocada 4px na perpendicular), aresta polida visível, painel `grid-template-rows: 0fr` e `inert`.
- **Abrir:**
  1. CSS: painel `0fr → 1fr` em 480ms `--ease-corte`; o `inert` sai antes da animação.
  2. Motion: metade de cima sobe 8px na perpendicular e a de baixo desce mais 4px (fenda total de 16px), 240ms `--ease-corte`.
  3. Motion: em cada quadro de captura, uma persiana em Grafite Parede que cobre a imagem desliza para fora ao longo da perpendicular (de `translate(0, 0)` até `translate(−0,287 × H, H)`, com H medido uma vez ao abrir), 520ms `--ease-corte`, stagger 60ms (desktop, depois celular). A imagem vai de escala 1,04 a 1 no mesmo tempo. O quadro tem clip-path estático; nada de clip-path animado.
  4. Motion: marcadores A, B, C (quadrados de 32px em Vermelho Acrílico com a letra em branco, `aria-hidden`) entram com opacidade 0 → 1 e y 8px → 0, 160ms `--ease-resposta`, atraso 320ms, stagger 60ms.
  5. Motion: objetivo, decisões e links entram com opacidade 0 → 1 em 180ms, atraso 200ms.
  6. `history.replaceState(null, '', '#conceito-<slug>')`.
- **Uma linha aberta por vez:** abrir outra fecha a anterior (painel em 240ms `--ease-saida`, persianas voltam em 200ms, metades voltam à fenda de 4px) e a nova recebe `scrollIntoView({ block: 'nearest' })` (comportamento `smooth` só sem reduced motion).
- **Estado de carga:** com JS, a linha 1 (Côdea) começa aberta, sem animação, para que capturas grandes apareçam logo depois do palco. Se a URL tiver `#conceito-<slug>`, essa linha começa aberta no lugar dela, também sem animação.
- **Reverso:** o mesmo botão ou Escape com o foco dentro da linha fecha: persianas voltam pelo mesmo caminho em sentido contrário (a direção indica o fechamento), painel `1fr → 0fr`, foco volta ao botão, painel recebe `inert`, hash é removido com `replaceState`.
- **Interrupção:** um novo clique no meio chama `stop()` nas animações da linha e anima do valor atual na direção nova. Sem fila.
- **Teclado:** Tab percorre botão, links do painel, próxima linha. Escape fecha. Alvos ≥ 48px.
- **Toque e mobile:** o painel mostra só a captura de celular (390) com os marcadores do celular; "Abrir demonstração" vira botão de largura total com 56px; "Testar aqui" não existe.
- **Reduced motion:** sem deslocamento das metades, sem persianas (imagens já visíveis), painel alterna instantâneo; a fenda de 16px aparece como estado.
- **Sem JS:** todos os painéis abertos (o estado fechado só existe sob `.js`), botões "Ver decisões" ocultos, links de demonstração funcionando.
- **Falha de imagem:** o quadro mostra Grafite Parede com "Captura indisponível. Abra a demonstração para ver a página." e o link continua.

## 6. Especificação das interações

| Interação | Gatilho | Duração | Easing | Stagger | Distância | Profundidade |
| --- | --- | --- | --- | --- | --- | --- |
| Hover e foco de links | hover, `:focus-visible` | 120ms | `--ease-resposta` | | sublinhado 1px → 2px; cor Prata → Prata Luz | |
| Placa pressionada | `:active` | 120ms | `--ease-resposta` | | translate 2px na perpendicular | |
| Corte na carga | fonte pronta | 520ms varredura + 240ms descida (total ≤ 940ms) | `--ease-corte` | 90ms por vão | 6px | |
| M1 palco | rolagem | ligado a p (linear) | linear por faixa de p | | 22svh / 6svh (mobile 7 / 2 por andar) | véu 0,75 → 0, escala 1,06 → 1, x ±12px |
| Placas da fachada, entrada | p ≥ 0,85 | 240ms | `--ease-corte` | 90ms | clip-path ao longo do corte | |
| Placas da fachada, saída | p < 0,85 | 200ms | `--ease-saida` | | | |
| M2 painel abrir | botão | 480ms | `--ease-corte` | | 0fr → 1fr | |
| M2 metades do nome | botão | 240ms | `--ease-corte` | | 8px cima, +4px baixo | |
| M2 persianas | botão | 520ms | `--ease-corte` | 60ms | altura do quadro na perpendicular | imagem 1,04 → 1 |
| M2 marcadores A/B/C | botão | 160ms, atraso 320ms | `--ease-resposta` | 60ms | y 8px | |
| M2 textos | botão | 180ms, atraso 200ms | `--ease-resposta` | | opacidade | |
| M2 fechar | botão, Escape, outra linha | 240ms painel, 200ms persianas | `--ease-saida` | | | |
| Testar aqui, abrir | botão | 280ms | `--ease-corte` | | y 24px, opacidade | |
| Testar aqui, fechar | Fechar, Escape | 200ms | `--ease-saida` | | y 24px, opacidade | |
| Troca de largura no Testar aqui | rádio | 240ms | `--ease-corte` | | largura do iframe | escala informada no rótulo |
| M3 teclado e botões | setas, botões | 420ms | `--ease-corte` | | eixos de fonte | |
| M3 soltar o polegar | `pointerup` | spring 0,3s, bounce 0 | spring | | até a etapa inteira | |
| M3 guias | entrar em Mapa | 400ms | `--ease-corte` | 40ms | `stroke-dashoffset` | |
| M3 grade | entrar em Desenho | 180ms | `--ease-resposta` | | opacidade | |
| M3 placa No ar | entrar em No ar | 240ms | `--ease-corte` | | clip-path ao longo do corte | |
| M3 dica de primeira entrada | primeira vez em vista | 700ms | `--ease-corte` | | e 1 → 1,18 → 1 | |
| Porta | miolo 50% visível ou `focusin` | 120ms + 720ms | `--ease-resposta`, depois `--ease-corte` | | metade da altura do miolo, vertical | |
| Menu mobile, abrir | botão Menu | 280ms | `--ease-corte` | | y −24px → 0, opacidade | |
| Menu mobile, fechar | Fechar, Escape, link | 200ms | `--ease-saida` | | y 0 → −24px | |
| Barra de WhatsApp | fim do palco / Porta visível | 240ms entra, 200ms sai | `--ease-corte` / `--ease-saida` | | y 100% | |
| Copiar e-mail | botão | troca de texto 160ms (crossfade), volta após 2s | `--ease-resposta` | | | |
| Configurador | mudança de campo | prévia atualiza sem animação; resumo `aria-live` com 500ms de espera | | | | |
| Filme | botão Assistir | troca do poster pelo vídeo, sem animação | | | | |

Nenhuma seção entra com fade ou slide. Nada depende só de hover.

---

## 8. Vitrine

- **Na home:** a seção Trabalhos é a vitrine (seção 5.2). Desktop: linhas de largura total; painel com captura desktop 960w (srcset 480/960/1440, `sizes="(min-width: 1024px) 58vw, 100vw"`) num quadro com chanfro, a captura de celular 390 (srcset 390/780) sobreposta no canto inferior direito, cobrindo 22% da largura do quadro, e os marcadores A/B/C nas posições gravadas pelo script de capturas. Mobile: só a captura de celular, com seus marcadores.
- **Dados:** `src/data/conceitos.js` (slug, nome, eixos, linha de tipo, objetivo, decisões, URLs relativas, nomes das capturas) e `src/generated/decisoes.json` (posições em % dos elementos `[data-decisao]` em 1440×900 e em 390×844).
- **Link direto:** "Abrir demonstração" sempre visível, nunca só no hover, com URL relativa (`conceitos/codea/`), funcionando sob qualquer base path.
- **Testar aqui** (só `pointer: fine` e largura ≥ 1024px): `<dialog aria-labelledby>` com `showModal()` (foco preso, fundo inert e Escape nativos).
  - Cabeçalho: H2 "Côdea em teste" (`tabindex="-1"`, recebe o foco ao abrir); grupo de rádios "Largura": Celular, 390 px · Tablet, 768 px · Computador, 1280 px (padrão: Computador); link "Abrir em página inteira"; botão "Fechar".
  - Corpo: `<iframe title="Demonstração de Côdea">` com `src` definido só ao abrir; largura igual ao preset; se o preset não couber, um wrapper aplica `transform: scale()` com origem no topo esquerdo e o rótulo informa "Escala 72%".
  - Fechar: botão, Escape (evento `cancel` com animação de saída) ou clique no fundo; o iframe volta a `about:blank`; o foco volta ao botão "Testar aqui" que abriu (chamado explicitamente além do comportamento nativo).
- **Filme:** fachada de vídeo (seção 9.5).

---

### 9.5 Integração no site

- Na seção Trabalhos (desktop: colunas 9–12 ao lado do H2; mobile: depois das três linhas).
- **Fachada de vídeo:** `<figure>` com `<button class="filme__abrir">` contendo `<img>` do poster (srcset 640/1280, `loading="lazy"`, `alt=""`) e o texto "Assistir ao filme"; `<figcaption>` "Filme da fachada, 18 segundos, sem som. Mostra o letreiro abrindo, as três demonstrações e o contato." Nenhum byte de vídeo é baixado antes do clique.
- **No clique:** o botão é trocado por `<video controls muted playsinline preload="auto" poster="…">` com `<source>` WebM e MP4 (1080 para largura ≥ 1024px sem `saveData`; 720 nos demais) e `play()` chamado em seguida; o foco vai para o vídeo. Controles nativos (play, pausa, tela cheia). Muted por padrão; sem faixa de áudio.
- **Pausa:** `inView` ao sair da tela, `visibilitychange` com a aba oculta e `pagehide`.
- **Falha:** `error` no vídeo devolve o poster com "Não foi possível carregar o filme. Tente de novo." e o botão volta.
- URLs montadas com `import.meta.env.BASE_URL + 'media/…'` (arquivos em `public/media/`).

---

## 12. Critérios de aceite e QA

1. **Quadros do palco:** screenshots de `.fachada` em p = 0; 0,12; 0,35; 0,62; 0,85; 1 em 1440×900, 390×844 e 360×780. Em p=0 o nome lê contínuo e a fenda é preta; em 0,35 as janelas estão totalmente abertas; em 0,85 as placas entram; nenhum quadro mostra metades desalinhadas fora do vetor do corte.
2. **Prata:** em p=0, comparar por screenshot com as regras anti-chrome; Chapa com preto ≥ 10:1 no pixel mais escuro sob texto.
3. **Primeira tela:** H1, lead e "Chamar no WhatsApp" visíveis no primeiro paint em 360, 390, 768 e 1440; base do letreiro a 32px da dobra em 1440×900.
4. **Sem JS** (JavaScript desligado): conteúdo completo, palco estático em p=0,62 com placas, painéis abertos, porta aberta, links de WhatsApp e e-mail corretos.
5. **Reduced motion:** mesmas informações e ações; nenhuma animação de deslocamento; palco sem pista.
6. **Altura < 500px e zoom de 200% em 1440×900:** palco sem pista; nada cortado; sem rolagem horizontal.
7. **Teclado:** skip link; ordem de Tab; foco visível em todas as superfícies e nunca coberto pelo header, pela barra de WhatsApp ou pelas folhas da Porta; Escape fecha painel, menu e diálogos e devolve o foco; range com setas, Home e End; menu mobile sem JS leva a `#mapa`.
8. **Leitor de tela:** árvore de acessibilidade sem duplicatas do letreiro e dos nomes partidos; `aria-valuetext` do range; anúncios de "E-mail copiado" e do resumo do configurador. axe-core sem violações sérias.
9. **Rolagem:** lenta, rápida, retorno pelas cenas, âncoras (`#trabalhos`, `#conceito-*`, `#contato`), recarregar no meio do palco, voltar pelo histórico (bfcache sem repetir a carga), resize de 1440 para 390.
10. **Rede:** nenhum 404, nenhum erro de console, vídeo só depois do clique, iframe só ao abrir "Testar aqui".
11. **Base path:** build com `BASE_PATH=/wunderhub/` servido em subdiretório: home, demos, fontes, imagens, vídeo e links de volta funcionando.
12. **Desempenho (laboratório, Lighthouse mobile no Chromium 141 local, declarado como tal):** Performance ≥ 90, Acessibilidade e SEO ≥ 95, JS inicial e bytes da primeira experiência medidos e registrados; elemento LCP identificado (esperado: H1 ou letreiro, nunca bloqueado por JS); quadros do palco ≤ 4ms de script com CPU 4x.
13. **Demos:** todas as interações da seção 7 funcionando em 390 e 1440; nenhuma envia dados; avisos de demonstração visíveis.
14. **Showreel:** `check` sem erros, 540 quadros, quadros revisados, reprodução real no site.

---

