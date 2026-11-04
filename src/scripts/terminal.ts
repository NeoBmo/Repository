import { clamp } from "../lib/ascii/math";
import { lineAt } from "../lib/terminal";

export function mountTerminal(section: HTMLElement) {
  const line = section.querySelector<HTMLElement>("[data-terminal-line]");
  const stage = section.querySelector<HTMLElement>(".hero__stage");
  if (!line || !stage) return;

  let frame = 0;

  const update = () => {
    frame = 0;
    // Se mide contra el escenario, no contra la ventana: la barra de URL del móvil
    // cambia innerHeight, pero no la altura en svh que usa el CSS.
    const travel = section.offsetHeight - stage.offsetHeight;
    // Sin recorrido (reduced motion) el hero no se desplaza: va directo al nombre.
    const progress = travel > 0 ? clamp(-section.getBoundingClientRect().top / travel) : 1;
    section.toggleAttribute("data-typing", progress > 0);
    const text = lineAt(progress);
    if (line.textContent !== text) line.textContent = text;
  };

  const schedule = () => {
    frame ||= requestAnimationFrame(update);
  };

  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", schedule);
  update();
}
