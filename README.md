# VALORINK + Kindling

Two self-contained dating site mockups, ready to drop onto Netlify.

- **`index.html`** — Valorink, the Valorant agent-select-style dating site (default landing).
- **`kindling.html`** — Kindling, the general-purpose dating site.
- **`netlify.toml`** — Netlify config (publish directory, headers).
- **`valorink-site.zip`** — Pre-bundled zip of all deployable files.

Everything is static HTML/CSS/JS. No build step, no backend, no dependencies.

## Deploy to Netlify (mobile-friendly)

### Option 1 — Netlify Drop (easiest, works on phone)

1. On your phone, download `valorink-site.zip` from this repo:
   - Tap the file in the GitHub UI → **Download**.
2. Open [https://app.netlify.com/drop](https://app.netlify.com/drop) in mobile Safari/Chrome.
3. Tap the drop area → upload the zip.
4. Netlify gives you a live URL in about 10 seconds.

### Option 2 — Connect this repo

1. Go to [https://app.netlify.com/start](https://app.netlify.com/start).
2. Pick **GitHub** → authorize → select `kuestasp/Epstein`.
3. Branch: `claude/session-title-request-2rxJc` (or main, once merged).
4. Publish directory: `.` (Netlify reads `netlify.toml` automatically).
5. Click **Deploy** — done.

### Option 3 — Netlify CLI (desktop)

```bash
npm install -g netlify-cli
netlify deploy --dir=. --prod
```

## Local preview

Just open `index.html` in any browser. Or:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Mobile

Both pages are responsive — cards resize for phone viewports, touch-drag swipes work on iOS/Android.
