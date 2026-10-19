import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { contato, whatsappUrl, mailtoUrl } from './src/config.js';

const raiz = import.meta.dirname;

const paginas = {
  home: 'index.html',
  codea: 'conceitos/codea/index.html',
  junco: 'conceitos/junco/index.html',
  juncoTratamentos: 'conceitos/junco/tratamentos/index.html',
  juncoPrimeira: 'conceitos/junco/primeira-consulta/index.html',
  juncoAgendar: 'conceitos/junco/agendar/index.html',
  louca: 'conceitos/louca-torta/index.html',
  loucaProduto: 'conceitos/louca-torta/produto/index.html',
};

// Inclusão de partials: <!--#include src/partials/NOME.html --> vira o conteúdo do arquivo.
// Caminho relativo à raiz do projeto. Partials podem incluir outros (até 8 níveis).
// Parâmetros opcionais: <!--#include src/conceitos/comum/selo.html marca="Côdea" voltar="../../#conceito-codea" -->
// trocam {{$marca}} e {{$voltar}} dentro do partial (valores já em HTML, inseridos como estão).
// Roda em transformIndexHtml (ordem pre) ANTES do plugin de contato, então os marcadores
// {{...}} dentro dos partials também são trocados, e os assets referenciados neles passam pelo Vite.
const MARCADOR = /<!--#include\s+(\S+?)((?:\s+[\w-]+="[^"]*")*)\s*-->/g;
const ATRIBUTO = /([\w-]+)="([^"]*)"/g;
const pastasObservadas = [resolve(raiz, 'src/partials'), resolve(raiz, 'src/conceitos/comum')];

function incluir(html, profundidade = 0) {
  if (profundidade > 8) throw new Error('wh-partials: inclusão aninhada demais (ciclo?)');
  return html.replace(MARCADOR, (_, caminho, atributos) => {
    const arquivo = resolve(raiz, caminho);
    if (!arquivo.startsWith(raiz + sep)) throw new Error(`wh-partials: caminho fora do projeto: ${caminho}`);
    let conteudo;
    try {
      conteudo = readFileSync(arquivo, 'utf8');
    } catch {
      throw new Error(`wh-partials: partial não encontrado: ${caminho}`);
    }
    for (const [, chave, valor] of atributos.matchAll(ATRIBUTO)) conteudo = conteudo.replaceAll(`{{$${chave}}}`, valor);
    const faltando = conteudo.match(/\{\{\$[\w-]+\}\}/);
    if (faltando) throw new Error(`wh-partials: ${caminho} pede o parâmetro ${faltando[0]}`);
    return incluir(conteudo, profundidade + 1);
  });
}

const partials = () => ({
  name: 'wh-partials',
  transformIndexHtml: { order: 'pre', handler: (html) => incluir(html) },
  configureServer(server) {
    // Partials não fazem parte do grafo de módulos: qualquer mudança recarrega a página inteira.
    for (const pasta of pastasObservadas) server.watcher.add(pasta);
    const recarregar = (arquivo) => {
      if (pastasObservadas.some((p) => arquivo.startsWith(p + sep)) && arquivo.endsWith('.html')) {
        server.config.logger.info(`partial ${relative(raiz, arquivo)} mudou; recarregando`, { timestamp: true });
        server.hot.send({ type: 'full-reload', path: '*' });
      }
    };
    server.watcher.on('change', recarregar);
    server.watcher.on('add', recarregar);
    server.watcher.on('unlink', recarregar);
  },
});

// Dados de contato (src/config.js) trocados no HTML: os links funcionam sem JavaScript.
const contatoNoHtml = () => ({
  name: 'wh-contato',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) => html
      .replaceAll('{{whatsappUrl}}', whatsappUrl())
      .replaceAll('{{whatsappExibicao}}', contato.whatsappExibicao)
      .replaceAll('{{email}}', contato.email)
      .replaceAll('{{mailtoUrl}}', mailtoUrl())
      .replaceAll('{{ano}}', String(new Date().getFullYear())),
  },
});

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  build: {
    target: 'es2022',
    // Nada vira data: URI. Capturas pequenas iriam para dentro do HTML (srcset) e as texturas para dentro
    // do CSS; como arquivos separados elas ficam em cache e só baixam quando usadas.
    assetsInlineLimit: 0,
    rolldownOptions: {
      input: Object.fromEntries(Object.entries(paginas).map(([k, v]) => [k, resolve(raiz, v)])),
    },
  },
  plugins: [partials(), contatoNoHtml()],
});
