# Quartz v4

> “[One] who works with the door open gets all kinds of interruptions, but [they] also occasionally gets clues as to what the world is and what might be important.” — Richard Hamming

Quartz is a set of tools that helps you publish your [digital garden](https://jzhao.xyz/posts/networked-thought) and notes as a website for free.
Quartz v4 features a from-the-ground rewrite focusing on end-user extensibility and ease-of-use.

🔗 Read the documentation and get started: https://quartz.jzhao.xyz/

[Join the Discord Community](https://discord.gg/cRFFHYye7t)

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
        "href": "/contact"
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

## Sponsors

<p align="center">
  <a href="https://github.com/sponsors/jackyzha0">
    <img src="https://cdn.jsdelivr.net/gh/jackyzha0/jackyzha0/sponsorkit/sponsors.svg" />
  </a>
</p>
