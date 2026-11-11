// Renders the 1200×630 social card to public/og/home.png from site.yaml.
// Runs before every build (npm "prebuild"). Uses the self-hosted fonts, so no system fonts are needed.
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import wawoff2 from 'wawoff2';
import { parse } from 'yaml';

const root = new URL('..', import.meta.url).pathname;
const site = parse(readFileSync(join(root, 'src/content/site.yaml'), 'utf8'));

// resvg reads TTF, not WOFF2: unpack the web fonts into a temp directory.
const tmp = mkdtempSync(join(tmpdir(), 'og-fonts-'));
const fontFiles = [];
for (const name of ['cormorant-garamond-latin-wght-normal', 'geist-mono-latin-wght-normal']) {
  const ttf = join(tmp, `${name}.ttf`);
  writeFileSync(ttf, await wawoff2.decompress(readFileSync(join(root, 'public/fonts', `${name}.woff2`))));
  fontFiles.push(ttf);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Greedy word wrap by approximate glyph width. */
function wrap(text, maxChars) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && (line + ' ' + word).length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const firstSentence = (site.statement.match(/^.*?[.!?](?=\s|$)/) ?? [site.statement])[0].trim();
const statement = wrap(firstSentence, 44);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FAFAFA"/>
  <text x="96" y="214" font-family="Cormorant Garamond" font-weight="500" font-size="104" letter-spacing="-1" fill="#191B1D">${esc(site.name)}</text>
  <text x="98" y="270" font-family="Geist Mono" font-size="24" fill="#6C6F73">${esc(site.affiliation)}</text>
  <rect x="96" y="318" width="1008" height="1" fill="#DEE0E2"/>
  ${statement
    .map(
      (line, i) =>
        `<text x="96" y="${400 + i * 62}" font-family="Cormorant Garamond" font-weight="500" font-size="50" fill="#191B1D">${esc(line)}</text>`,
    )
    .join('\n  ')}
  <rect x="96" y="560" width="10" height="10" rx="5" fill="#1D60BC"/>
  <text x="118" y="571" font-family="Geist Mono" font-size="20" fill="#6C6F73">alexpeng517.github.io</text>
</svg>`;

const png = new Resvg(svg, { font: { fontFiles, loadSystemFonts: false } }).render().asPng();
mkdirSync(join(root, 'public/og'), { recursive: true });
writeFileSync(join(root, 'public/og/home.png'), png);
console.log(`og: wrote public/og/home.png (${Math.round(png.length / 1024)} KB)`);
