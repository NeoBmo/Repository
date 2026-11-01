// Builds the two compact assets the hero samples at runtime from one
// reproduction of The Starry Night:
//   - landscape: the painting as it is, downscaled.
//   - portrait: a vertical reinterpretation assembled from its own pieces,
//     so phones still see the moon, the cypress and the swirls.
// Usage: node scripts/prepare-painting.mjs <input> [outputDir]
import sharp from "sharp";

const [input, outputDir = "src/assets"] = process.argv.slice(2);

if (!input) {
  console.error("Usage: node scripts/prepare-painting.mjs <input> [outputDir]");
  process.exit(1);
}

const PORTRAIT = { width: 480, height: 1040 };
const FEATHER = 80;

/**
 * Each piece maps an output rectangle (px) to a source region centred at
 * `center` (fractions of the painting) and `height` (fraction of its
 * height). The source width follows from the output aspect, so every piece
 * keeps its proportions. Later pieces with higher `weight` sit in front.
 */
const PIECES = [
  { name: "moon", out: [150, 0, 480, 430], center: [0.86, 0.23], height: 0.47 },
  { name: "swirls", out: [150, 360, 480, 760], center: [0.55, 0.38], height: 0.48 },
  { name: "village", out: [150, 700, 480, 1040], center: [0.66, 0.8], height: 0.4 },
  { name: "cypress", out: [0, 0, 230, 1040], center: [0.195, 0.5], height: 1, weight: 3 },
];

async function landscape() {
  const output = `${outputDir}/starry-night.webp`;
  const info = await sharp(input)
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: 60, effort: 6 })
    .toFile(output);
  report(output, info);
}

async function portrait() {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: sw, height: sh } = info;
  const { width: W, height: H } = PORTRAIT;

  const pieces = PIECES.map((piece) => {
    const [x0, y0, x1, y1] = piece.out;
    const sourceHeight = piece.height * sh;
    const sourceWidth = sourceHeight * ((x1 - x0) / (y1 - y0));
    return {
      ...piece,
      weight: piece.weight ?? 1,
      sx: piece.center[0] * sw - sourceWidth / 2,
      sy: piece.center[1] * sh - sourceHeight / 2,
      scale: sourceHeight / (y1 - y0),
    };
  });

  const sample = (x, y, channel) => {
    const cx = Math.min(sw - 1, Math.max(0, Math.round(x)));
    const cy = Math.min(sh - 1, Math.max(0, Math.round(y)));
    return data[(cy * sw + cx) * 3 + channel];
  };

  const out = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const color = [0, 0, 0];
      let total = 0;

      for (const piece of pieces) {
        const [x0, y0, x1, y1] = piece.out;
        if (x < x0 || x >= x1 || y < y0 || y >= y1) continue;
        // Fade towards inner edges only; edges on the canvas border stay hard.
        const fade = Math.min(
          x0 > 0 ? (x - x0) / FEATHER : 1,
          x1 < W ? (x1 - x) / FEATHER : 1,
          y0 > 0 ? (y - y0) / FEATHER : 1,
          y1 < H ? (y1 - y) / FEATHER : 1,
          1,
        );
        const weight = Math.max(fade, 0.001) ** 2 * piece.weight;
        const sx = piece.sx + (x - x0) * piece.scale;
        const sy = piece.sy + (y - y0) * piece.scale;
        for (let c = 0; c < 3; c++) color[c] += sample(sx, sy, c) * weight;
        total += weight;
      }

      const i = (y * W + x) * 3;
      for (let c = 0; c < 3; c++) out[i + c] = color[c] / total;
    }
  }

  const output = `${outputDir}/starry-night-portrait.webp`;
  const result = await sharp(out, { raw: { width: W, height: H, channels: 3 } })
    .resize({ width: 300 })
    .webp({ quality: 60, effort: 6 })
    .toFile(output);
  report(output, result);
}

function report(output, info) {
  console.log(`${output} · ${info.width}×${info.height} · ${(info.size / 1024).toFixed(1)} KB`);
}

await landscape();
await portrait();
