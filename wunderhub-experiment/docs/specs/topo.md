# Direção: Letra-Caixa, a fachada que vira vitrine

Especificação implementável do novo portfólio da WunderHub (Kauê Ribeiro). Outros agentes implementam exatamente a partir deste documento. Quando algo aqui conflitar com a hipótese original (`docs/hypotheses.md`), vale este documento.

Fontes desta especificação: briefing do dono, `docs/research/resource-audit.md`, skills `frontend-design` e `motion` (lidas), os três julgamentos do júri e medições feitas para este documento (Chromium 141 headless, Playwright 1.56.1, fontes do npm `@fontsource-variable/*@5.3.0`). Um protótipo estático do letreiro foi renderizado para validar a prata e a leitura do nome (ver seção 13).

---

## 0. O que mudou em relação à hipótese vencedora

| Fraqueza apontada pelo júri | Correção nesta especificação |
| --- | --- |
| Em p=0 o nome lia como três sílabas soltas e como "wordmark gigante no hero" | Nome contínuo, sem intervalo extra entre os vãos; letreiro ocupa cerca de 32% da altura (não 40%); os vãos só se separam com a rolagem |
| Uma fenda colorida atravessando o nome lê como "nome riscado" (visto no protótipo) | Em repouso a fenda é preta (o painel de ACM fica fechado atrás); só a aresta polida marca o corte. As capturas aparecem só quando as janelas abrem |
| Risco de "chrome text" de banda de metal ou jogo | Receita de aço escovado validada por screenshot, com regras anti-chrome (seção 2.2) e critério de aceite |
| Pista de 160vh adiava a prova de capacidade | Pista de 120svh no desktop e 90svh no mobile; a primeira linha de Trabalhos abre por padrão com capturas grandes |
| Processo dependia de arrastar um slider | As 5 etapas ficam sempre visíveis numa lista com "o que eu faço / o que você recebe / o que preciso de você"; o trilho só destaca e transforma a palavra |
| Interpolar a Anybody por larguras médias soa retrô | Estados parados só nos extremos de largura (50–62 ou 125–150); larguras médias só aparecem durante o arraste |
| Ajustar o corpo da palavra do processo à coluna explodia a altura (medido: a palavra vai de 0,90em a 10,84em de largura) | Corpo fixo; o que muda é a largura da palavra |
| Três conceitos de produto, nenhum serviço profissional | Côdea (padaria), Junco Fisioterapia (serviço profissional), Louça Torta (loja) |
| Animar eixos de fonte em glifos grandes custa caro; dois relógios (ScrollTimeline e main thread) se descolam | Um único relógio: `scroll(callback)` alimenta um único escritor em `frame.render`; peso quantizado; `contain: layout paint style` |
| LCP dependia de `fonts.load` e do JS | O letreiro pinta só com CSS (`font-display: block` numa face dedicada, com preload); um script inline troca para o fallback em 900ms; o JS não esconde nada |
| Placas focáveis dentro de elemento `aria-hidden` | Placas numa `<nav>` irmã, fora do letreiro, com `inert` controlado |
| `range` com step 0,01 e setas reescritas | `step="1"` nativo para teclado e leitor de tela; o arraste contínuo é calculado à parte |
| Fallbacks `local()` inexistentes no Android e no Linux | Duas faces de fallback com lista ampla de `local()` e métricas medidas por script |
| Justificação dos andares no mobile medida em JS | `wdth` e larguras de célula pré-medidos no build e entregues como CSS |
| Clip-path animado em área grande | Todos os clip-paths de área grande são estáticos; revelações por persianas que se movem com `transform` |
| Na Porta, mover as folhas pela perpendicular desalinha o letreiro em deslocamentos grandes | Folhas da Porta se movem na vertical pura (exceção documentada em 2.6) e o configurador fica fora da porta |
| Geometria vertical do palco indefinida; com `contain: paint`, as metades abertas seriam cortadas (visto no quadro p=0,62 do protótipo) | Seção 5.1 fixa folgas acima e abaixo do letreiro, a fachada em largura total, a centralização na caixa sticky e a altura mínima da abertura |
| Foco podia ficar sob o header sticky, a barra de WhatsApp ou as folhas da Porta | `scroll-padding` no topo e na base, Porta aberta sem animação quando o gatilho é foco (seção 2.9) |

---

## 1. Conceito e princípios

**Conceito.** O site é a fachada da WunderHub, montada como o letreiro em letra-caixa do comércio de bairro: letras de aço inox escovado presas num painel de ACM preto, sobre a parede grafite, com placas de acrílico vermelho. A paleta pedida pelo dono ganha origem material: a prata é o aço das letras, o vermelho é o acrílico das placas, o preto é o painel, o grafite é a parede. O wordmark WUNDERHUB, na Anybody variável, é a estrutura da primeira tela. Três cortes a 16° (um por vão: WUN, DER, HUB) atravessam as letras. Ao rolar, os cortes se abrem como janelas, as letras perdem massa até virar caixilhos e, atrás delas, acendem as capturas reais dos três conceitos: a fachada vira vitrine. O roteiro termina com o mesmo letreiro abrindo como porta para o contato. A direção pertence a este estúdio porque descreve o trabalho de Kauê: montar a fachada digital que leva quem passa na calçada até a porta, que é a conversa.

**Princípios.**

1. **Um ângulo só: 16°.** Cortes, chanfros, placas e trajetórias derivam dele. Nada gira, nada quica, não há 3D, blur nem sombra.
2. **Prata é material, vermelho é placa.** A prata aparece como aço escovado (letreiro, chapa do processo, arestas). O vermelho só aparece como placa de ação ou de estado e ocupa no máximo cerca de 5% da área de qualquer tela; nunca é fundo de seção nem palavra destacada em título.
3. **A fachada mostra o trabalho real.** O que aparece pelas janelas são capturas das demos implementadas. Imagens nunca preenchem letras; aparecem atrás e entre elas.
4. **Um acontecimento, um scrub, dois gestos, uma porta.** Intensidade reservada: o corte na carga, o palco na rolagem, o painel de decisões, o trilho do processo e a porta do contato. O resto é estático: nenhuma seção entra com fade, hover só muda cor ou sublinhado.
5. **O texto comercial chega antes do espetáculo.** H1, lead e botão de WhatsApp são HTML real, visíveis no primeiro paint, nunca animados. O letreiro é decorativo (`aria-hidden`) e a página inteira funciona sem JavaScript.

---

### 2.10 Wordmark e símbolo

- **Wordmark:** "WUNDERHUB" em Anybody wdth 150, wght 800, 18px, Prata Luz, `letter-spacing: .01em`. No HTML o texto é "WunderHub" com `text-transform: uppercase`, para leitores de tela lerem o nome certo. Medida: 10,311em (186px a 18px).
- **Símbolo exploratório** (declarado como proposta, não como logo): o W da Anybody wdth 150 w800 cortado a 16°, com a metade de baixo deslocada 2px na perpendicular, Prata Luz sobre preto. Usado só no favicon (`public/favicon.svg`) e na assinatura do rodapé, com o texto "Símbolo exploratório" no `title` do SVG.

---

## 3. Arquitetura de informação e texto

### 3.1 Páginas

```
/                                        home (portfólio)
/conceitos/codea/                        Côdea, landing page de padaria
/conceitos/junco/                        Junco Fisioterapia, início
/conceitos/junco/tratamentos/            tratamentos (?para=dor|cirurgia|esporte|gestacao)
/conceitos/junco/primeira-consulta/      primeira consulta
/conceitos/junco/agendar/                pedido de avaliação (?tratamento=slug)
/conceitos/louca-torta/                  loja: vitrine e catálogo
/conceitos/louca-torta/produto/          produto (?p=slug&esmalte=slug)
```

### 3.2 Ordem da home e ritmo de fundos

| # | Seção | id | Fundo | Intensidade |
| --- | --- | --- | --- | --- |
| 0 | Header sticky | | Preto | Quieto |
| 1 | Abertura (H1, lead, CTA) e palco | `#topo` | Preto | Acontecimento na carga e M1 |
| 2 | Trabalhos | `#trabalhos` | Preto | M2 |
| 3 | Serviços | `#servicos` | Grafite Parede | Pausa, estático |
| 4 | Como trabalho | `#processo` | Chapa (prata escovada) | M3 |
| 5 | Quem cuida do seu site | `#sobre` | Grafite Parede | Pausa, só texto |
| 6 | Contato (Porta e configurador) | `#contato` | Preto | Revelação única |
| 7 | Rodapé | | Preto | Quieto |

### 3.3 Dados centralizados

`src/config.js` é a única fonte de contato e marca:

```js
export const contato = {
  marca: 'WunderHub',
  nome: 'Kauê Ribeiro',
  whatsappNumero: '5511959300903',
  whatsappExibicao: '+55 (11) 95930-0903',
  email: 'kaueribeiro12@gmail.com',
  mensagemPadrao: 'Oi, Kauê! Vim pelo site da WunderHub e quero conversar sobre um site para o meu negócio.',
  assuntoEmail: 'Site para o meu negócio',
};
export const whatsappUrl = (texto = contato.mensagemPadrao) =>
  `https://wa.me/${contato.whatsappNumero}?text=${encodeURIComponent(texto)}`;
export const mailtoUrl = (assunto = contato.assuntoEmail, corpo = '') =>
  `mailto:${contato.email}?subject=${encodeURIComponent(assunto)}${corpo ? `&body=${encodeURIComponent(corpo)}` : ''}`;
```

O HTML recebe esses valores no build por um plugin do Vite (`transformIndexHtml`, ordem `pre`) que troca os marcadores `{{whatsappUrl}}`, `{{whatsappExibicao}}`, `{{email}}`, `{{mailtoUrl}}` e `{{ano}}`. Assim os links funcionam sem JavaScript.

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

## 4. Wireframes

### 4.1 Desktop 1440, home inteira

```
y≈0  ┌────────────────────────────────────────────────────────────────────────────────────────┐
     │ [Pular para os trabalhos]  (visível só no foco)                                          │
     │ WUNDERHUB◸                               Trabalhos   Serviços   Como trabalho   Contato │ header 64, sticky
     ├────────────────────────────────────────────────────────────────────────────────────────┤
     │ ABERTURA, preto (bloco de texto com min-height para o letreiro tocar 32px acima da dobra)│
     │ col 1–7                                              col 9–12                            │
     │ Sites para o seu negócio ser                         Sou Kauê Ribeiro, da WunderHub.     │
     │ encontrado e chamado.                                Crio landing pages, sites           │
     │ H1 Anybody 62/800, 72/68, Prata Luz                  institucionais e lojas virtuais...  │
     │                                                      [▰▰ Chamar no WhatsApp ◣]           │
     │                                                      Ver os trabalhos                    │
y≈583│ ┌W──────U─────N──────┐┌D─────E────R─────┐┌H─────U─────B──────┐  letreiro p=0           │
     │ │‾‾‾‾‾‾‾‾‾‾╲          ││‾‾‾‾‾‾‾╲          ││‾‾‾‾‾‾‾╲           │  Anybody 50/900, 385px  │
     │ │  aresta    ╲ fenda  ││        ╲         ││        ╲          │  nome contínuo          │
     │ │  polida     ╲ preta ││         ╲        ││         ╲         │  3 cortes de 16°        │
y≈868│ └────────────────────┘└─────────────────┘└───────────────────┘  32px acima da dobra    │
y=900├──────────────────────────────────── dobra ─────────────────────────────────────────────┤
     │ PALCO: caixa sticky em top 64, pista 120svh. Estado em p=1:                              │
### 4.2 Mobile 390, home inteira

```
┌──────────────────────────────────────┐
│ WUNDERHUB◸            [WA] [Menu]    │ header 56; [WA] = botão-ícone "Chamar no WhatsApp", 48px
├──────────────────────────────────────┤
│ Sites para o seu                     │ H1 Anybody 62/800, 44/42
│ negócio ser                          │
│ encontrado e chamado.                │
│ Sou Kauê Ribeiro, da WunderHub.      │ lead Archivo 17/26
│ Crio landing pages, sites            │
│ institucionais e lojas virtuais...   │
│ [▰▰▰▰ Chamar no WhatsApp ▰▰▰▰▰▰◣]    │ 56px, largura total
│ Ver os trabalhos                     │ 48px
│ ┌──────────────────────────────────┐ │
│ │ W  U  N   corte 16° de canto a   │ │ andar 1, wdth 110,5
│ │      ‾‾‾‾╲ canto (10,6% → 89,4%) │ │
│ ├──────────────────────────────────┤ │
│ │ D  E  R                          │ │ andar 2, wdth 144,5
└─┴──────────────── dobra ───────────┴─┘
  │ H  U  B                          │   andar 3, wdth 134 (mesma largura, 358px)
  PALCO: sticky em top 56, pista 90svh; cada andar abre 7svh + 2svh;
  os andares descem em cascata (andar k desce k × 9svh); peso 900 → 220;
  uma captura desktop 480w por andar; placas abaixo de cada janela em p ≥ 0,85
├──────────────────────────────────────┤
## 5. Os momentos

Divisão de motores (uma propriedade, um dono):

| Propriedade | Dono |
| --- | --- |
| `transform`, opacidade do véu, escala da imagem de trás, `--peso`, `--brilho` do letreiro do palco | `src/js/letreiro/render.js` (único escritor, em `frame.render` do Motion) |
| Progresso p do palco | `scroll(callback)` do Motion 14.3 |
| Números da carga (varredura, descida) | `animate(0, 1, { onUpdate })` do Motion, lidos pelo renderizador |
| `clip-path` de placas pequenas (entrada e saída) | `animate()` do Motion |
| `grid-template-rows` dos painéis, cores, sublinhados, hover, foco, pressed | Transições CSS |
| `transform` das metades dos nomes, persianas, marcadores, opacidade de decisões (M2) | `animate()` do Motion em `src/js/vitrine.js` |
| Eixos da palavra do processo (`--w`, `--s`) | `src/js/processo.js` (único escritor, em `frame.render`) |
| `stroke-dashoffset` das guias do processo | `animate()` do Motion |
| `transform` das folhas da Porta | `animate()` do Motion em `src/js/porta.js` |
| Showreel | GSAP 3.14.2 dentro da composição Hyperframes (nunca no site) |

`MotionGlobalConfig.skipAnimations = true` quando `prefers-reduced-motion: reduce`, espelhado por `@media (prefers-reduced-motion: reduce)` no CSS (transições a 0ms) e ouvindo `change` do `matchMedia` para alternar em tempo real.

### 5.0 Acontecimento de carga: o corte (antes do M1)

- **Gatilho:** a Anybody pronta (`document.fonts.load('900 100px "Anybody Letreiro"')`), sem gesto. Só acontece se: há `.js`, não há reduced motion, a fonte resolveu em até 900ms e o palco está em p=0.
- **Estado inicial (CSS com `.js`):** metades encostadas (fenda 0), aresta polida invisível. O letreiro já está pintado e legível, então não atrasa o LCP.
- **Sequência:** para cada vão i (WUN, DER, HUB), com atraso `i × 90ms`: a faixa especular percorre a aresta da esquerda para a direita em 520ms (`--ease-corte`), deixando a aresta visível atrás dela; ao terminar, a metade de baixo desce 6px na perpendicular em 240ms (`--ease-corte`). Termina em 940ms.
- **Interrupção:** se a rolagem começar (p > 0), as animações recebem `complete()` e o estado final fica valendo.
- **Reduced motion, sem JS, fonte lenta, volta pelo bfcache:** estado final direto (fenda 6px, aresta visível), sem repetir.

### 5.1 Momento 1: a fachada vira vitrine (abertura → Trabalhos)

**Estrutura DOM:**

```html
<div class="palco" id="palco">                  <!-- altura: caixa + pista (só com .js) -->
  <div class="palco__caixa">                    <!-- position: sticky; top: var(--header-h); height: calc(100svh - var(--header-h)) -->
    <div class="fachada" aria-hidden="true">    <!-- contain: layout paint style; container-type: inline-size -->
      <div class="vao" data-vao="0">            <!-- um por vão; no mobile, um por andar -->
        <div class="vao__fundo">                <!-- overflow hidden; vai de −U a h + D -->
          <img src="…/codea-desktop-960.webp" alt="" width="960" height="600" loading="lazy" decoding="async" fetchpriority="low">
          <span class="vao__veu"></span>         <!-- preto, opacidade 0,75 → 0 -->
        </div>
        <div class="vao__metade vao__metade--cima">  <!-- fundo preto (ACM), clip-path estático acima do corte, estende U para cima e 64px nas laterais -->
          <span class="letras">…células…</span><span class="aresta">…</span>
        </div>
        <div class="vao__metade vao__metade--baixo"> <!-- fundo preto, clip-path estático abaixo do corte, estende D para baixo -->
          <span class="letras">…células…</span><span class="retorno">…</span>
        </div>
      </div>
      …
    </div>
    <nav class="placas" aria-label="Conceitos na fachada" inert>
      <a class="placa placa--conceito" href="#conceito-codea">Côdea, padaria de bairro</a> …
    </nav>
  </div>
</div>
```

Cada letra mora numa célula de largura fixa (a largura da letra em wght 900, gerada pelo script de métricas), com o glifo **centralizado** na célula, então perder peso não muda o layout: o intercolúnio cresce dos dois lados dentro da célula. Os painéis pretos das metades cobrem o plano de trás em repouso; a janela é o espaço entre as metades quando elas se afastam. Mapeamento: WUN → Côdea, DER → Junco, HUB → Louça Torta.

**Geometria do palco** (valores entre parênteses para 1440×900 e 390×844):

| Variável | Desktop (≥1024px) | Mobile (<1024px, torre) |
| --- | --- | --- |
| `--header-h` | 64px | 56px (64px de 768 a 1023) |
| `--caixa-h` | `calc(100svh - var(--header-h))` (836px) | igual (788px) |
| `--L`, altura do letreiro | `calc(.74 * var(--fs-letreiro))` (284,8px) | `calc(3 * .74 * var(--fs-letreiro))` (264,9px) |
| `--U`, folga de cima | `6svh` (54px) | `2svh` (16,9px) |
| `--D`, folga de baixo | `calc(6px + 22svh + 8px)` (212px) | `calc(6px + 7svh + 18svh + 8px)` (225px: abertura do andar 3 mais a cascata de 2 × 9svh) |
| `--pista` | `120svh` | `90svh` |

- `.topo { overflow-x: clip; }` para nenhum deslocamento gerar rolagem horizontal.
- `.js .palco { height: calc(var(--caixa-h) + var(--pista)); }`. Sem `.js`, com reduced motion ou com `max-height: 499px`, `.palco` tem altura automática.
- `.palco__caixa { position: sticky; top: var(--header-h); height: var(--caixa-h); display: grid; align-content: center; }`. A `.fachada` ocupa a **largura inteira** de `.topo` (as letras ficam recuadas por `--margem` dentro dela) e tem `padding-block: var(--U) var(--D)`. Assim `contain: layout paint style` não corta nada: as metades de baixo andam até 56px para a esquerda e 196px para baixo no desktop (18px e 63px por andar no mobile), as de cima até 15px para a direita e 52px para cima, e tudo cabe na caixa de pintura.
- Posição do letreiro dentro da caixa: `--o = (var(--caixa-h) - (var(--U) + var(--L) + var(--D))) / 2 + var(--U)` (196,6px desktop; 157px mobile).
- **Abertura no desktop:** `.abertura { min-height: calc(100svh - 32px - var(--L) - var(--o) - var(--header-h)); }` (322,6px). Com isso, no scroll 0 a base do letreiro fica 32px acima da dobra; ao rolar, o bloco do H1 sai pelo topo em fluxo normal e o palco gruda quando o topo dele chega a `--header-h`, que é p=0. Se o texto não couber nessa altura (telas baixas), o bloco cresce e o letreiro desce: o texto comercial nunca é comprimido.
- **Abertura no mobile:** sem `min-height`; a torre começa `--o` abaixo do fim do bloco de texto (em 390×844, por volta de 76% da altura, cortada pela dobra).
- **Placas da fachada:** dentro de cada janela, encostadas ao lábio de baixo do corte, a 24px do início do vão. `render.js` calcula a posição uma vez por `resize` (Motion `resize`) a partir de `letreiro.json` e da abertura completa (a=1), já que elas só aparecem com p ≥ 0,85.
- **Modo estático** (sem JS, reduced motion, altura < 500px, teto estourado): `.palco__caixa { position: static; height: auto; }`; a fachada mantém `padding-block: var(--U) var(--D)` e mostra a abertura completa.
- **Aceite de borda:** com a abertura completa (p=0,35), nenhum pixel de letra sai da viewport em 360, 390, 768 e 1440 (o glifo centralizado na célula e o traço inclinado do W dão a folga; conferir nos quadros da seção 12).

- **Gatilho:** rolagem nativa. `scroll((p) => {…}, { target: palco, offset: ['start ' + headerH + 'px', 'end end'] })`. A distância de p=0 a p=1 é exatamente a pista: 120svh com largura ≥ 1024px; 90svh abaixo disso.
- **Estado inicial (p=0):** nome contínuo, wght 900, fenda 6px preta, véu 0,75, plano de trás em escala 1,06, placas ocultas e `inert`.
- **Funções de p (todas puras, clamp em 0..1):**

| Faixa | Variável | Desktop (≥1024) | Mobile |
| --- | --- | --- | --- |
| 0 → 0,35 | abertura `a` | metade de baixo: `6px + a × 22svh` na perpendicular; metade de cima: `a × 6svh` na direção oposta | por andar: `6px + a × 7svh` e `a × 2svh`; andar k desce `k × a × 9svh` |
| 0,25 → 0,80 | peso `w` | wght `900 − w × 760` (até 140), passos de 20 | wght `900 − w × 680` (até 220), passos de 40 |
| 0,20 → 0,85 | luz `b` | véu `0,75 × (1 − b)`; escala da imagem `1,06 − 0,06 × b`; x da imagem `12px − 24px × b` | véu `0,75 × (1 − b)`; sem escala; sem x |
| 0 → 1 | brilho | `--brilho = 0,15 + 0,7 × p` | igual |
| ≥ 0,85 | placas | entram por clip-path ao longo do corte em 240ms (`--ease-corte`), stagger 90ms; perdem o `inert` | igual, uma placa abaixo de cada janela |

- **Estado final (p=1):** três janelas em paralelogramo abertas, letras como caixilhos finos em wght 140, capturas em brilho pleno, placas visíveis e focáveis. O sticky solta e a seção Trabalhos começa com as mesmas três linhas, na mesma ordem, com a mesma placa vermelha.
- **Reverso:** tudo é função de p; rolar de volta fecha as janelas e devolve o peso quadro a quadro. Ao cruzar 0,85 para baixo, as placas saem em 200ms (`--ease-saida`) e voltam a `inert`. Exceção: enquanto o foco estiver dentro da `nav.placas`, elas não saem nem recebem `inert`; quando o foco sai, voltam a seguir p.
- **Teclado:** Espaço, PageDown, setas e Home/End rolam nativamente; nada dentro do letreiro é focável. O skip link e o item Trabalhos do header vão para `#trabalhos`, depois do palco. A ordem de Tab segue: header, CTA, "Ver os trabalhos", (placas, quando visíveis), Trabalhos.
- **Toque:** rolagem nativa; sem `scroll-snap`, sem interceptar roda ou toque, sem Lenis.
- **Mobile:** torre de 3 andares; pista de 90svh; peso até 220; sem escala no plano de trás; capturas desktop 480w (cerca de 25 KB cada) porque o recorte paisagem lê melhor que o retrato.
- **Reduced motion, sem JS, altura < 500px (inclui zoom de 200% em 1440×900), teto de 3s estourado:** sem pista (`.palco` com altura automática) e um estado estático equivalente a p=0,62 com placas visíveis: janelas totalmente abertas, wght 390 no desktop e 440 no mobile, véu 0,25, escala 1, placas sem `inert`. Esse estado está todo em CSS (classe padrão sem `.js`), sem depender do script.
- **Falha de imagem:** `onerror` troca a imagem do vão por Grafite Parede com o nome do conceito em Archivo 650 (decorativo; o link real está na placa).
- **Fonte lenta (classe `.fonte-lenta`):** letreiro no fallback estreito, sem animar o peso (o fallback não é variável); as aberturas por transform continuam.
- **Motores:** `scroll` (Motion) entrega p; `render.js` escreve tudo num único `frame.render`, só quando algum valor quantizado muda; `animate` (Motion) para as placas. Nenhuma propriedade é escrita por CSS e JS ao mesmo tempo. `will-change: transform` nas metades só enquanto o palco está em vista (`inView` com margem de 50%).
- **Orçamento:** abaixo de 4ms de script + estilo + layout por quadro com CPU 4x mais lenta no painel Performance do Chromium. Se não bater, plano B: passos de peso de 40 também no desktop.

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

