# Smirnoff site on Quartz

This repository contains the Quartz-based source for `slavx.ru`: the main site content, custom landing components, legal pages, multicontent logic, and local tooling used to manage site variants.

## Project structure

- `content/` — primary site content
- `docs/` — local project and Quartz-related docs
- `quartz/` — Quartz source plus custom components, scripts, and styles
- `quartz/static/data/` — JSON-backed landing, form, and carousel data
- `tools/multicontent-admin/` — local admin for multicontent editing

## Common commands

Quartz requires **Node >= 22**.

```bash
npm ci
```

- `npm run site:dev` — build and serve the main site from `content/`
- `npm run docs` — build and serve the docs tree from `docs/`
- `npm run multicontent-admin` — start the local multicontent admin
- `npm run check` — typecheck + prettier check
- `npm run format` — format the repo with prettier
- `npm test` — run unit tests

## Custom Components: Services Carousel

This repo includes a services carousel component that can be embedded in Markdown pages.

Usage:

```
<services-carousel data-source="/static/data/services-carousel.json"></services-carousel>
```

Data file location:

- `quartz/static/data/services-carousel.json`

Per-instance overrides (optional):

- `data-auto-speed`, `data-drag-sensitivity`, `data-height`, `data-radius-scale`
- `data-min-radius`, `data-max-radius`, `data-min-gap`
- `data-form-action`, `data-form-method`

Data file shape (example):

```
{
  "form": {
    "action": "https://app.slavx.ru/api/v1/f/12a7dd50d5c0",
    "method": "POST",
    "submitLabel": "Send",
    "privacyNote": "No spam"
  },
  "cards": [
    {
      "title": "Design",
      "description": "UI/UX, prototypes, system.",
      "price": "from 25 000",
      "note": "Reply within a day",
      "button": {
        "text": "Order",
        "href": "/Кoнтакты",
        "action": "open-modal"
      }
    }
  ]
}
```

Notes:

- Multiple carousels are supported on the same page via different JSON files.
- Form submission is handled via AJAX to avoid redirects.
- Payload is sent as JSON with flat fields: `name`, `email`, `message`, `service`, `price`.
- API expects `application/json` (or `application/x-www-form-urlencoded`). This component uses JSON.
- Server-side redirects are treated as success and not followed to prevent `.../null` requests.

## Project Docs: Home Central + Callback

- Integration audit and architecture notes: `docs/home-central-integration.md`
- Services carousel audit: `docs/carousel-audit.md`

## Upstream Quartz reference

Upstream Quartz documentation: https://quartz.jzhao.xyz/
