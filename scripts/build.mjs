import { build } from "esbuild";
import { copyFile, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import sharp from "sharp";
const require = createRequire(import.meta.url);
await mkdir("assets/fonts", { recursive: true });
await mkdir("assets/vendor", { recursive: true });
await rm("assets/dist", { recursive: true, force: true });
const result = await build({
  entryPoints: ["src/main.js"],
  outdir: "assets/dist",
  bundle: true,
  splitting: true,
  format: "esm",
  target: ["es2022"],
  minify: true,
  metafile: true,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "linked",
});
await writeFile(".build-meta.json", JSON.stringify(result.metafile, null, 2));
await copyFile(
  require.resolve("@hyperframes/core/runtime"),
  "assets/vendor/hyperframe.runtime.js",
);
await copyFile(
  require.resolve("gsap/dist/gsap.min.js"),
  "assets/vendor/gsap.min.js",
);
await copyFile(
  "node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2",
  "assets/fonts/sora.woff2",
);
await copyFile(
  "node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2",
  "assets/fonts/dm-sans.woff2",
);
await copyFile(
  "node_modules/@fontsource-variable/sora/LICENSE",
  "assets/fonts/Sora-LICENSE.txt",
);
await copyFile(
  "node_modules/@fontsource-variable/dm-sans/LICENSE",
  "assets/fonts/DM-Sans-LICENSE.txt",
);
await sharp("assets/aura-headphones.png")
  .resize({ width: 1440, withoutEnlargement: true })
  .webp({ quality: 84 })
  .toFile("assets/aura-headphones.webp");
await sharp("assets/logo.png")
  .resize({ width: 640, withoutEnlargement: true })
  .webp({ quality: 88 })
  .toFile("assets/logo.webp");
await sharp("assets/logo.png")
  .resize({
    width: 64,
    height: 64,
    fit: "contain",
    background: { r: 16, g: 16, b: 16, alpha: 1 },
  })
  .png()
  .toFile("assets/favicon.png");
console.log(
  "Built local modules, fonts, HyperFrames runtime and optimized product image.",
);

await mkdir("assets/licenses", { recursive: true });
for (const [name, file] of [
  ["motion", "LICENSE.md"], ["framer-motion", "LICENSE.md"],
  ["motion-dom", "LICENSE.md"], ["motion-utils", "LICENSE.md"],
  ["react", "LICENSE"], ["react-dom", "LICENSE"],
  ["remotion", "LICENSE.md"], ["@remotion/player", "LICENSE.md"],
  ["@hyperframes/core", "LICENSE"], ["@hyperframes/player", "LICENSE"]
]) {
  await copyFile(`node_modules/${name}/${file}`, `assets/licenses/${name.replaceAll("/", "-").replace("@", "")}.txt`);
}
