#!/usr/bin/env sh
# Gera as texturas de grão escovado (seção 2.2 da direção). Determinístico (seed fixa), sem IA.
# Uso: npm run grao   (precisa de ffmpeg com libwebp)
set -eu
cd "$(dirname "$0")/.."
mkdir -p src/assets/textura

# Grão do letreiro: 2400x256, luma ~69-146. O crop de 80px remove o artefato de borda do blur.
ffmpeg -v error -y -f lavfi \
  -i "color=c=0x808080:s=2560x256,format=gray,noise=alls=100:allf=u:all_seed=17,avgblur=sizeX=80:sizeY=1,eq=contrast=5,crop=2400:256:80:0" \
  -frames:v 1 -c:v libwebp -quality 40 src/assets/textura/grao-2400.webp

# Grão da Chapa (baixo contraste): luma ~103-132.
ffmpeg -v error -y -f lavfi \
  -i "color=c=0x808080:s=2560x256,format=gray,noise=alls=100:allf=u:all_seed=17,avgblur=sizeX=80:sizeY=1,eq=contrast=2,crop=2400:256:80:0" \
  -frames:v 1 -c:v libwebp -quality 40 src/assets/textura/grao-chapa-2400.webp

for f in src/assets/textura/grao-2400.webp src/assets/textura/grao-chapa-2400.webp; do
  bytes=$(wc -c < "$f" | tr -d ' ')
  luma=$(ffmpeg -v info -i "$f" -vf "signalstats,metadata=print" -f null - 2>&1 | grep -oE 'Y(MIN|MAX)=[0-9]+' | tr '\n' ' ' || true)
  echo "$f  ${bytes} B  ${luma}"
done
