import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';

const groupId = z.enum(['dynamics', 'generative']);

/** site.yaml is one object; the loader wants a list of entries. */
const site = defineCollection({
  loader: file('src/content/site.yaml', {
    parser: (text) => [{ id: 'site', ...parse(text) }],
  }),
  schema: z.object({
    name: z.string(),
    alternateNames: z.array(z.string()).default([]),
    affiliation: z.string(),
    portrait: z.string().default(''), // file name in src/assets/portrait/
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // footer date; default is the last commit date
    bio: z.string(),
    status: z.string().default(''),
    statement: z.string(),
    pubGroups: z.array(z.object({ id: groupId, label: z.string() })),
    rollout: z.object({
      video: z.string().default(''),
      poster: z.string().default(''),
      totalSteps: z.number().int().min(0).default(0),
      caption: z.string(),
    }),
    links: z.object({
      email: z.string().default(''),
      cv: z.string().default(''),
      scholar: z.string().default(''),
      github: z.string().default(''),
      linkedin: z.string().default(''),
      x: z.string().default(''),
      orcid: z.string().default(''),
    }),
  }),
});

const publications = defineCollection({
  loader: file('src/content/publications.yaml', {
    // keep the order of the file so entries with an unknown year stay where Alex put them
    parser: (text) => (parse(text) as Record<string, unknown>[]).map((entry, order) => ({ ...entry, order })),
  }),
  schema: z.object({
    id: z.string(), // slug, also the project page slug and the anchor on the homepage
    order: z.number(),
    title: z.string(),
    authors: z.array(
      z.object({ name: z.string(), self: z.boolean().default(false), equal: z.boolean().default(false) }),
    ),
    venue: z.string().default(''), // ignored when status is preprint
    year: z.number(), // 0 = unknown placeholder; rendered as "[year]"
    status: z.enum(['published', 'preprint', 'workshop']),
    award: z.string().default(''),
    contribution: z.enum(['first', 'co-first', 'other']),
    corresponding: z.boolean().default(false), // adds "corresponding author" to the meta line
    group: groupId,
    media: z
      .object({
        poster: z.string().optional(),
        loop: z.string().optional(),
        background: z.string().optional(), // colour behind a poster that does not fill the 4:3 box
      })
      .default({}),
    links: z
      .object({
        paper: z.string().optional(),
        arxiv: z.string().optional(),
        project: z.string().optional(),
        code: z.string().optional(),
        video: z.string().optional(),
      })
      .default({}),
    result: z.string(),
    bibtex: z.string().default(''),
  }),
});

const news = defineCollection({
  loader: file('src/content/news.yaml', {
    parser: (text) =>
      (parse(text) as Record<string, unknown>[]).map((entry, order) => ({ id: `news-${order}`, order, ...entry })),
  }),
  schema: z.object({
    order: z.number(),
    date: z.string(), // "YYYY-MM", or a "[placeholder]"
    text: z.string(), // one line; *italics* for paper names
  }),
});

export const collections = { site, publications, news };
