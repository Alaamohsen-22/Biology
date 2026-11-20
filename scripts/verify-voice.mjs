import { readFile } from "node:fs/promises";
const data = JSON.parse(
  await readFile("public/config/nutrition-voice.json", "utf8"),
);
let count = 0;
for (const [key, clip] of Object.entries(data)) {
  if (
    !clip ||
    typeof clip.transcript !== "string" ||
    !clip.transcript.trim() ||
    !/^audio\/nutrition\/[a-z0-9/_-]+\.(mp3|wav|ogg)$/i.test(clip.src) ||
    clip.src.includes("..")
  )
    throw Error(`Invalid narration entry: ${key}`);
  const bytes = await readFile("public/" + clip.src);
  if (
    bytes.length < 100 ||
    !(
      bytes.subarray(0, 4).toString() === "RIFF" ||
      bytes.subarray(0, 4).toString() === "OggS" ||
      bytes.subarray(0, 3).toString() === "ID3" ||
      bytes[0] === 255
    )
  )
    throw Error(`Invalid or empty narration file: ${key}`);
  count++;
}
console.log(
  `Natural narration: ${count} configured files. Missing recordings are not replaced with synthetic speech.`,
);
