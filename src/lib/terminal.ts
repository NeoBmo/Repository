import { clamp } from "./ascii/math";

const GREETING = "hola, soy NeoBmo";
const NAME = "Luis Rodríguez";

/** Puntos del recorrido de scroll (0–1) donde cambia lo que hace la terminal. */
const TIMELINE = { typed: 0.4, eraseStart: 0.5, erased: 0.65, named: 0.95 };

const reveal = (text: string, amount: number) =>
  text.slice(0, Math.round(text.length * clamp(amount)));

/** La línea depende solo del progreso, así que subir la "desescribe" sin guardar estado. */
export function lineAt(progress: number) {
  const { typed, eraseStart, erased, named } = TIMELINE;
  if (progress < eraseStart) return reveal(GREETING, progress / typed);
  if (progress < erased) return reveal(GREETING, (erased - progress) / (erased - eraseStart));
  return reveal(NAME, (progress - erased) / (named - erased));
}
