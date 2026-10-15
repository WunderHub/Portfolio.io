import { spawnSync } from "node:child_process";
import { mkdir, readdir, copyFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const input = resolve(process.argv[2] || "src/media/logo-reveal.mp4");
const root = "assets/logo-sequence";
const count = 240;
function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command}: ${result.stderr}`);
  return result.stdout;
}
const info = JSON.parse(
  run("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height,avg_frame_rate,nb_frames,duration",
    "-show_entries",
    "format=duration",
    "-of",
    "json",
    input,
  ]),
);
const stream = info.streams[0];
const duration = Number(stream.duration || info.format.duration);
if (!Number.isFinite(duration) || duration <= 0)
  throw new Error("Invalid video duration");
const variants = [];
for (const [name, width, quality] of [
  ["desktop", 1280, 80],
  ["mobile", 768, 76],
]) {
  const folder = `${root}/${name}`;
  await mkdir(folder, { recursive: true });
  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    input,
    "-an",
    "-vf",
    `fps=${count / duration},scale=${Math.min(width, stream.width)}:-2:flags=lanczos`,
    "-frames:v",
    String(count),
    "-c:v",
    "libwebp",
    "-quality",
    String(quality),
    "-compression_level",
    "4",
    "-threads",
    "2",
    `${folder}/frame-%04d.webp`,
  ]);
  const files = (await readdir(folder)).filter((file) =>
    /^frame-\d{4}\.webp$/.test(file),
  );
  if (files.length !== count)
    throw new Error(
      `Expected ${count} frames in ${folder}, got ${files.length}`,
    );
  let bytes = 0;
  for (let i = 1; i <= count; i++)
    bytes += (await stat(`${folder}/frame-${String(i).padStart(4, "0")}.webp`))
      .size;
  const targetWidth = Math.min(width, stream.width);
  variants.push({
    name,
    width: targetWidth,
    height: Math.round((stream.height * targetWidth) / stream.width / 2) * 2,
    frames: count,
    bytes,
  });
  await copyFile(
    `${folder}/frame-0240.webp`,
    `${root}/poster${name === "mobile" ? "-mobile" : ""}.webp`,
  );
  console.log(
    `${name}: ${count} frames, ${(bytes / 1024 / 1024).toFixed(2)} MiB`,
  );
}
await writeFile(
  `${root}/manifest.json`,
  JSON.stringify(
    {
      frames: count,
      duration,
      sourceFrames: Number(stream.nb_frames),
      sourceFps: stream.avg_frame_rate,
      outputFps: count / duration,
      resampling: "Frame repetition; no motion interpolation.",
      variants,
    },
    null,
    2,
  ) + "\n",
);
