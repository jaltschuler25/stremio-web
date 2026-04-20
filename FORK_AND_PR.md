# Propose this change to Stremio

This tree is a **clone of [Stremio/stremio-web](https://github.com/Stremio/stremio-web)** on branch `feature/wkwebview-bundled-server-casting` with Chromecast fallback work applied.

## Why `stremio-web`

Casting is implemented in:

- `src/services/Chromecast/ChromecastTransport.js` — Google Cast Sender SDK
- `src/services/Chromecast/Chromecast.js` — service wiring

The v5 desktop shell loads this UI in **WKWebView**, where the Cast SDK does not initialise. The bundled streaming server **already** exposes `GET /casting/` and player control; this PR wires the web UI to that path when the SDK never becomes available.

## Fork and open a PR (GitHub)

1. **Fork** the upstream repo: https://github.com/Stremio/stremio-web/fork  
   (Or install [GitHub CLI](https://cli.github.com/): `brew install gh && gh auth login`, then `gh repo fork Stremio/stremio-web --remote=false`.)

2. **Add your fork as a remote** (replace `YOUR_USER`):

   ```bash
   cd /path/to/this/stremio-web-upstream
   git remote add fork https://github.com/YOUR_USER/stremio-web.git
   ```

3. **Push the branch**:

   ```bash
   git push -u fork feature/wkwebview-bundled-server-casting
   ```

4. On GitHub: **Compare & pull request** from `YOUR_USER/stremio-web` branch `feature/wkwebview-bundled-server-casting` into `Stremio/stremio-web` `development`.

5. In the PR description, link **[stremio-bugs#1316](https://github.com/Stremio/stremio-bugs/issues/1316)** and note that the large `chromecastServerShim.js` is adapted from the community **cast-bridge** reference implementation.

## Licence

Upstream `stremio-web` is **GPL-2.0**. Contributions must be compatible with that licence.

## Build note

If `npm run build` fails locally with an `ajv` / `schema-utils` resolution error, try a fresh `rm -rf node_modules && npm install` or align `ajv` versions; that is an environment/lockfile issue unrelated to this branch’s source edits.
