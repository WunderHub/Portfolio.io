#!/usr/bin/env node
// Copia os woff2 (subset latin) e as licenças OFL dos pacotes @fontsource para o projeto.
// Uso: npm run fontes
// Portfólio: src/assets/fonts/ (Anybody e Archivo).
// Conceitos: src/conceitos/<slug>/fonts/ (seção 7 da direção).
import { copyFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const nm = join(raiz, 'node_modules');

// [pacote, arquivo dentro de files/, destino, nome curto da licença]
const fontes = [
  ['@fontsource-variable/anybody', 'anybody-latin-wdth-normal.woff2', 'src/assets/fonts', 'anybody'],
  ['@fontsource-variable/archivo', 'archivo-latin-wght-normal.woff2', 'src/assets/fonts', 'archivo'],
  ['@fontsource-variable/bricolage-grotesque', 'bricolage-grotesque-latin-opsz-normal.woff2', 'src/conceitos/codea/fonts', 'bricolage-grotesque'],
  ['@fontsource-variable/newsreader', 'newsreader-latin-wght-normal.woff2', 'src/conceitos/junco/fonts', 'newsreader'],
  ['@fontsource-variable/public-sans', 'public-sans-latin-wght-normal.woff2', 'src/conceitos/junco/fonts', 'public-sans'],
  ['@fontsource/young-serif', 'young-serif-latin-400-normal.woff2', 'src/conceitos/louca-torta/fonts', 'young-serif'],
  ['@fontsource-variable/instrument-sans', 'instrument-sans-latin-wght-normal.woff2', 'src/conceitos/louca-torta/fonts', 'instrument-sans'],
];

let total = 0;
for (const [pacote, arquivo, destino, curto] of fontes) {
  const origem = join(nm, pacote, 'files', arquivo);
  const licenca = join(nm, pacote, 'LICENSE');
  if (!existsSync(origem)) {
    console.error(`Falta ${origem}. Rode npm install antes.`);
    process.exit(1);
  }
  const pasta = join(raiz, destino);
  mkdirSync(pasta, { recursive: true });
  copyFileSync(origem, join(pasta, arquivo));
  copyFileSync(licenca, join(pasta, `OFL-${curto}.txt`));
  const bytes = statSync(origem).size;
  total += bytes;
  console.log(`${destino}/${arquivo}  ${bytes.toLocaleString('pt-BR')} B  (+ OFL-${curto}.txt)`);
}
console.log(`Total: ${total.toLocaleString('pt-BR')} B em ${fontes.length} arquivos.`);
