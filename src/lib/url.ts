/** Prefixes a site path with the deploy base, e.g. "/proyectos/blog". */
export const href = (path: string) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
