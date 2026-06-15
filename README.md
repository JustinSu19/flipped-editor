# Flipped Editor

Markdown to WeChat magazine-style article layouts. This is a local-first Vite + React + TypeScript MVP for turning Markdown drafts into quiet, image-led, Songti-style vertical articles.

## Run Locally

```bash
npm install
npm run dev
```

Then open the Vite URL, normally:

```text
http://127.0.0.1:5173
```

## Build

```bash
npm run build
npm run lint
```

## Features

- Markdown input with localStorage draft persistence
- Markdown parsing into typed content blocks
- Five article templates:
  - Nature Magazine
  - Image Essay
  - Hero Opening
  - Poetic Minimal
  - Chapter Cards
- Drag and click multi-image upload
- Image placeholder matching for `{{image1}}`, `[image: hero]`, `[image: wide]`, `[image: square]`, `[image: small]`, `[image: split]`
- Style controls for width, typography, spacing, whitespace, image radius, image filter, and paper tone
- WeChat/mobile/long preview modes
- Copy inline-styled article HTML
- Export standalone HTML file
- Export article body as long PNG

## Structure

```text
src/
  components/      app shell, editor controls, image uploader, preview, export
  templates/       five magazine-style article templates and registry
  types/           content, image, style, and template types
  utils/           markdown parsing, image helpers, export, storage
  styles/          app chrome and article typography
```
