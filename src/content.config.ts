import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

/**
 * Every entry has two depths: the frontmatter `summary` is what the home
 * page shows at a glance; the Markdown body is the full story on its own
 * page, for whoever wants to go further.
 */

const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    status: z.enum(["activo", "en desarrollo", "idea"]),
    /** The strength this project proves. */
    strength: z.string(),
    summary: z.string(),
    repo: z.url().optional(),
    order: z.number(),
  }),
});

const sections = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/sections" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number(),
  }),
});

export const collections = { projects, sections };
