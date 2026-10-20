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

### 5.3 Momento 3: o projeto ganha peso (Como trabalho, sobre a Chapa)

- **Controle:** `<input type="range" id="etapa" min="1" max="5" step="1" value="1">` com `<label for="etapa">Etapa do projeto</label>` e `aria-valuetext="Etapa 1 de 5: Conversa"` atualizado a cada `input`. Abaixo, cinco botões de etapa (desktop: "Conversa", "Mapa", "Desenho", "Construção", "No ar"; mobile: "1" a "5" com `aria-label="Etapa 1: Conversa"` etc.), com `aria-pressed` na ativa. O contêiner dos controles fica `hidden` sem JS.
- **Palavra:** "SEU NEGÓCIO" em Anybody, `aria-hidden` (a informação está na lista). Corpo fixo: desktop `font-size: calc(100cqi / 11)` (124px em 1376px de largura útil); mobile em duas linhas (SEU / NEGÓCIO), `font-size: calc(100cqi / 7.3)` (49px em 358px). Caixa com altura fixa (1 ou 2 linhas de 0,74em), sem CLS. Larguras medidas (em em, frase inteira): 0,897 / 1,509 / 3,332 / 4,231 / 10,835; NEGÓCIO: 0,586 / 1,012 / 2,247 / 2,874 / 7,211.
- **Estados (wght/wdth):** 1 Conversa 100/50, contorno de 1,5px preto e preenchimento transparente; 2 Mapa 300/50, contorno, guias SVG em Vermelho Acrílico (linha de base, altura de versal, três colunas) desenhadas por `stroke-dashoffset` em 400ms `--ease-corte`, stagger 40ms; 3 Desenho 560/62, preenchimento Grafite Fio e grade de 12 colunas (faixas alternadas em preto a 6%) entrando por opacidade em 180ms; 4 Construção 850/62, guias e grade saem em 200ms, palavra preta sólida; 5 No ar 900/150, corte de 16° na palavra com aresta branca de 2px e placa vermelha "No ar" entrando por clip-path ao longo do corte em 240ms.
- **Interpolação:** o valor visual e ∈ [1, 5] é contínuo; com `i = floor(e)` e `t = e − i`, wght e wdth interpolam linearmente entre os estados i e i+1. Cores e camadas seguem a etapa arredondada, com transição CSS de 160ms. Os estados parados ficam sempre nos extremos de largura (50, 62 ou 150).
- **Arraste:** em `pointerdown` no range, o código lê `pointermove` (com captura) e calcula e a partir da posição do ponteiro no trilho; o valor nativo do range continua andando em passos inteiros (é o que o leitor de tela anuncia). Em `pointerup`, e encaixa no inteiro mais próximo com `encaixe` (spring de 0,3s, bounce 0).
- **Teclado:** setas mudam uma etapa (nativo), Home e End vão às pontas (nativo); a cada `input`, e anima até o novo inteiro em 420ms `--ease-corte`.
- **Botões de etapa:** definem o valor do range, disparam `input` e animam como o teclado.
- **Lista sempre visível:** `<ol class="etapas">` com as 5 etapas, cada uma com `<h3>`, uma mini-palavra "SEU NEGÓCIO" a 28px nos eixos da etapa (`aria-hidden`) e os três textos. A etapa ativa ganha borda superior de 4px em Vermelho Acrílico e texto preto; as outras ficam em Grafite Parede (8,79:1). Nada fica oculto.
- **Dica de primeira entrada:** na primeira vez que o trilho entra em vista (`inView`, amount 0,6), o polegar vai de 1 a 1,18 e volta em 700ms. Uma vez só; não acontece com reduced motion nem se o visitante já interagiu.
- **Reverso:** arrastar para trás devolve peso e largura de forma contínua; as guias saem com `stroke-dashoffset` inverso em 200ms.
- **Toque:** polegar de 48px, trilho em largura total, `touch-action: manipulation` no range e `pan-y` no restante da seção.
- **Mobile:** palavra em duas linhas; acima do trilho, o nome da etapa atual em Anybody 62/800 a 24px ("Etapa 3 de 5: Desenho"); botões 1–5 de 48×48px; lista completa empilhada abaixo.
- **Reduced motion:** troca de etapa sem tween (peso e largura saltam), guias aparecem prontas, sem dica.
- **Sem JS:** sem trilho nem palavra grande; a lista com as cinco mini-palavras mostra a progressão.
- **Motores:** `processo.js` é o único escritor de `--w` e `--s` (em `frame.render`); Motion `animate` para números (e), guias e placa; CSS para cores.

### 5.4 Revelação única: a Porta (Contato)

- **Estrutura:** `.porta__cima` (metades de cima do letreiro WUNDERHUB, Anybody Letreiro 50/900, `aria-hidden`), `.porta__miolo` (H2, texto, WhatsApp, e-mail, copiar), `.porta__baixo` (metades de baixo). Cada folha é um painel preto que se estende para longe da abertura (a de cima para cima, a de baixo para baixo); a seção tem `overflow: clip`. O letreiro da Porta usa o mesmo corpo do hero no desktop e uma linha de `100cqi / 3.5756` no mobile (cerca de 100px).
- **Estado inicial (com `.js` e sem reduced motion):** as folhas transladadas na vertical até se encontrarem no meio do miolo, formando o nome inteiro com a fenda de 6px; o miolo fica coberto pelos painéis pretos.
- **Gatilho:** `inView(porta__miolo, abrir, { amount: 0.5 })` ou `focusin` dentro do miolo. No caso do `focusin` (Tab chegando ao botão de WhatsApp antes de a rolagem revelar a porta), a abertura é instantânea, sem animação, para o foco nunca ficar sob as folhas. As duas vias chamam o `stop()` da outra.
- **Abertura:** fenda 6px → 14px em 120ms (`--ease-resposta`), depois as folhas voltam à posição de layout em 720ms (`--ease-corte`): a de cima sobe e a de baixo desce, puramente na vertical. Total 840ms. Só transforms.
- **Reverso:** não fecha. É uma revelação única por visita (rolar para cima não fecha).
- **Reduced motion, sem JS, teto estourado:** porta aberta desde o início.
- **Barra de WhatsApp no mobile:** aparece quando `#trabalhos` entra no topo da tela (fim do palco) com translateY 100% → 0 em 240ms `--ease-corte`; some (200ms `--ease-saida`) quando o miolo da Porta fica visível; respeita `env(safe-area-inset-bottom)`; reduced motion alterna sem animação.

---

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

