# Flappin UFO 

A Flappy Bird–style web game where you pilot a UFO through fields of asteroids. Levels get longer and tighter as you progress.

## Hosting

There is currently no public deployment. The previous `flappin-ufo.vercel.app`
host is offline, so the source in this repository
(<https://github.com/nirholas/flappin-ufo>) is the canonical location while the
game is being migrated to new hosting.

`yarn build` emits a fully static site to `dist/`, which any static host or CDN
can serve. The leaderboard in [api/](api/) is the only part that needs a
serverless runtime; without it the game still runs and falls back to a
`localStorage` leaderboard.

## Tech

React 19 + TypeScript 5.7, Vite 7, Tailwind CSS 4, ESLint 9 (flat config), Vitest.

## Getting started

```bash
yarn
yarn dev
```

Then open the printed local URL.

## Scripts

- `yarn dev` — start the Vite dev server
- `yarn build` — type-check and build for production
- `yarn preview` — preview the production build
- `yarn lint` — run ESLint
- `yarn test` — run the Vitest suite once
- `yarn test:watch` — run Vitest in watch mode

## How to play

Tap (or press and hold) to thrust upward; release to fall. Avoid the asteroids and reach the end of each level. Each cleared pillar adds to your score; clearing them all advances to the next level.

A ghost UFO of the current top run replays alongside you so you can race against the best.

## Leaderboard

In dev, the leaderboard and ghost are stored in `localStorage` — zero setup. In production (and any build run with the right env vars) the same UI talks to a tiny serverless API backed by Upstash Redis.

To enable the global leaderboard:

1. Create an Upstash Redis database (or a Vercel KV store, which is Upstash under the hood).
2. Copy [.env.example](.env.example) to `.env.local` and fill in `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (or the equivalent `KV_REST_API_*` pair).
3. Deploy the [api/](api/) directory to any host that runs Node serverless
   functions, and serve `dist/` as the static site alongside it.

The API surface:

- `GET /api/leaderboard?limit=N` — top N runs (no recording payload)
- `GET /api/ghost` — top run including its recording (used to render the ghost)
- `POST /api/runs` — submit `{ name, score, level, recording }`

## Project layout

- [src/App.tsx](src/App.tsx) — wiring: refs, rAF tick, phase-driven side effects, recording, ghost
- [src/game/state.ts](src/game/state.ts) — phase state machine (`title → idle → playing → crashing/levelEnding → …`) as a pure reducer
- [src/game/pillars.ts](src/game/pillars.ts) — pillar count + height generation per level
- [src/game/recording.ts](src/game/recording.ts) — compact event-edge recording + replay lookup
- [src/lib/leaderboard.ts](src/lib/leaderboard.ts) — leaderboard client (localStorage in dev, fetch in prod, with fallback)
- [src/components/](src/components/) — `TitleScreen`, `GameOverScreen`, `LevelUpOverlay`, `Pillars`, `Player`, `GameplayBackground`, `Ghost`, `Leaderboard`, `NameInput`
- [src/useRequestAnimationFrame.ts](src/useRequestAnimationFrame.ts) — rAF hook driving the per-frame check
- [src/AnimatedBackground.tsx](src/AnimatedBackground.tsx) — title/game-over backdrop
- [src/images/](src/images/) — sprites (alien, asteroid, flame, starfield)
- [public/](public/) — favicon, PWA manifest, social cover image
- [api/](api/) — Node serverless functions for the leaderboard, backed by Upstash Redis
- [.github/workflows/ci.yml](.github/workflows/ci.yml) — lint + test + build on every push and PR

## Documentation

Full documentation site: **https://nirholas.github.io/flappin-ufo/**

- [Getting started](docs/getting-started.md) covers install and first run.
- [Examples](docs/examples.md) has copy-paste snippets.
