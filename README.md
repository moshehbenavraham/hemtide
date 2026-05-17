# Fashion Magazine

Fashion Magazine is a Vite, React, and TypeScript site for Voyager, an editorial fashion photography magazine covering beauty campaigns, streetwear, accessories, and style culture.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components

## Requirements

- Node.js 20+
- npm 10+

## Local Development

```bash
npm install
npm run dev
```

The development server starts on port 8080 by default.

## Production Build

```bash
npm run build
npm run preview
```

The compiled app is emitted to `dist/` and can be served with standard static hosting tooling such as Nginx, Caddy, Apache, or any static hosting provider.

## Project Notes

- Editorial article data lives in `src/data/articles.ts`.
- Shared UI components live in `src/components`.
- Article imagery is served from `public/images`.
- Social preview metadata uses the local `public/social-card.svg` asset.
- The project uses standard Vite and npm tooling without vendor-specific build plugins.
