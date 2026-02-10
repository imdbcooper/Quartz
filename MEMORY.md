# Project Memory

## Services Carousel

- Component: `quartz/components/ServicesCarousel.tsx`
- Script: `quartz/components/scripts/servicesCarousel.inline.ts`
- Styles: `quartz/components/styles/servicesCarousel.scss`
- Data: `quartz/static/data/services-carousel.json`

### Embed

```
<services-carousel data-source="/static/data/services-carousel.json"></services-carousel>
```

### Data format

- `cards[]`: `title`, `description`, `price`, `note`, `button.text`, `button.href`
- `form`: `action`, `method`, `submitLabel`, `privacyNote`, `subtitle`

### Behavior

- Card click opens a modal form.
- Form submission uses AJAX (no redirect).
- Height auto-calculates when `height` is `0`.
- Multiple carousels supported via different JSON files.
