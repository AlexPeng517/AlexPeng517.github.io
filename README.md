# alexpeng517.github.io

Personal site of Li-Xuan (Alex) Peng. Static [Astro](https://astro.build) site, deployed to GitHub Pages by
`.github/workflows/deploy.yml`. The design spec is `DESIGN.md` in the design bundle.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (Node 22.23.4 or newer) |
| `npm run dev` | Local server at `http://localhost:4321` with live reload |
| `npm run build` | Build to `dist/`, then print the report of content still to fill |
| `npm run preview` | Serve the built `dist/` |
| `npm run report` | Print only the open-content report |

## Editing content

All text lives in three YAML files. No component needs to change.

| To change | Edit |
| --- | --- |
| Name, affiliation, bio, status line, research statement, profile links, email | `src/content/site.yaml` |
| Papers | `src/content/publications.yaml` |
| News | `src/content/news.yaml` |
| Portrait | put the file in `src/assets/portrait/`, set `portrait:` in `site.yaml` |
| CV | replace `public/cv.pdf` |
| Favicon | replace `public/favicon.png` (64 px) and `public/apple-touch-icon.png` (180 px) |

Anything in `[square brackets]` is a placeholder; `npm run build` lists every one that remains.

### Adding a paper

Add one entry to `src/content/publications.yaml` (fields are documented in `src/content.config.ts`):

- `group` decides the heading it appears under. `corresponding: true` adds "corresponding author" to the meta line.
- `media.poster`: an image file name in `src/assets/media/`. It is shown whole in a 4:3 box, on white unless `media.background` sets another colour.
- `media.loop`: a 4–6 s silent MP4 in `public/media/`, written as `/media/<file>.mp4`. It plays on hover.
- Leave out any link you do not have. `bibtex` adds the bibtex link when it is not empty.
- `status: preprint` shows "Preprint <year>" and never the venue.

### Rollout strip

Put the clip at `public/media/delphi-rollout.mp4` and its first frame at `public/media/delphi-rollout.avif`, then
set `rollout.totalSteps` in `site.yaml`. Until the clip exists the strip shows its placeholder. Encoding commands
are in `DESIGN.md` §7.

## Deploying

Pushing to `master` runs `.github/workflows/deploy.yml`, which builds the site and publishes `dist/` to the
`gh-pages` branch. GitHub Pages serves that branch (Settings → Pages → Source: Deploy from a branch, `gh-pages`).
`public/.nojekyll` stops Pages from running Jekyll on it, which would drop the `_astro/` folder.

## Layout of the repository

```text
src/content/        site.yaml, publications.yaml, news.yaml
src/content.config.ts   schemas; the build fails on a schema error
src/components/     one .astro file per section
src/scripts/        theme.ts, bibtex.ts, video.ts, readout.ts
src/styles/         tokens.css (design tokens), base.css
src/assets/         portrait and paper posters (optimised at build)
public/             cv.pdf, fonts, media, redirects for old URLs, paper PDFs at their old paths
scripts/            og.mjs (social card), report.mjs (open-content report)
```
