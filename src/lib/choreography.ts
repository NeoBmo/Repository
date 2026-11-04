/** Segundos de la coreografía automática: pintura → contemplación → logo. */
export const DISSOLVE_START = 6.3;
export const DISSOLVE_DURATION = 1.4;
export const LOGO_AT = DISSOLVE_START + DISSOLVE_DURATION;

/** Parte del recorrido de scroll que separa la pintura del logo. */
export const LOGO_SCROLL = 0.12;

/** Quien hace scroll durante la intro la acelera de forma gradual hasta este ritmo. */
export const MAX_RATE = 8;
/** Qué tan rápido el ritmo alcanza su objetivo, por segundo. */
export const RATE_RESPONSE = 2.5;
