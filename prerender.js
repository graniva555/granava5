// Post-build prerender: generates a real static HTML file per route with correct
// per-page <title>, <meta description>, canonical, OG tags and JSON-LD.
// The React app still hydrates on top — this just gives crawlers/social/first-paint
// fully-formed per-page HTML. Runs after `vite build` (see package.json build script).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, 'dist')
const BASE = 'https://www.granava.in'

const data = JSON.parse(readFileSync(join(__dirname, 'prerender-data.json'), 'utf8'))
const template = readFileSync(join(DIST, 'index.html'), 'utf8')

// Routes to prerender: [path, title, description, optional JSON-LD]
const routes = []

routes.push(['/products',
  'Granite Collection — Black Galaxy, Jet Black, Steel Gray | Granava',
  "Explore Granava's premium Indian granite collection: Black Galaxy, Black Pearl, Steel Gray and Jet Black. Export-grade slabs and tiles for worldwide projects."])

routes.push(['/markets',
  'Export Markets — UK, USA, UAE & East Asia | Granava Granite',
  'Granava exports premium Indian granite to the UK, USA, UAE & Middle East, and East Asia, with full documentation and worldwide logistics support.'])

routes.push(['/gallery',
  'Project Gallery | Granava Granite in Real Spaces',
  'See Granava premium Indian granite installed in real projects worldwide — Black Galaxy, Steel Gray, Jet Black and Black Pearl in kitchens, facades and floors.'])

routes.push(['/about',
  'About Granava — Premium Indian Granite Exporter',
  'Granava is a premium natural granite exporter in Ongole, Andhra Pradesh, supplying Black Galaxy and other Indian granites worldwide.'])

routes.push(['/contact',
  'Contact Granava — Request a Granite Quote or Samples',
  'Contact the Granava export team for granite samples, pricing, and shipping quotes. Premium Black Galaxy, Black Pearl, Steel Gray and Jet Black granite.'])

// Product detail pages — with Product + Breadcrumb JSON-LD
for (const p of data.products) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.desc,
    category: 'Natural Granite',
    brand: { '@type': 'Brand', name: 'Granava' },
    url: `${BASE}/products/${p.slug}/`,
  }
  const crumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Collection', item: `${BASE}/products/` },
      { '@type': 'ListItem', position: 3, name: p.name, item: `${BASE}/products/${p.slug}/` },
    ],
  }
  routes.push([`/products/${p.slug}`,
    `${p.name} | Granava`,
    p.desc,
    [ld, crumb]])
}

// Market detail pages
for (const m of data.markets) {
  const crumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Markets', item: `${BASE}/markets/` },
      { '@type': 'ListItem', position: 3, name: m.name, item: `${BASE}/markets/${m.slug}/` },
    ],
  }
  routes.push([`/markets/${m.slug}`,
    `Granite Export to ${m.name} | Granava`,
    `Granava exports premium Indian granite to ${m.name}. ${m.tagline}`,
    [crumb]])
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildHtml(route, title, desc, jsonld) {
  let html = template
  const canonical = `${BASE}${route}/`
  // Replace <title>
  html = html.replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`)
  // Replace description
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${esc(desc)}" />`)
  // Replace or add canonical
  if (/<link rel="canonical"/.test(html)) {
    html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${canonical}" />`)
  }
  // OG title/description/url
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${esc(title)}" />`)
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${esc(desc)}" />`)
  if (/<meta property="og:url"/.test(html)) {
    html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${canonical}" />`)
  }
  // Inject JSON-LD before </head>
  if (jsonld) {
    const blocks = jsonld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n  ')
    html = html.replace('</head>', `  ${blocks}\n</head>`)
  }
  return html
}

let count = 0
for (const [route, title, desc, jsonld] of routes) {
  const dir = join(DIST, route.replace(/^\//, ''))
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), buildHtml(route, title, desc, jsonld))
  count++
}

console.log(`✓ Prerendered ${count} routes with per-page SEO metadata`)
