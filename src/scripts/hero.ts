import landscapeUrl from "../assets/starry-night.webp?url";
import portraitUrl from "../assets/starry-night-portrait.webp?url";
import { loadImageField, type ImageField } from "../lib/ascii/image-field";
import { Convergence, INTRO_DURATION, type Painting } from "../lib/ascii/convergence";

const FONT_FAMILY = '"JetBrains Mono", monospace';
/** After the intro the painting only breathes, so 30 fps is plenty. */
const IDLE_FRAME_MS = 1000 / 30;
/** Below this aspect ratio the vertical composition fits better. */
const PORTRAIT_QUERY = "(max-aspect-ratio: 6/7)";

const VARIANTS = {
  landscape: { url: landscapeUrl, focus: { x: 0.4, y: 0.5 } },
  portrait: { url: portraitUrl, focus: { x: 0.5, y: 0.5 } },
};

const fields = new Map<string, Promise<ImageField>>();

/** Each variant is fetched only when a screen of that shape needs it. */
async function paintingFor(portrait: boolean): Promise<Painting> {
  const { url, focus } = VARIANTS[portrait ? "portrait" : "landscape"];
  if (!fields.has(url)) fields.set(url, loadImageField(url));
  return { field: await fields.get(url)!, focus };
}

export async function mountHero(section: HTMLElement) {
  const canvas = section.querySelector("canvas");
  if (!canvas) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const portrait = window.matchMedia(PORTRAIT_QUERY);
  const scene = new Convergence({ canvas, fontFamily: FONT_FAMILY });

  let elapsed = 0;
  let lastFrame = 0;
  let lastDraw = 0;
  let frame = 0;
  let visible = true;

  const layout = async () => {
    const painting = await paintingFor(portrait.matches);
    const { width, height } = canvas.getBoundingClientRect();
    scene.layout(width, height, Math.min(window.devicePixelRatio || 1, 2), painting);
    scene.render(elapsed, reducedMotion.matches);
  };

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    elapsed += Math.min((now - (lastFrame || now)) / 1000, 0.1);
    lastFrame = now;
    if (elapsed > INTRO_DURATION && now - lastDraw < IDLE_FRAME_MS) return;
    lastDraw = now;
    scene.render(elapsed);
  };

  const play = () => {
    if (frame || reducedMotion.matches || !visible || document.hidden) return;
    lastFrame = 0;
    frame = requestAnimationFrame(tick);
  };

  const pause = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  await document.fonts.load(`600 12px ${FONT_FAMILY}`);
  await layout();

  let resizeTimer = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(layout, 120);
  }).observe(canvas);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? play() : pause();
  }).observe(section);

  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : play()));
  reducedMotion.addEventListener("change", () => {
    pause();
    scene.render(elapsed, reducedMotion.matches);
    play();
  });

  section.dataset.ready = "";
  play();
}
