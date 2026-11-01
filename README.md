# NeoBmo

Sitio personal de Luis Rodríguez — v7.

## Stack

- [Astro](https://astro.build) como esqueleto estático.
- TypeScript, CSS y Canvas sin librerías de UI ni de animación.
- JetBrains Mono, servida localmente.

## Desarrollo

Requiere Node 24 (ver `.nvmrc`).

```bash
npm install
npm run dev
```

`npm run build` verifica tipos y genera el sitio en `dist/`.

## Despliegue

Cada push a `main` publica en GitHub Pages mediante `.github/workflows/deploy.yml`.

## Pintura

El hero se dibuja a partir de *La noche estrellada* (Vincent van Gogh, 1889), obra de dominio público. `npm run prepare:painting <imagen>` genera, desde una sola reproducción, los dos recursos que se muestrean en tiempo real:

- `starry-night.webp`: la pintura completa, para pantallas horizontales.
- `starry-night-portrait.webp`: una reinterpretación vertical armada con piezas de la propia obra (luna, ciprés, remolinos, pueblo), para teléfonos.

Cada pantalla descarga solo la versión que necesita.

## Licencias

- Código: © Luis Rodríguez.
- JetBrains Mono: SIL Open Font License 1.1 (`src/assets/fonts/OFL.txt`).
- *La noche estrellada*: dominio público.
