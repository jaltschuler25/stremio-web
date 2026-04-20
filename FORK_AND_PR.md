# Stremio Web: cast button fix (upstream PR notes)

## What this branch fixes (read this first)

**Problem:** In **Stremio 5’s desktop shell** (e.g. macOS WKWebView), the **Chromecast / cast toolbar button stays greyed out or never becomes usable**, because the **Google Cast Web Sender SDK** does not initialise there the way it does in Chromium.

**What changes:** When the Cast SDK never signals readiness (or times out), this branch **falls back to the bundled streaming server** that already exposes `GET /casting/` and the player control API. The web UI can then treat casting as available and drive the TV through that HTTP path—so the **cast button works** instead of staying disabled.

**Related report:** [stremio-bugs#1316 — Cast to Chromecast/Smart TV not implemented for Stremio v5](https://github.com/Stremio/stremio-bugs/issues/1316)

---

This tree tracks **[Stremio/stremio-web](https://github.com/Stremio/stremio-web)** on branch `feature/wkwebview-bundled-server-casting` with that fallback wired into the official `Chromecast` service.

### Where the logic lives

- `src/services/Chromecast/ChromecastTransport.js` — Cast SDK path + **timeout** if the SDK never initialises  
- `src/services/Chromecast/ChromecastServerTransport.js` + `chromecastServerShim.js` — bundled-server path so the **Chromecast service becomes “active”** and the **cast control behaves** when the SDK cannot  
- `src/services/Chromecast/Chromecast.js` — chooses server transport when the local streaming server responds  

The large `chromecastServerShim.js` is adapted from a community **cast-bridge** reference (same author family as this work); it implements the small `cast.framework` surface `ChromecastTransport` expects and talks to `http://127.0.0.1:11470/casting/`.

---

## Copy-paste for your GitHub PR

**Suggested title**

`fix(Chromecast): enable cast button when Cast SDK unavailable (WKWebView / v5 shell)`

**Suggested description**

```markdown
### Summary
Fixes the **greyed-out / non-functional Chromecast cast button** in environments where the Google Cast Web Sender SDK never becomes available— notably **Stremio 5’s embedded WebView** (e.g. WKWebView on macOS), while the bundled streaming server already supports casting via `/casting/`.

### Approach
- Time out waiting on `cast_sender` / `__onGCastApiAvailable`.
- If the local streaming server (`/settings` on default port) responds, initialise a **server-backed** transport + shim that mirrors the Cast API surface Stremio’s `ChromecastTransport` uses, driving playback through `GET /casting/.../player`.

### Issue
Closes / relates to: https://github.com/Stremio/stremio-bugs/issues/1316

### Notes
- `chromecastServerShim.js` is ported from a community reference implementation adapted for in-tree bundling.
```

---

## Fork and open a PR (GitHub)

1. **Fork** upstream: https://github.com/Stremio/stremio-web/fork  
   (Or: `brew install gh && gh auth login`, then `gh repo fork Stremio/stremio-web`.)

2. **Add your fork as a remote** (replace `YOUR_USER`):

   ```bash
   cd /path/to/your/stremio-web
   git remote add fork https://github.com/YOUR_USER/stremio-web.git
   ```

3. **Push the branch**:

   ```bash
   git push -u fork feature/wkwebview-bundled-server-casting
   ```

4. On GitHub: open a PR from **`YOUR_USER/stremio-web`** `feature/wkwebview-bundled-server-casting` → **`Stremio/stremio-web`** `development`.

5. Paste the title/description above (adjust as you like).

## Licence

Upstream `stremio-web` is **GPL-2.0**. Contributions must be compatible with that licence.

## Build note

If `npm run build` fails locally with an `ajv` / `schema-utils` resolution error, try `rm -rf node_modules && npm install` or align `ajv` versions; that is often an environment/lockfile issue unrelated to these source edits.
