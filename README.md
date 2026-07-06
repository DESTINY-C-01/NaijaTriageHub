# NaijaTriageHub

Offline-first symptom triage + emergency first-aid guide, built with Next.js
(App Router) and Tailwind, exported as 100% static files.

## Quickstart

```bash
npm install
npm run dev        # http://localhost:3000
npm run build       # writes static site to ./out
```

Because `next.config.js` sets `output: 'export'`, `npm run build` produces a
plain `out/` folder of HTML/CSS/JS you can drop on any static host, a shared
cPanel account, or even serve from a local device at a clinic with no
internet.

## Adding language #251 (or #4)

1. Copy `public/locales/hausa.json`.
2. Translate every string, keeping all keys and `id` fields identical
   (the `id`s like `fever`, `noUrine` are what the triage scoring logic
   reads - never translate those, only the `text`/`title`/`steps` values).
3. Save as `public/locales/<yourcode>.json`.
4. Add one line to `AVAILABLE_LANGUAGES` in `src/app/page.js`:
   ```js
   { code: 'yourcode', name: 'Your Language' },
   ```

No other code changes needed. The service worker automatically caches the
new file offline the first time anyone selects it.

## How offline works

- `public/sw.js` precaches the app shell on first load.
- Every JS/CSS chunk and asset gets cached the first time it's fetched.
- Every `/locales/<code>.json` file gets cached the first time a user picks
  that language - after that, it's available forever with zero network.

## Triage scoring

`computeResult()` in `src/app/page.js` is intentionally simple and
transparent:
- If a "critical" symptom is answered Yes (confusion for malaria; no
  urine or sunken eyes for dehydration) → **Emergency**, always.
- Otherwise, 3+ "Yes" answers → **Moderate**.
- Otherwise → **Low**.

This is a general-purpose triage helper, not a diagnostic tool - the UI
always tells users to seek real medical care for anything above "Low".