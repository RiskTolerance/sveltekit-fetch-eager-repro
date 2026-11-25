# `ssr_fetch_eager`'s check swaps `globalThis.fetch` for each render

SvelteKit 3.4.0, async SSR on. In dev, `render_response` puts a checking wrapper in place of
`globalThis.fetch` for as long as a render runs, then restores the one it saved. So:

- another request's `fetch` made during a render (here an endpoint's) logs `ssr_fetch_eager`;
- two overlapping renders leave the first one's wrapper installed for good, and a later
  `fetch` outside any render warns.

```sh
npm install
node repro.mjs   # LOG=1 node repro.mjs also prints the server's log for each step
```

It starts `vite dev`, makes each step's requests and prints a table: whether `ssr_fetch_eager`
was logged, and whether `globalThis.fetch` is still the original (`/check`).

- `src/routes/+page.svelte`: a render that takes 2 s and never fetches.
- `src/routes/eager/+page.svelte`: a component that fetches as it renders (what the warning is for).
- `src/routes/api/+server.js`: an endpoint that fetches.
- `src/hooks.server.js` and `src/routes/check/+server.js`: whether `globalThis.fetch` was left
  wrapped.
