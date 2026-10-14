# Lapata — लापता

Your music. Your people. Your memories.

A cinematic music-sharing platform — discover, collect, and share albums with friends. Built with Next.js, Tailwind CSS, and a warm editorial aesthetic.

![Next.js](https://img.shields.io/badge/Next.js-16.4-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)

## Features

- **Welcome / landing** — textured hero with album artwork, peeking vinyl disc (spin animation), glossy playback pill (play/pause images), artist/title display, Spotify link, and macOS-style dock with magnification + tooltips
- **Discover** — trending albums, browse by mood, popular tracks
- **My Music** — saved albums, recently played, library stats
- **Music Inbox** — songs shared by friends with notes
- **Friends** — online presence, suggested friends
- **Messages / Notifications / Playlists / Diary / Settings** — app shell pages with mock data
- **Auth shells** — login and registration pages (branded)
- **Responsive** — mobile header, bottom navigation, dock scrolling

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, `cacheComponents`, `partialPrefetching`, `reactCompiler`)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 + custom CSS in `src/app/globals.css`
- **Fonts:** `next/font/google` — Inter, Playfair Display, Noto Sans Devanagari, Pacifico
- **Brand tooling:** Python (`fontTools`) script `scripts/brand/build_logo.py` generates the Devanagari wordmark

## Project Structure

```
src/
  app/
    page.tsx              # welcome / hero page
    layout.tsx            # root layout + fonts
    icon.svg              # app icon (from brand script)
    login/  register/     # auth pages
    (app)/                # authenticated shell: home, discover, inbox, friends, etc.
  components/
    album-dock.tsx        # dock with magnification
    mobile-nav.tsx        # bottom nav (mobile)
    sidebar.tsx           # sidebar (desktop)
    icons.tsx             # SVG icons
    brand/lapata-wordmark.tsx
  data/music.ts           # album / track mock data
public/
  assets/                 # bg-image, glossy control pills
  brand/                  # logo SVGs, brush logo, vinyl disc
scripts/brand/            # logo-generation tooling
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install & run

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Other commands

```bash
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint (next + typescript)
```

## Environment Variables

No secrets are required to run the app locally — all current pages use mock data.

For future integrations, copy the example file:

```bash
cp .env.example .env.local
# edit .env.local
```

`.env*` files (except `.env.example`) are gitignored.

## Assets & Branding

- Hero texture: `public/assets/bg-image.png` (used via `url('/assets/bg-image.png')` in `globals.css`)
- Vinyl: `public/brand/diskk.png`
- Controls: `public/assets/Glossy Minimal Media Control Pill(1).png` and `Glossy Pause Media Control Bar.png`
- Logos: `public/brand/lapata-*.svg` and `lapata-brush-logo.png`
- Regenerate the wordmark: `python scripts/brand/build_logo.py` (requires `fontTools` and fetched fonts)

> Do not replace PNG artwork with CSS recreations unless intentionally redesigning.

## Deployment

Standard Next.js deployment — e.g. Vercel:

```bash
npm run build
```

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).

## License

Private. All rights reserved.
