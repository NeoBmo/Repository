import type { ImageField } from "./image-field";
import { createGlyphAtlas, type GlyphAtlas } from "./glyph-atlas";
import { EMPTY, NOISE_INDEX, glyphFor } from "./glyphs";
import { clamp, createRandom, easeInOutCubic, easeOutCubic, lerp, smoothstep } from "./math";

/**
 * Seconds. Characters appear one by one, few at first and then many; each
 * travels, lands, and only then do colour and life arrive.
 */
const TIMING = {
  revealStart: 0.2,
  reveal: 1.6,
  departure: 1.4,
  stagger: 1.4,
  travel: 1.7,
  colorStart: 3.2,
  colorDuration: 1.6,
  lifeStart: 4.4,
  lifeDuration: 2.5,
};

export const INTRO_DURATION = TIMING.colorStart + TIMING.colorDuration;

/** Points per journey: a random origin, then a stroke that ends at home. */
const STROKE_STEPS = 18;
const POINTS = STROKE_STEPS + 2;
/** Share of the journey spent flying from the noise into the stroke. */
const SWEEP = 0.3;

/** Tamaño máximo y altura del logo, como proporción de la pantalla. */
const LOGO_WIDTH = 0.85;
const LOGO_HEIGHT = 0.5;
const LOGO_TOP = 0.42;
/** Parte de la disolución que dura el viaje de cada carácter hasta el logo. */
const LOGO_TRAVEL = 0.6;
/** Curvatura del viaje: sale siguiendo su pincelada antes de ir al logo. */
const LOGO_ARC = 0.25;
const LOGO_GLYPH = glyphFor(1, 0, 0);

export interface ConvergenceOptions {
  canvas: HTMLCanvasElement;
  fontFamily: string;
  seed?: number;
}

export interface Painting {
  field: ImageField;
  /** Focal point of the cover crop, 0–1 on each axis. */
  focus: { x: number; y: number };
}

/**
 * A field of characters that begins as noise and converges into an image,
 * each glyph following the image's own stroke directions on its way home.
 */
export class Convergence {
  private readonly context: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly fontFamily: string;
  private readonly seed: number;
  private readonly colorLayer = document.createElement("canvas");

  private field!: ImageField;
  private focus = { x: 0.5, y: 0.5 };
  private atlas!: GlyphAtlas;
  private width = 0;
  private height = 0;
  private pixelRatio = 1;
  private gridX = 0;
  private gridY = 0;
  private cols = 0;
  private rows = 0;
  private cover = { scale: 1, x: 0, y: 0 };

  private count = 0;
  private path = new Float32Array(0);
  private homeX = new Float32Array(0);
  private homeY = new Float32Array(0);
  private dirX = new Float32Array(0);
  private dirY = new Float32Array(0);
  private phase = new Float32Array(0);
  private appear = new Float32Array(0);
  private departure = new Float32Array(0);
  private noise = new Float32Array(0);
  private luminance = new Float32Array(0);
  private angle = new Float32Array(0);
  private coherence = new Float32Array(0);
  private inLogo = new Uint8Array(0);
  private logoX = new Float32Array(0);
  private logoY = new Float32Array(0);
  private logoDelay = new Float32Array(0);
  private fade = new Float32Array(0);

  constructor({ canvas, fontFamily, seed = 1890 }: ConvergenceOptions) {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("2D canvas is not available");
    this.context = context;
    this.canvas = canvas;
    this.fontFamily = fontFamily;
    this.seed = seed;
  }

  layout(width: number, height: number, pixelRatio: number, painting: Painting, logo: HTMLImageElement) {
    this.field = painting.field;
    this.focus = painting.focus;
    this.width = width;
    this.height = height;
    this.pixelRatio = pixelRatio;
    this.canvas.width = Math.round(width * pixelRatio);
    this.canvas.height = Math.round(height * pixelRatio);

    // Menos de 10.5 px satura las pantallas pequeñas: más caracteres que dibujar y menos pintura.
    const fontSize = Math.round(clamp(width / 120, 10.5, 14) * 2) / 2;
    this.atlas = createGlyphAtlas(fontSize, pixelRatio, this.fontFamily);
    const { cellWidth, cellHeight } = this.atlas;

    this.cols = Math.ceil(width / cellWidth);
    this.rows = Math.ceil(height / cellHeight);
    this.gridX = (width - this.cols * cellWidth) / 2;
    this.gridY = (height - this.rows * cellHeight) / 2;

    const { width: iw, height: ih } = this.field;
    const scale = Math.max(width / iw, height / ih);
    this.cover = {
      scale,
      x: (width - iw * scale) * this.focus.x,
      y: (height - ih * scale) * this.focus.y,
    };

    this.populate(this.sampleCells());
    this.formLogo(logo);
  }

  /**
   * Draws the scene at `time` seconds. `still` skips motion entirely.
   * `dissolve` (0–1) lleva de la pintura al logo y funciona en ambos sentidos.
   */
  render(time: number, still = false, dissolve = 0) {
    const { context, atlas } = this;
    const { cellWidth, cellHeight, sourceWidth, sourceHeight } = atlas;
    const t = still ? Infinity : time;
    const life = still ? 0 : smoothstep(TIMING.lifeStart, TIMING.lifeStart + TIMING.lifeDuration, t);
    const base = still ? 1 : easeInOutCubic(clamp((t - TIMING.colorStart) / TIMING.colorDuration));
    const color = base * (1 - dissolve);

    context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
    context.clearRect(0, 0, this.width, this.height);

    const halfW = cellWidth / 2;
    const halfH = cellHeight / 2;
    const flicker = Math.floor(time * 12);

    for (let i = 0; i < this.count; i++) {
      if (t < this.appear[i]) continue;
      // Los caracteres que no forman el logo desaparecen uno a uno, sin transparencia.
      if (!this.inLogo[i] && dissolve > this.fade[i]) continue;
      const toLogo = this.inLogo[i]
        ? easeInOutCubic(clamp((dissolve - this.logoDelay[i]) / LOGO_TRAVEL))
        : 0;
      const progress = easeInOutCubic(clamp((t - this.departure[i]) / TIMING.travel));
      let x: number;
      let y: number;
      let glyph: number;

      if (toLogo > 0) {
        [x, y] = this.logoPositionAt(i, toLogo);
        glyph =
          toLogo > 0.9
            ? LOGO_GLYPH
            : NOISE_INDEX[(flicker + ((this.noise[i] * 997) | 0)) % NOISE_INDEX.length];
      } else if (progress >= 1) {
        const wave = life > 0 ? Math.sin(this.phase[i] - time * 1.4) * life : 0;
        const drift = wave * 0.2 * cellWidth;
        x = this.homeX[i] + this.dirX[i] * drift;
        y = this.homeY[i] + this.dirY[i] * drift;
        glyph = glyphFor(this.luminance[i] + wave * 0.09 * this.coherence[i], this.angle[i], this.coherence[i]);
      } else {
        [x, y] = this.positionAt(i, progress);
        glyph =
          progress > 0.9
            ? glyphFor(this.luminance[i], this.angle[i], this.coherence[i])
            : NOISE_INDEX[(flicker + ((this.noise[i] * 997) | 0)) % NOISE_INDEX.length];
      }

      if (glyph === EMPTY) continue;
      context.drawImage(
        atlas.canvas,
        glyph * sourceWidth, 0, sourceWidth, sourceHeight,
        x - halfW, y - halfH, cellWidth, cellHeight,
      );
    }

    if (color > 0) {
      context.globalCompositeOperation = "source-atop";
      context.globalAlpha = color;
      context.imageSmoothingEnabled = true;
      context.drawImage(this.colorLayer, this.gridX, this.gridY, this.cols * cellWidth, this.rows * cellHeight);
    }
  }

  /** Averages the covered image over each cell; the browser does the filtering. */
  private sampleCells() {
    const { cols, rows, cover, field } = this;
    const { cellWidth, cellHeight } = this.atlas;
    const layer = this.colorLayer;
    layer.width = cols;
    layer.height = rows;
    const context = layer.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("2D canvas is not available");

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      field.image,
      (this.gridX - cover.x) / cover.scale,
      (this.gridY - cover.y) / cover.scale,
      (cols * cellWidth) / cover.scale,
      (rows * cellHeight) / cover.scale,
      0, 0, cols, rows,
    );

    const pixels = context.getImageData(0, 0, cols, rows);
    const { data } = pixels;
    const luminance = new Float32Array(cols * rows);
    for (let i = 0; i < luminance.length; i++) {
      const p = i * 4;
      luminance[i] = (0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255;
      // Lift the palette so coloured glyphs keep their weight on pure black.
      const peak = Math.max(data[p], data[p + 1], data[p + 2], 1);
      const gain = Math.min(4, lerp(peak, 255, 0.9) / peak);
      data[p] = data[p] * gain;
      data[p + 1] = data[p + 1] * gain;
      data[p + 2] = data[p + 2] * gain;
    }
    context.putImageData(pixels, 0, 0);

    return normalize(luminance);
  }

  private populate(cells: Float32Array) {
    const { cols, rows } = this;
    const { cellWidth, cellHeight } = this.atlas;
    const random = createRandom(this.seed);
    const capacity = cols * rows;

    this.path = new Float32Array(capacity * POINTS * 2);
    this.homeX = new Float32Array(capacity);
    this.homeY = new Float32Array(capacity);
    this.dirX = new Float32Array(capacity);
    this.dirY = new Float32Array(capacity);
    this.phase = new Float32Array(capacity);
    this.appear = new Float32Array(capacity);
    this.departure = new Float32Array(capacity);
    this.noise = new Float32Array(capacity);
    this.luminance = new Float32Array(capacity);
    this.angle = new Float32Array(capacity);
    this.coherence = new Float32Array(capacity);

    const step = cellWidth * 1.4;
    const wavelength = cellWidth * 5;
    let n = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const lum = cells[row * cols + col];
        const hx = this.gridX + (col + 0.5) * cellWidth;
        const hy = this.gridY + (row + 0.5) * cellHeight;
        const fieldIndex = this.fieldIndex(hx, hy);
        const angle = this.field.angle[fieldIndex];
        const coherence = this.field.coherence[fieldIndex];
        if (glyphFor(lum, angle, coherence) === EMPTY) continue;

        this.homeX[n] = hx;
        this.homeY[n] = hy;
        this.luminance[n] = lum;
        this.angle[n] = angle;
        this.coherence[n] = coherence;
        this.dirX[n] = Math.cos(angle);
        this.dirY[n] = Math.sin(angle);
        this.phase[n] = (hx * this.dirX[n] + hy * this.dirY[n]) / wavelength;
        // sqrt skews arrivals late, so the noise grows from a few glyphs to a crowd.
        this.appear[n] = TIMING.revealStart + Math.sqrt(random()) * TIMING.reveal;
        // Light leaves first: stars, then sky, then the village and cypress.
        this.departure[n] = Math.max(
          this.appear[n] + 0.2,
          TIMING.departure + ((1 - lum) * 0.7 + random() * 0.3) * TIMING.stagger,
        );
        this.noise[n] = random();
        this.trace(n, hx, hy, step, random);
        n++;
      }
    }

    this.count = n;
  }

  /** Walks the stroke field backwards from home to build the journey. */
  private trace(n: number, hx: number, hy: number, step: number, random: () => number) {
    const base = n * POINTS * 2;
    const path = this.path;
    path[base] = random() * this.width;
    path[base + 1] = random() * this.height;
    path[base + (POINTS - 1) * 2] = hx;
    path[base + (POINTS - 1) * 2 + 1] = hy;

    const sign = random() < 0.5 ? -1 : 1;
    let x = hx;
    let y = hy;
    let previousX = 0;
    let previousY = 0;

    for (let k = POINTS - 2; k >= 1; k--) {
      const angle = this.field.angle[this.fieldIndex(x, y)];
      let ux = Math.cos(angle) * sign;
      let uy = Math.sin(angle) * sign;
      if (ux * previousX + uy * previousY < 0) {
        ux = -ux;
        uy = -uy;
      }
      previousX = ux;
      previousY = uy;
      x -= ux * step;
      y -= uy * step;
      path[base + k * 2] = x;
      path[base + k * 2 + 1] = y;
    }
  }

  /** Reparte al azar las celdas del logo entre los caracteres de la pintura. */
  private formLogo(logo: HTMLImageElement) {
    const { width, height, count } = this;
    const { cellWidth, cellHeight } = this.atlas;
    const random = createRandom(this.seed + 1);

    this.inLogo = new Uint8Array(count);
    this.logoX = new Float32Array(count);
    this.logoY = new Float32Array(count);
    this.logoDelay = new Float32Array(count);
    this.fade = new Float32Array(count);

    for (let n = 0; n < count; n++) {
      this.logoDelay[n] = random() * (1 - LOGO_TRAVEL);
      this.fade[n] = 0.1 + random() * 0.8;
    }

    const size = Math.min(width * LOGO_WIDTH, height * LOGO_HEIGHT);
    const cols = Math.round(size / cellWidth);
    const rows = Math.round(size / cellHeight);
    // Sin logo cargado o sin espacio, la pintura se disuelve igual y llega la consola.
    if (!logo.naturalWidth || cols < 1 || rows < 1) return;

    const layer = document.createElement("canvas");
    layer.width = cols;
    layer.height = rows;
    const context = layer.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("2D canvas is not available");
    context.drawImage(logo, 0, 0, cols, rows);
    const { data } = context.getImageData(0, 0, cols, rows);

    const order = Uint32Array.from({ length: count }, (_, i) => i);
    for (let i = count - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    const left = (width - cols * cellWidth) / 2;
    const top = (height - rows * cellHeight) * LOGO_TOP;
    let used = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols && used < count; col++) {
        if (data[(row * cols + col) * 4 + 3] < 128) continue;
        const n = order[used++];
        this.inLogo[n] = 1;
        this.logoX[n] = left + (col + 0.5) * cellWidth;
        this.logoY[n] = top + (row + 0.5) * cellHeight;
      }
    }
  }

  private logoPositionAt(n: number, progress: number): [number, number] {
    const startX = this.homeX[n];
    const startY = this.homeY[n];
    const endX = this.logoX[n];
    const endY = this.logoY[n];
    const distance = Math.hypot(endX - startX, endY - startY);
    const controlX = (startX + endX) / 2 + this.dirX[n] * distance * LOGO_ARC;
    const controlY = (startY + endY) / 2 + this.dirY[n] * distance * LOGO_ARC;
    return [
      lerp(lerp(startX, controlX, progress), lerp(controlX, endX, progress), progress),
      lerp(lerp(startY, controlY, progress), lerp(controlY, endY, progress), progress),
    ];
  }

  private positionAt(n: number, progress: number): [number, number] {
    const base = n * POINTS * 2;
    const path = this.path;

    if (progress < SWEEP) {
      const t = easeOutCubic(progress / SWEEP);
      return [lerp(path[base], path[base + 2], t), lerp(path[base + 1], path[base + 3], t)];
    }

    const along = ((progress - SWEEP) / (1 - SWEEP)) * (POINTS - 2);
    const segment = Math.min(Math.floor(along), POINTS - 3);
    const t = along - segment;
    const a = base + (segment + 1) * 2;
    return [lerp(path[a], path[a + 2], t), lerp(path[a + 1], path[a + 3], t)];
  }

  private fieldIndex(x: number, y: number) {
    const { width, height } = this.field;
    const ix = clamp(Math.floor((x - this.cover.x) / this.cover.scale), 0, width - 1);
    const iy = clamp(Math.floor((y - this.cover.y) / this.cover.scale), 0, height - 1);
    return iy * width + ix;
  }
}

/**
 * Stretches luminance between its 2nd and 98th percentiles, then lifts the
 * shadows: on pure black, dark blues need denser glyphs to stay visible.
 */
function normalize(values: Float32Array) {
  const sorted = Float32Array.from(values).sort();
  const low = sorted[Math.floor(sorted.length * 0.02)];
  const high = sorted[Math.floor(sorted.length * 0.98)];
  const range = Math.max(high - low, 1e-3);
  return values.map((value) => clamp((value - low) / range) ** 0.7);
}
