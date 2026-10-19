#!/usr/bin/env node
// Símbolo exploratório (seção 2.10): o W da Anybody wdth 150 / wght 800 cortado a 16°, com a metade
// de baixo deslocada na perpendicular do corte (2px num ícone de 32px). Prata Luz sobre preto.
// Gera public/favicon.svg e src/partials/simbolo.html (SVG inline para a assinatura do rodapé).
//
// Ferramentas só para gerar (não são dependências do projeto):
//   npm i --no-save fontkit@2.0.4 wawoff2@2.0.1 && node scripts/simbolo.mjs
// A saída fica versionada; o site não depende destes pacotes.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fontkit = await import('fontkit');
const { default: wawoff } = await import('wawoff2');

const ttf = Buffer.from(await wawoff.decompress(readFileSync(join(raiz, 'src/assets/fonts/anybody-latin-wdth-normal.woff2'))));
const fonte = fontkit.create(ttf);
const id = fonte.glyphsForString('W')[0].id;
const glifo = fonte.getVariation({ wdth: 150, wght: 800 }).getGlyph(id);
const versal = fonte.capHeight; // 1350 em 2000 unidades

// Contorno com y para baixo (SVG): y' = versal - y.
const pontos = [];
for (const c of glifo.path.commands) {
  if (c.command === 'moveTo' || c.command === 'lineTo') pontos.push([c.args[0], versal - c.args[1]]);
  else if (c.command !== 'closePath') throw new Error(`Comando inesperado no W: ${c.command}`);
}
const { minX, maxX } = glifo.bbox;
const largura = maxX - minX;
const TAN = Math.tan((16 * Math.PI) / 180);
const LADO = 3200; // caixa quadrada do favicon, em unidades da fonte
const DESLOCA = (2 / 32) * LADO; // 2px num ícone de 32px
const dx = -0.276 * DESLOCA, dy = 0.961 * DESLOCA;

const r = (n) => Math.round(n * 10) / 10;
const d = 'M' + pontos.map(([x, y]) => `${r(x - minX)} ${r(y)}`).join('L') + 'Z';
// Reta do corte pelo centro do W, descendo 16° da esquerda para a direita.
const cx = largura / 2, cy = versal / 2;
const yEm = (x) => cy + (x - cx) * TAN;
const folga = 400;
const xa = -folga, xb = largura + folga;
const cima = `M${xa} ${-folga}H${xb}V${r(yEm(xb))}L${xa} ${r(yEm(xa))}Z`;
const baixo = `M${xa} ${r(yEm(xa))}L${xb} ${r(yEm(xb))}V${versal + folga}H${xa}Z`;

const desenho = (prefixo) => `<defs><clipPath id="${prefixo}-c"><path d="${cima}"/></clipPath><clipPath id="${prefixo}-b"><path d="${baixo}"/></clipPath></defs>
<path clip-path="url(#${prefixo}-c)" d="${d}"/>
<path clip-path="url(#${prefixo}-b)" transform="translate(${r(dx)} ${r(dy)})" d="${d}"/>`;

// Favicon: quadrado preto, W centrado (o deslocamento entra no centro vertical).
const ox = (LADO - largura) / 2;
const oy = (LADO - (versal + dy)) / 2;
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LADO} ${LADO}" role="img" aria-labelledby="t">
<title id="t">Símbolo exploratório</title>
<rect width="${LADO}" height="${LADO}" fill="#000"/>
<g fill="#EEF0F2" transform="translate(${r(ox)} ${r(oy)})">
${desenho('f')}
</g>
</svg>
`;
writeFileSync(join(raiz, 'public/favicon.svg'), favicon);

// Assinatura do rodapé: só o W, cor herdada (currentColor), caixa justa.
const vbX = Math.min(0, dx) - 8, vbY = -8, vbW = largura - Math.min(0, dx) + 16, vbH = versal + dy + 16;
const inline = `<!-- Gerado por scripts/simbolo.mjs. Símbolo exploratório (proposta, não é logo). -->
<svg class="simbolo" viewBox="${r(vbX)} ${r(vbY)} ${r(vbW)} ${r(vbH)}" width="${Math.round((vbW / vbH) * 24)}" height="24" role="img" aria-labelledby="simbolo-titulo" fill="currentColor">
<title id="simbolo-titulo">Símbolo exploratório</title>
${desenho('s')}
</svg>
`;
writeFileSync(join(raiz, 'src/partials/simbolo.html'), inline);
console.log(`W 150/800: ${pontos.length} pontos, largura ${largura} de ${fonte.unitsPerEm} unidades, versal ${versal}.`);
console.log('Gravado: public/favicon.svg, src/partials/simbolo.html');
