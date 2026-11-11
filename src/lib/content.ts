import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Site = CollectionEntry<'site'>['data'];
export type Pub = CollectionEntry<'publications'>['data'];
export type News = CollectionEntry<'news'>['data'];

export async function getSite(): Promise<Site> {
  const entry = await getEntry('site', 'site');
  if (!entry) throw new Error('src/content/site.yaml did not load');
  return entry.data;
}

/**
 * Publications in file order, except that entries with a known year are sorted
 * newest first among themselves. Entries with year 0 (unknown) keep their slot.
 */
export async function getPublications(): Promise<Pub[]> {
  const all = (await getCollection('publications')).map((e) => e.data).sort((a, b) => a.order - b.order);
  const known = all.filter((p) => p.year > 0).sort((a, b) => b.year - a.year || a.order - b.order);
  let next = 0;
  return all.map((p) => (p.year > 0 ? known[next++] : p));
}

const isMonth = (date: string) => /^\d{4}-\d{2}$/.test(date);

/**
 * DESIGN.md §6.4: at most 5 items dated within the 12 months before the build;
 * if none qualify, the newest 2. Items whose date is still a [placeholder] are
 * always shown first so they are impossible to miss.
 */
export async function getNews(now = new Date()): Promise<News[]> {
  const all = (await getCollection('news'))
    .map((e) => ({ ...e.data, date: e.data.date.replace(/^(\d{4})-(\d)$/, '$1-0$2') })) // "2026-9" -> "2026-09"
    .sort((a, b) => a.order - b.order);
  const pending = all.filter((n) => !isMonth(n.date));
  const dated = all.filter((n) => isMonth(n.date)).sort((a, b) => b.date.localeCompare(a.date) || a.order - b.order);
  const cutoffDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 12, 1));
  const cutoff = cutoffDate.toISOString().slice(0, 7);
  const recent = dated.filter((n) => n.date >= cutoff);
  return [...pending, ...(recent.length ? recent : dated.slice(0, 2))].slice(0, 5);
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** One line of text with *italics*; everything else is escaped. */
export function inlineMarkdown(text: string): string {
  return escapeHtml(text).replace(/\*([^*]+)\*/g, '<i>$1</i>');
}

/** Where a paper's title and media point: project page, else paper, else arXiv. */
export function primaryLink(pub: Pub): string | undefined {
  return pub.links.project || pub.links.paper || pub.links.arxiv || undefined;
}

export function firstSentence(text: string): string {
  const m = text.match(/^.*?[.!?](?=\s|$)/);
  return (m ? m[0] : text).trim();
}
