import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static site for GitHub Pages (user site, served from the domain root).
export default defineConfig({
  site: 'https://alexpeng517.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  build: { inlineStylesheets: 'always' },
});
