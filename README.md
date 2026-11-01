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

El hero se dibuja a partir de *La noche estrellada* (Vincent van Gogh, 1889), obra de dominio público. `npm run prepare:painting <imagen>` reduce cualquier reproducción al recurso compacto que se muestrea en tiempo real (`src/assets/starry-night.webp`).

## Licencias

- Código: © Luis Rodríguez.
- JetBrains Mono: SIL Open Font License 1.1 (`src/assets/fonts/OFL.txt`).
- *La noche estrellada*: dominio público.
