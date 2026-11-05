import { clamp } from "./ascii/math";

const GREETING = "hola, soy NeoBmo";
const NAME = "Luis Rodríguez";

/** Puntos del scroll tras el logo (0–1), sincronizados con los nombres gigantes. */
const TIMELINE = { typed: 0.28, eraseStart: 0.45, erased: 0.55, named: 0.72 };

const reveal = (text: string, amount: number) =>
  text.slice(0, Math.round(text.length * clamp(amount)));

/** La línea depende solo del progreso, así que subir la "desescribe" sin guardar estado. */
export function lineAt(progress: number) {
  const { typed, eraseStart, erased, named } = TIMELINE;
  if (progress < eraseStart) return reveal(GREETING, progress / typed);
  if (progress < erased) return reveal(GREETING, (erased - progress) / (erased - eraseStart));
  return reveal(NAME, (progress - erased) / (named - erased));
}
