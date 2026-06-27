# Flipped Editor

Flipped Editor is a local-first Vite + React + TypeScript tool for turning Markdown drafts into quiet, image-led WeChat article layouts.

## Run Locally

```bash
npm install
npm run dev
```

Then open the Vite URL, normally:

```text
http://127.0.0.1:5173
```

On Windows, you can also double-click:

```text
run_flipped_editor.py
```

The helper script starts Vite on `0.0.0.0`, so a phone on the same Wi-Fi can open the LAN URL printed in the terminal window.

## Build

```bash
npm run lint
npm run build
```

## Deploy

This is a static Vite app. It is suitable for Cloudflare Pages, Vercel, or Netlify.

Recommended settings:

```text
Build command: npm run build
Output directory: dist
```

## Features

- Markdown editor with localStorage draft persistence
- Markdown rendering for headings, paragraphs, quotes, ordered/unordered lists, one-level nested unordered lists, dividers, tables, bold, italic, and inline code
- Inline image insertion with local upload and Markdown image tokens
- Click-to-upload hero image areas in the preview
- Four article templates:
  - Nature Magazine
  - Image Essay
  - Poetic Minimal
  - Chapter Cards
- WeChat and magazine preview modes
- Style controls for page margin, typography, spacing, whitespace, image radius, font, and paper tone
- One-click rich-text copy for pasting into the WeChat editor
- Export article body as long PNG
- Local-only image handling; no backend, no database, no login

## Structure

```text
src/
  components/      app shell, editor, preview, export, style controls
  data/            default sample content
  templates/       magazine-style article templates and registry
  types/           content, image, style, and template types
  utils/           markdown parsing, image helpers, export, storage
  styles/          app chrome and article typography
```

## Privacy Notes

The app stores drafts and style settings in the browser's `localStorage`. Uploaded images are kept in the current browser session as object URLs and are not uploaded anywhere by this app.
