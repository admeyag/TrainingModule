# Purplle Packer Training — Cloudflare Deployment Guide

TanStack Start (React 19 + Vite) app that builds to a Cloudflare Worker.

- `/` — Packer training: details (requires an `@purplle.com` work email) → SOP +
  narrated video → assessment → score
- `/panel` — Admin panel, password protected. Password: `trainingpanel2026`
  (the Panel link is hidden from the header; open `/panel` directly)

---

## 1. Prerequisites

- Node.js 20+ (`node -v`), npm 10+
- Cloudflare account
- Wrangler: `npm install -g wrangler` (or use `npx wrangler`)

## 2. Install & run locally

```bash
npm install
npm run dev
```

Opens on http://localhost:8080

## 3. Backend configuration

No backend environment variables are required for this exported build. The
public browser connection values are included as production fallbacks in
`vite.config.ts`, so both local Wrangler builds and Cloudflare Git builds use
the same existing training database automatically.

You may still override the `VITE_SUPABASE_*` values at build time if you later
move the app to a different backend project.

### 3a. The SOP video

No video environment variable is required. The app uses a permanent absolute
asset URL with cross-origin and byte-range support, so the narrated SOP video
works on Cloudflare Workers without copying the 12 MB file into the build.

## 4. Build

```bash
npm run build
```

Output goes to `dist/`:
Worker entry `dist/server/server.js` · Static assets `dist/client/`
(`dist/server/wrangler.json` is generated automatically by the build).

## 5. Deploy — Option A: Wrangler from your machine

```bash
npm install
npm run build
npx wrangler login
npx wrangler deploy -c dist/server/wrangler.json
```

## 6. Deploy — Option B: Cloudflare Git integration

1. Push this folder to a GitHub repo.
2. Cloudflare dashboard → **Workers & Pages → Create → Import a repository**.
3. Build command: `npm install && npm run build`
4. Deploy command: `npx wrangler deploy -c dist/server/wrangler.json`
5. Add the env vars as **build variables** (section 3) and redeploy.

## 7. Post-deploy checklist

- Logo shows in the header → static assets are served.
- The SOP video shows its duration and plays with sound.
- On `/`, a non-`@purplle.com` email blocks **Start training**.
- A valid `@purplle.com` email moves to the SOP step → backend reachable.
- `/panel` → the Email column shows each packer's work email; CSV export
  includes it.
