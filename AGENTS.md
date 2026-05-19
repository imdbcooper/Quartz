# AGENTS.md

## Repository expectations

- Primary content lives in `content/`; source code lives in `quartz/`.
- Site configuration is in `quartz.config.ts`; layout composition is in `quartz.layout.ts`.
- Static output is written to `public/`.

## Commands

- `npm run quartz` run the Quartz CLI.
- `npm run docs` build and serve docs (`npx quartz build --serve -d docs`).
- `npm run site:dev` builds and serves the site with Quartz's clean-URL preview server.
- `npm run site:preview` serves the existing `public/` output with clean-URL handling.
- `npm run check` typecheck + prettier check.
- `npm run format` format with prettier.
- `npm test` run tests with `tsx --test`.

## Local preview notes

- `python -m http.server public` does not rewrite Quartz extensionless routes like `/Кoнтакты`; use `npm run site:dev` or `npm run site:preview` instead.

## Project context

- Quartz v4 static site generator configured for the "Smirnoff" site.
- Base URL: `slavx.ru`; locale `en-US`; analytics via Plausible.
- Stack: Node.js (>=22), TypeScript, Preact, SCSS.

## Theme and plugins

- Theme fonts: `Inter` (header), `Inter` (body), `IBM Plex Mono` (code).
- Light/dark palettes are defined in `quartz.config.ts`.
- Plugins include Markdown transforms, syntax highlighting, TOC, link crawling, and KaTeX.
- Emitters include `CustomOgImages()` (config comment says this can slow builds).

## Layout and UI notes

- Left column: Avatar, Search, Darkmode, ReaderMode, CardMenu.
- Right column: Search, Darkmode, ReaderMode, Graph (tags hidden), TOC, Backlinks.
- Explorer/nav styles: `quartz/components/styles/explorer.scss`.
