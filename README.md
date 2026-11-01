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

## Licencias

- Código: © Luis Rodríguez.
- JetBrains Mono: SIL Open Font License 1.1 (`src/assets/fonts/OFL.txt`).
