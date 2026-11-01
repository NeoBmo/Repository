import { GLYPHS } from "./glyphs";

export interface GlyphAtlas {
  canvas: HTMLCanvasElement;
  /** Cell size in CSS pixels. */
  cellWidth: number;
  cellHeight: number;
  /** Cell size inside the atlas, in device pixels. */
  sourceWidth: number;
  sourceHeight: number;
}

/**
 * Renders every glyph once, white on transparent. Drawing a frame is then
 * a sequence of cheap bitmap copies instead of thousands of fillText calls.
 */
export function createGlyphAtlas(fontSize: number, pixelRatio: number, fontFamily: string): GlyphAtlas {
  const font = `600 ${fontSize}px ${fontFamily}`;
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) throw new Error("2D canvas is not available");
  probe.font = font;

  const cellWidth = probe.measureText("M").width;
  const cellHeight = Math.round(fontSize * 1.2);
  const sourceWidth = Math.ceil(cellWidth * pixelRatio);
  const sourceHeight = Math.ceil(cellHeight * pixelRatio);

  const canvas = document.createElement("canvas");
  canvas.width = sourceWidth * GLYPHS.length;
  canvas.height = sourceHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas is not available");

  context.font = `600 ${fontSize * pixelRatio}px ${fontFamily}`;
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  GLYPHS.forEach((glyph, i) => {
    context.fillText(glyph, i * sourceWidth + sourceWidth / 2, sourceHeight / 2);
  });

  return { canvas, cellWidth, cellHeight, sourceWidth, sourceHeight };
}
