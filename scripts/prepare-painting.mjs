// Downscales a source image into the compact asset the hero samples at runtime.
// Usage: node scripts/prepare-painting.mjs <input> [output]
import sharp from "sharp";

const [input, output = "src/assets/starry-night.webp"] = process.argv.slice(2);

if (!input) {
  console.error("Usage: node scripts/prepare-painting.mjs <input> [output]");
  process.exit(1);
}

const info = await sharp(input)
  .resize({ width: 480, withoutEnlargement: true })
  .webp({ quality: 60, effort: 6 })
  .toFile(output);

console.log(`${output} · ${info.width}×${info.height} · ${(info.size / 1024).toFixed(1)} KB`);
