# Hipóteses criativas e escolha da direção

Três direções desenvolvidas para o novo portfólio da WunderHub (Kauê Ribeiro), avaliadas por um júri com três lentes. A direção escolhida está especificada em `docs/direction.md`.

Restrições comuns às três: paleta de partida preto, grafite e vermelho, com a prata como material (pedido do dono); linguagem angular; PT-BR direto; sem clientes, métricas ou depoimentos inventados; conceitos demonstrativos como marcas fictícias; site estático (GitHub Pages); sem WebGL no render do Hyperframes.

---

## 1. Letra-Caixa: a fachada que vira vitrine (eixo tipografia)

- **Ideia central.** O site é a fachada da WunderHub, construída como o letreiro em letra-caixa do comércio de bairro. Aço escovado dá a prata, acrílico dá o vermelho, o painel de ACM dá o preto e a parede dá o grafite. O wordmark WUNDERHUB, na Anybody variável (peso 100–900, largura 50–150), é cortado a 16° em três vãos (WUN | DER | HUB).
- **Primeira composição.** H1 real e lead à esquerda e à direita no topo; placa vermelha "Chamar no WhatsApp". Nos 40% inferiores, o letreiro em prata escovada sangrando até as margens, com o corte de 16° e uma fenda de 6px em cada vão.
- **Movimento.** Um vetor só: o corte de 16° e a sua perpendicular. Na carga, uma faixa especular corre pelos cortes. Ao rolar (palco sticky), as janelas se abrem, as letras perdem peso até virar caixilhos e as capturas dos conceitos acendem atrás. Sem rotação, blur, sombra ou 3D.
- **Trabalhos.** Três linhas como letreiros (não cards), cada nome com eixos que antecipam a identidade do conceito; o botão "Ver decisões" parte o nome e abre o painel com capturas e decisões.
- **Mobile.** A fachada horizontal vira uma torre de três andares (WUN / DER / HUB) justificada pelo eixo de largura; pista curta; menu em tela cheia; barra inferior de WhatsApp.
- **Processo e contato.** A palavra SEU NEGÓCIO ganha peso e largura num trilho de 5 etapas sobre uma chapa de prata; no fim, o letreiro volta inteiro e se abre como porta para o contato.

## 2. Chapa e Fio (eixo material)

- **Ideia central.** O site é uma chapa de aço escovado com um fio vermelho riscado a 17°. Todo conteúdo novo aparece quando a chapa é cortada no fio e se abre como painel: o gesto de quem faz sob medida.
- **Primeira composição.** Tela inteira de prata clara, texto gravado (H1 em Geologica com eixo de nitidez), ficha dos três serviços alinhada ao fio por `shape-outside`, uma fenda no pé do fio mostrando um lampejo do primeiro conceito.
- **Movimento.** Marca, corte, abertura. Na carga o fio risca, a fenda morde e uma faixa de luz cruza; ao rolar, a chapa abre como porta de correr em duas fases. Luz que segue o ponteiro (ou a rolagem no celular).
- **Trabalhos.** Tablist de plaquetas mais um visor chanfrado com captura desktop e lasca mobile; troca de conceito por "corte de troca"; prévia em `<dialog>`.
- **Mobile.** O fio atravessa sempre o eixo curto (raso em retrato), metades abrem na vertical, abas segmentadas sticky e swipe.
- **Destaque do júri.** Única proposta com protótipo renderizado; prata validada como aço escovado; a mais segura tecnicamente.

## 3. Gabarito: a bancada onde o site é apertado até funcionar (eixo bancada)

- **Ideia central.** O portfólio é um gabarito de montagem em vista frontal: mesa de grafite, régua e mordentes de prata usinada. Sites de negócios fictícios chegam como peças desenhadas e são "apertados" até funcionar.
- **Primeira composição.** H1 à esquerda, coluna de notas de decisão com pinos vermelhos, gabarito à direita com a landing de uma padaria em vista explodida e cotas vermelhas.
- **Movimento.** Máquina-ferramenta: avanço ligado à rolagem, aperto com spring, varredura angular de 12°, traçagem de cotas. Só eixos X e Y.
- **Trabalhos.** Bancada com lente Rascunho / Estrutura / Pronto ligada ao DOM real das demos, mordente que redimensiona o iframe e lista de peças em tabela.
- **Mobile.** Sem sticky; cada peça se monta ao passar pela tela; lente fixa na zona do polegar; navegação nativa para as demos.
- **Contato.** "Rascunho do seu site": o visitante escolhe o tipo de site e as peças e gera a mensagem pronta para WhatsApp ou e-mail.

---

## Notas do júri

| Hipótese | Marca e clareza comercial | Originalidade, assinatura e motion | Viabilidade técnica, desempenho e acessibilidade | Média |
| --- | --- | --- | --- | --- |
| Letra-Caixa (tipografia) | **8,1** | **8,5** | 7,4 | **8,00** |
| Chapa e Fio (material) | 7,6 | 7,0 | **8,2** | 7,60 |
| Gabarito (bancada) | 6,6 | 6,0 | 6,4 | 6,33 |

## Escolha

**Letra-Caixa** vence em duas das três lentes e tem a maior média. É a única metáfora que vem do mundo do cliente: todo dono de pequeno comércio conhece letreiro de fachada, e "o site é a fachada que leva quem passa até a porta" explica o serviço sozinho. A paleta ganha origem física (prata do aço, vermelho do acrílico, preto do ACM, grafite da parede), o que resolve o pedido da prata sem cair em "preto com um acento vermelho". A gramática de movimento é a mais disciplinada (um ângulo, dois planos, intensidade reservada) e qualquer quadro pausado é um letreiro válido.

A versão especificada corrige as fraquezas apontadas: o nome lê contínuo em p=0, a fenda em repouso é preta (sem leitura de "nome riscado", validado em protótipo), o palco ficou mais curto, a primeira linha de Trabalhos abre por padrão com capturas grandes, o processo mostra as 5 etapas sem exigir interação, um conceito de produto foi trocado por um serviço profissional, os eixos de fonte e os transforms usam um só relógio, as placas saíram de dentro do elemento `aria-hidden` e o LCP deixou de depender de JavaScript.

**Enxertos dos perdedores:**

- Da **Chapa e Fio**: receita de prata escovada com grão anisotrópico e faixa especular (validada por screenshot), clip-path estático com movimento só por transform, interrupção sem fila e reverso direcional, `replaceState` com hash por conceito, mensagem pronta do WhatsApp e "Copiar e-mail", seção curta "Quem cuida do seu site", serviço levando a "Ver o exemplo", captura mobile sobreposta à desktop, faixa "marca fictícia" em cada demo e o critério de aceite por quadros do palco.
- Do **Gabarito**: o configurador "Monte um rascunho do pedido" no contato (sem virar um quarto momento de motion), textos práticos "o que eu faço / o que você recebe / o que preciso de você" no processo e "para quem é / o que inclui / o que você precisa me mandar" nos serviços, marcadores A/B/C presos às capturas, presets 390/768/1280 no "Testar aqui", pipeline `npm run capturas` com Playwright, controles `inert` até serem revelados e o ícone de WhatsApp no header mobile.
