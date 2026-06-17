# Granava — Vite + React

A fast, modern rebuild of the Granava granite export site. The whole site is built
once (on your computer) into plain static files, so visitors download a ready-made
page instead of compiling it in their browser. This is what fixes the slow load
scores (FCP/LCP/blocking time).

## Build it (3 steps)

You need Node.js installed (https://nodejs.org — the LTS version).

```bash
npm install      # one time: downloads React + Vite
npm run build    # produces the /dist folder
```

That's it. The optimized site is now in the **`dist/`** folder. Deploy the
**contents of `dist/`** to your host.

To preview locally before deploying:
```bash
npm run dev      # opens http://localhost:5173
```

## Deploy to DigitalOcean (important: SPA routing)

This is a single-page app, so the server must send every unknown URL to
`index.html` — otherwise refreshing `/products` gives a 404.

In your DigitalOcean App Platform static site, set:
- **Build command:** `npm install && npm run build`
- **Output directory:** `dist`
- **Catchall document:** `index.html`   ← this is the SPA fix

A ready-to-paste spec is in `digitalocean-app-spec.yaml`.
(The `public/_redirects` file does the same job on Netlify and similar hosts.)

## How to add / change content

Everything lives in **`src/data.js`** — one file.
- **Add a product:** copy a product object, change the fields, give it a unique `slug`.
- **Add a market:** same, in the `MARKETS` array.
- New pages appear automatically (the routes are generated from this data).

## How to add product photos

1. Drop the image into `public/images/` (e.g. `public/images/black-galaxy.jpg`).
2. In `src/data.js`, set that product's `img` field to `'/images/black-galaxy.jpg'`.
   (It's `null` right now, which shows the CSS granite texture as a fallback.)

## File map

```
index.html              page shell + SEO meta + favicon
src/main.jsx            boots React
src/App.jsx             header, footer, all pages + routes
src/data.js             ← your content lives here
src/styles.css          design system (colors, fonts, layout)
public/                 favicon, icons, og-image, robots, sitemap (copied to dist root)
```

## Honest notes

- This starter has the core pages working (home, collection, product detail,
  markets, market detail, contact) with the real Granava design and your new
  favicon. It is intentionally lean so it's easy to grow.
- It does NOT yet include the richer detail-page content (full specs tables,
  care guides, per-product FAQs) or the EmailJS contact form from the older
  build. You can add those into `App.jsx` / `data.js` as you go.
- Because it's a single-page app, search engines see one HTML shell. For an
  exporter this is usually fine, but if you later want every product page as
  separately-rendered HTML for maximum SEO, add a prerender step
  (e.g. `vite-plugin-ssg` or `react-snap`) — ask and I can wire it in.
