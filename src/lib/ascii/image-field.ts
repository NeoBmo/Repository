/**
 * Reads an image once and derives the stroke orientation of every pixel
 * from its smoothed structure tensor. Characters later travel along these
 * orientations, which is what makes the painting appear brush by brush.
 */
export interface ImageField {
  image: HTMLImageElement;
  width: number;
  height: number;
  /** Stroke direction in radians, perpendicular to the luminance gradient. */
  angle: Float32Array;
  /** 0 = isotropic, 1 = strongly directional. */
  coherence: Float32Array;
}

export async function loadImageField(src: string): Promise<ImageField> {
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  await image.decode();

  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2D canvas is not available");

  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, width, height);

  const size = width * height;
  const luminance = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    const p = i * 4;
    luminance[i] = (0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255;
  }

  const jxx = new Float32Array(size);
  const jxy = new Float32Array(size);
  const jyy = new Float32Array(size);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const tl = luminance[i - width - 1];
      const t = luminance[i - width];
      const tr = luminance[i - width + 1];
      const l = luminance[i - 1];
      const r = luminance[i + 1];
      const bl = luminance[i + width - 1];
      const b = luminance[i + width];
      const br = luminance[i + width + 1];
      const gx = tr + 2 * r + br - tl - 2 * l - bl;
      const gy = bl + 2 * b + br - tl - 2 * t - tr;
      jxx[i] = gx * gx;
      jxy[i] = gx * gy;
      jyy[i] = gy * gy;
    }
  }

  const radius = Math.max(2, Math.round(width / 120));
  for (const channel of [jxx, jxy, jyy]) {
    boxBlur(channel, width, height, radius);
    boxBlur(channel, width, height, radius);
  }

  const angle = new Float32Array(size);
  const coherence = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    const a = jxx[i];
    const b = jxy[i];
    const c = jyy[i];
    const gradientAngle = 0.5 * Math.atan2(2 * b, a - c);
    angle[i] = gradientAngle + Math.PI / 2;
    const trace = a + c;
    coherence[i] = trace > 1e-6 ? Math.sqrt((a - c) ** 2 + 4 * b * b) / trace : 0;
  }

  return { image, width, height, angle, coherence };
}

function boxBlur(values: Float32Array, width: number, height: number, radius: number) {
  const buffer = new Float32Array(values.length);
  const span = radius * 2 + 1;

  for (let y = 0; y < height; y++) {
    const row = y * width;
    let sum = 0;
    for (let x = -radius; x <= radius; x++) sum += values[row + clampIndex(x, width)];
    for (let x = 0; x < width; x++) {
      buffer[row + x] = sum / span;
      sum += values[row + clampIndex(x + radius + 1, width)] - values[row + clampIndex(x - radius, width)];
    }
  }

  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) sum += buffer[clampIndex(y, height) * width + x];
    for (let y = 0; y < height; y++) {
      values[y * width + x] = sum / span;
      sum +=
        buffer[clampIndex(y + radius + 1, height) * width + x] -
        buffer[clampIndex(y - radius, height) * width + x];
    }
  }
}

const clampIndex = (index: number, length: number) => (index < 0 ? 0 : index >= length ? length - 1 : index);
