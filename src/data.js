// ─────────────────────────────────────────────────────────────
// Granava data — single source of truth.
// Add a product or market = add one object here. No new files needed.
// ─────────────────────────────────────────────────────────────

export const PRODUCTS = [
  {
    slug: 'black-galaxy',
    name: 'Black Galaxy Granite',
    short: 'Black Galaxy',
    origin: 'Nellore, Andhra Pradesh, India',
    tex: 'tex-galaxy',
    tagline: 'The night sky, captured in stone.',
    desc: "Quarried exclusively from the Nellore district of Andhra Pradesh, Black Galaxy is among the world's most recognised premium granites. Its near-black base is scattered with golden and bronze metallic flecks that intensify dramatically under light.",
    finishes: ['Polished', 'Honed', 'Flamed', 'Leathered'],
    moq: '100 sq. metres',
    img: null, // set to '/images/black-galaxy.jpg' when you have a photo
  },
  {
    slug: 'black-pearl',
    name: 'Black Pearl Granite',
    short: 'Black Pearl',
    origin: 'Karnataka, India',
    tex: 'tex-pearl',
    tagline: 'Depth and lustre in pure black.',
    desc: "Black Pearl originates from Karnataka and delivers a pure, mirror-deep black surface with a distinctive pearl-like metallic shimmer. When high-polished it achieves a reflective quality rarely surpassed by any other natural stone.",
    finishes: ['High Polish', 'Honed', 'Brushed'],
    moq: '80 sq. metres',
    img: null,
  },
  {
    slug: 'steel-gray',
    name: 'Steel Gray Granite',
    short: 'Steel Gray',
    origin: 'Krishnagiri, Tamil Nadu, India',
    tex: 'tex-steel',
    tagline: 'Architectural sophistication in every vein.',
    desc: "From Tamil Nadu's Krishnagiri district, Steel Gray is defined by its restrained palette — deep charcoal and steel-blue tones threaded with fine white and silver veining. Versatile across contemporary and classical settings.",
    finishes: ['Polished', 'Honed', 'Flamed', 'Brushed', 'Sandblasted'],
    moq: '120 sq. metres',
    img: null,
  },
  {
    slug: 'jet-black',
    name: 'Jet Black Granite',
    short: 'Jet Black',
    origin: 'Karimnagar, Telangana, India',
    tex: 'tex-jet',
    tagline: 'Absolute darkness. Absolute elegance.',
    desc: "Jet Black is the purest expression of natural granite — quarried from the ancient formations of Karimnagar, Telangana. It presents an almost void-like uniformity with zero visible inclusions. Mirror-polished, it reaches a depth no manufactured material can replicate.",
    finishes: ['Mirror Polish', 'Honed', 'Flamed', 'Leathered'],
    moq: '100 sq. metres',
    img: null,
  },
]

export const MARKETS = [
  {
    slug: 'united-kingdom',
    country: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Europe',
    tagline: 'Heritage meets contemporary design.',
    intro: 'Granava has supplied premium Indian granite to the UK for over two decades — from heritage restoration in Edinburgh to luxury developments in London.',
  },
  {
    slug: 'united-states',
    country: 'United States',
    flag: '🇺🇸',
    region: 'North America',
    tagline: 'Reliable supply at scale.',
    intro: 'One of our largest markets. US kitchen fabricators, hotel developers, and commercial contractors rely on Granava for consistent quality and shipping.',
  },
  {
    slug: 'uae-middle-east',
    country: 'UAE & Middle East',
    flag: '🇦🇪',
    region: 'Gulf Region',
    tagline: 'Stone for landmark projects.',
    intro: 'Granava supplies palace contractors, five-star hospitality, and grand civic projects across Dubai, Abu Dhabi, Qatar, Saudi Arabia and Kuwait.',
  },
  {
    slug: 'east-asia',
    country: 'East Asia',
    flag: '🌏',
    region: 'Japan · Korea · Singapore',
    tagline: 'Precision for discerning markets.',
    intro: 'Memorial craftsmen in Japan, designers in Singapore, and contractors across Korea and China rely on Granava for exacting quality standards.',
  },
]

export const getProduct = (slug) => PRODUCTS.find((p) => p.slug === slug)
export const getMarket = (slug) => MARKETS.find((m) => m.slug === slug)
