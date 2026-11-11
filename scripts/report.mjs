// Build report: lists everything in src/content/ that still needs Alex's input.
// Runs after every build (npm "postbuild"); also `npm run report`.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const root = new URL('..', import.meta.url).pathname;
const load = (name) => parse(readFileSync(join(root, 'src/content', name), 'utf8'));
const site = load('site.yaml');
const pubs = load('publications.yaml');
const news = load('news.yaml');

const items = [];
const add = (file, where, what) => items.push({ file, where, what });

/** Every string containing a [placeholder], with its path. */
function walk(file, value, path) {
  if (typeof value === 'string') {
    const found = value.match(/\[[^\]]+\]/g);
    if (found) add(file, path, `placeholder ${found.join(' ')}`);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => walk(file, v, `${path}[${i}]`));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) walk(file, v, path ? `${path}.${k}` : k);
  }
}

// site.yaml
walk('site.yaml', site, '');
if (!site.portrait) add('site.yaml', 'portrait', 'no portrait; the 4:5 placeholder box is shown');
for (const [key, value] of Object.entries(site.links)) {
  if (!value) add('site.yaml', `links.${key}`, key === 'orcid' ? 'empty (optional; JSON-LD only)' : 'empty; link is left out');
}
if (site.links.cv && !existsSync(join(root, 'public', site.links.cv))) add('site.yaml', 'links.cv', `file public${site.links.cv} is missing`);
if (!site.rollout.video || !existsSync(join(root, 'public', site.rollout.video))) {
  add('site.yaml', 'rollout.video', `clip public${site.rollout.video} not supplied; the strip shows its placeholder`);
}
if (!site.rollout.poster || !existsSync(join(root, 'public', site.rollout.poster))) {
  add('site.yaml', 'rollout.poster', `poster public${site.rollout.poster} not supplied`);
}
if (!site.rollout.totalSteps) add('site.yaml', 'rollout.totalSteps', '0; set the real horizon [N] (step readout hidden until then)');

// publications.yaml
for (const pub of pubs) {
  const at = (field) => `${pub.id}.${field}`;
  walk('publications.yaml', { ...pub, bibtex: '' }, pub.id);
  if (!pub.year) add('publications.yaml', at('year'), '0; shown as [year]');
  if (!pub.media?.poster) add('publications.yaml', at('media.poster'), 'no poster; the "POSTER + LOOP" box is shown');
  if (!pub.media?.loop) add('publications.yaml', at('media.loop'), 'no 4-6 s loop');
  else if (!existsSync(join(root, 'public', pub.media.loop))) add('publications.yaml', at('media.loop'), `file public${pub.media.loop} is missing`);
  if (!pub.links || Object.values(pub.links).filter(Boolean).length === 0) add('publications.yaml', at('links'), 'no links; the title is plain text');
  if (!pub.bibtex?.trim()) add('publications.yaml', at('bibtex'), 'no BibTeX; the bibtex link is left out');
}

// news.yaml
news.forEach((item, i) => walk('news.yaml', item, `item ${i + 1}`));
const cutoff = new Date();
cutoff.setUTCMonth(cutoff.getUTCMonth() - 12, 1);
const month = (n) => String(n.date).replace(/^(\d{4})-(\d)$/, '$1-0$2');
const recent = news.filter((n) => /^\d{4}-\d{2}$/.test(month(n)) && month(n) >= cutoff.toISOString().slice(0, 7));
if (recent.length === 0) add('news.yaml', '(all)', 'no dated item from the last 12 months; the newest 2 are shown instead');

console.log(`\nBuild report: ${items.length} open content item${items.length === 1 ? '' : 's'}`);
let last = '';
for (const item of items) {
  if (item.file !== last) console.log(`\n  src/content/${item.file}`);
  last = item.file;
  console.log(`    ${item.where.padEnd(34)} ${item.what}`);
}
console.log('');
