import landscapeUrl from "../assets/starry-night.webp?url";
import portraitUrl from "../assets/starry-night-portrait.webp?url";
import logoUrl from "../assets/logo.svg?url";
import { loadImageField, type ImageField } from "../lib/ascii/image-field";
import { Convergence, INTRO_DURATION, type Painting } from "../lib/ascii/convergence";
import { clamp } from "../lib/ascii/math";
import {
  DISSOLVE_DURATION,
  DISSOLVE_START,
  LOGO_AT,
  LOGO_SCROLL,
  MAX_RATE,
  RATE_RESPONSE,
} from "../lib/choreography";
import { mountTerminal } from "./terminal";

const FONT_FAMILY = '"JetBrains Mono", monospace';
/** After the intro the painting only breathes, so 30 fps is plenty. */
const IDLE_FRAME_MS = 1000 / 30;
/** Los teléfonos reciben menos fotogramas y píxeles: su pantalla ya es densa. */
const PORTRAIT_IDLE_FRAME_MS = 1000 / 20;
const MAX_PIXEL_RATIO = 2;
const PORTRAIT_MAX_PIXEL_RATIO = 1.5;
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

  // Cada carga empieza arriba: la coreografía no puede arrancar a mitad del scroll.
  history.scrollRestoration = "manual";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const portrait = window.matchMedia(PORTRAIT_QUERY);
  const scene = new Convergence({ canvas, fontFamily: FONT_FAMILY });

  let elapsed = 0;
  let lastFrame = 0;
  let lastDraw = 0;
  let frame = 0;
  let visible = true;
  let rate = 1;
  let progress = 0;
  let dissolve = 0;
  let drawnDissolve = -1;
  // La intro mantiene el logo hasta que el visitante baja; desde ahí manda el scroll,
  // así que al volver arriba la pintura se queda quieta y no se disuelve sola.
  let introHolds = true;

  mountTerminal(section, (value) => (progress = value));

  const logo = new Image();
  logo.src = logoUrl;

  // Reduced motion siempre muestra la pintura fija, sin importar dónde iba la coreografía.
  const drawStill = () => scene.render(elapsed, reducedMotion.matches, reducedMotion.matches ? 0 : dissolve);

  const layout = async () => {
    const painting = await paintingFor(portrait.matches);
    const { width, height } = canvas.getBoundingClientRect();
    const maxPixelRatio = portrait.matches ? PORTRAIT_MAX_PIXEL_RATIO : MAX_PIXEL_RATIO;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
    scene.layout(width, height, pixelRatio, painting, logo);
    drawStill();
  };

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    const delta = Math.min((now - (lastFrame || now)) / 1000, 0.1);
    lastFrame = now;

    const introRunning = elapsed < LOGO_AT;
    const targetRate = introRunning && progress > 0 ? MAX_RATE : 1;
    rate += (targetRate - rate) * Math.min(delta * RATE_RESPONSE, 1);
    elapsed += delta * rate;

    // Quien baja más allá del hero durante la intro la deja terminar antes de pausar.
    if (!visible && !introRunning) {
      pause();
      return;
    }

    if (!introRunning && progress >= LOGO_SCROLL) introHolds = false;
    dissolve = introHolds
      ? clamp((elapsed - DISSOLVE_START) / DISSOLVE_DURATION)
      : clamp(progress / LOGO_SCROLL);

    if (dissolve === drawnDissolve) {
      if (dissolve === 1) return;
      const idleFrameMs = portrait.matches ? PORTRAIT_IDLE_FRAME_MS : IDLE_FRAME_MS;
      if (elapsed > INTRO_DURATION && now - lastDraw < idleFrameMs) return;
    }

    section.toggleAttribute("data-settled", dissolve === 1);
    drawnDissolve = dissolve;
    lastDraw = now;
    scene.render(elapsed, false, dissolve);
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

  await Promise.all([document.fonts.load(`600 12px ${FONT_FAMILY}`), logo.decode().catch(() => {})]);
  await layout();

  let resizeTimer = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(layout, 120);
  }).observe(canvas);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play();
    else if (elapsed >= LOGO_AT) pause();
  }).observe(section);

  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : play()));
  reducedMotion.addEventListener("change", () => {
    pause();
    section.toggleAttribute("data-settled", reducedMotion.matches);
    drawnDissolve = -1;
    drawStill();
    play();
  });

  section.toggleAttribute("data-settled", reducedMotion.matches);
  section.dataset.ready = "";
  play();
}
