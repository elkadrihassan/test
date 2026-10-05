# Festival Amougar — Moussem de Tan-Tan 2026

React + TypeScript + Vite + Tailwind CSS v4 + GSAP (ScrollTrigger) + Lenis + Leaflet + Lucide.
Trilingual (FR / AR with true RTL / EN).

```bash
npm install
npm run dev      # http://localhost:5173  (?lang=ar | en | fr)
npm run build    # type-check + production build to dist/
```

## Structure
- `src/components/` — Navbar, Hero, Intro, Stats, Heritage (pinned horizontal scroll), Programme, Experiences, City, DigitalHeritage, Gallery (lightbox), Video, News, MapSection (lazy), PracticalInfo, Footer, plus Loader, Cursor, ui helpers.
- `src/i18n/content.ts` — all copy in FR / EN / AR (written per language, not mirrored). `LangContext.tsx` flips `lang`/`dir` and runs the page-transition curtain.
- `src/data/` — `programme.ts` (events, venues), `places.ts` (map points), `media.ts` (image registry).

## Replacing placeholders with real assets
- **Photography:** every image is a procedural SVG scene (`components/Scene.tsx`). In `src/data/media.ts`, add `src` / `srcSet` to any entry and a lazy-loaded `<img>` replaces the scene automatically.
- **Film:** put the video in `public/video/` and set `VITE_VIDEO_SRC=/video/amougar.mp4` (optional `VITE_VIDEO_POSTER`). Until then the player shows an animated reel.
- **Programme, venues, map coordinates, contact e-mail, social links** are illustrative placeholders — confirm with the organisers.
- "Download full programme" opens a print-ready full programme (Save as PDF) in the current language.

## Accessibility & performance
Semantic landmarks, skip link, visible focus, ARIA tabs/dialogs with focus traps, Esc / arrow-key support (RTL-aware), `prefers-reduced-motion` (no smooth scroll, pinning or reveals), custom cursor only on fine pointers. Map code (Leaflet) is a lazy chunk mounted near the viewport; fonts are self-hosted.
