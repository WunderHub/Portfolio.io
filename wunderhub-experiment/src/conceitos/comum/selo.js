// Selo das demos (seção 7). O conteúdo é HTML estático (partial src/conceitos/comum/selo.html),
// então o aviso de marca fictícia aparece mesmo sem JavaScript. Este módulo só:
//  - marca html.em-teste quando a demo roda dentro do iframe do "Testar aqui" (a demo pode, por exemplo,
//    soltar barras fixas que atrapalham a prévia);
//  - garante target="_top" no "Voltar ao portfólio" de selos criados depois da carga.
// Contrato: init() devolve a função de limpeza.

export function init() {
  const raiz = document.documentElement;
  let emIframe = false;
  try {
    emIframe = window.self !== window.top;
  } catch {
    emIframe = true; // acesso negado ao topo: certamente dentro de um iframe
  }
  raiz.classList.toggle('em-teste', emIframe);
  for (const link of document.querySelectorAll('[data-selo] .selo__voltar')) link.target = '_top';
  return () => raiz.classList.remove('em-teste');
}
