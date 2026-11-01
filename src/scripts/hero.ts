import paintingUrl from "../assets/starry-night.webp?url";
import { loadImageField } from "../lib/ascii/image-field";
import { Convergence, INTRO_DURATION } from "../lib/ascii/convergence";

const FONT_FAMILY = '"JetBrains Mono", monospace';
/** After the intro the painting only breathes, so 30 fps is plenty. */
const IDLE_FRAME_MS = 1000 / 30;

export async function mountHero(section: HTMLElement) {
  const canvas = section.querySelector("canvas");
  if (!canvas) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const [field] = await Promise.all([
    loadImageField(paintingUrl),
    document.fonts.load(`600 12px ${FONT_FAMILY}`),
  ]);

  const scene = new Convergence({ canvas, field, fontFamily: FONT_FAMILY, focus: { x: 0.4, y: 0.5 } });

  let elapsed = 0;
  let lastFrame = 0;
  let lastDraw = 0;
  let frame = 0;
  let visible = true;

  const layout = () => {
    const { width, height } = canvas.getBoundingClientRect();
    scene.layout(width, height, Math.min(window.devicePixelRatio || 1, 2));
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

  layout();
  section.dataset.ready = "";
  play();
}
