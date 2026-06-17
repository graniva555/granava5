// Granava data — single source of truth.
// Add a product or market = add one object here. No new files needed.

export const PRODUCTS = [
  {
    slug: 'black-galaxy',
    name: 'Black Galaxy Granite',
    short: 'Black Galaxy',
    origin: 'Nellore, Andhra Pradesh, India',
    tex: 'tex-galaxy',
    tagline: 'The night sky, captured in stone.',
    desc: 'Quarried exclusively from the Nellore district of Andhra Pradesh, Black Galaxy is among the world\'s most recognised premium granites. Its near-black base is scattered with golden and bronze metallic flecks that intensify dramatically under light.',
    finishes: ['Polished', 'Honed', 'Flamed', 'Leathered'],
    moq: '100 sq. metres',
    img: null,
    specs: [
      { label: 'Origin', value: 'Andhra Pradesh, India' },
      { label: 'Density', value: '3.0–3.1 g/cm³' },
      { label: 'Water Absorption', value: '0.04%' },
      { label: 'Compressive Strength', value: '190–210 MPa' },
      { label: 'Flexural Strength', value: '15–18 MPa' },
      { label: 'Mohs Hardness', value: '6–7' },
      { label: 'Frost Resistance', value: 'Excellent' },
      { label: 'Available Finishes', value: '4 options' }
    ],
    applications: ['Kitchen countertops', 'Feature walls', 'Flooring', 'Bathroom vanities', 'Exterior facades', 'Monuments'],
    care: [
      { title: 'Daily Cleaning', text: 'Wipe with a soft cloth and warm water. Use a pH-neutral stone cleaner — never acidic or abrasive cleaners.' },
      { title: 'Sealing', text: 'Very low porosity, but seal every 12–18 months for kitchen worktops to guard against oil staining.' },
      { title: 'Stain Removal', text: 'Blot spills immediately. For oil stains, apply a baking-soda poultice for 24 hours, then rinse.' },
      { title: 'What to Avoid', text: 'Use trivets for hot cookware. Avoid standing water on honed finishes.' }
    ],
    faqs: [
      { q: 'What causes the golden flecks in Black Galaxy granite?', a: 'The golden-bronze flecks are bronzite, a naturally occurring magnesium-iron silicate mineral. Premium-grade Black Galaxy has fine, evenly distributed flecks.' },
      { q: 'Is Black Galaxy suitable for kitchen countertops?', a: 'Yes — with 0.04% water absorption and high heat resistance it is one of the best granites for worktops. A polished finish is recommended.' },
      { q: 'What finishes are available?', a: 'Polished, Honed, Flamed and Leathered.' },
      { q: 'What is the minimum order quantity?', a: '100 square metres, with full export documentation provided.' }
    ],
  },  {
    slug: 'black-pearl',
    name: 'Black Pearl Granite',
    short: 'Black Pearl',
    origin: 'Karnataka, India',
    tex: 'tex-pearl',
    tagline: 'Depth and lustre in pure black.',
    desc: 'Black Pearl originates from Karnataka and delivers a pure, mirror-deep black surface with a distinctive pearl-like metallic shimmer. When high-polished it achieves a reflective quality rarely surpassed by any other natural stone.',
    finishes: ['High Polish', 'Honed', 'Brushed'],
    moq: '80 sq. metres',
    img: null,
    specs: [
      { label: 'Origin', value: 'Karnataka, India' },
      { label: 'Density', value: '2.9–3.0 g/cm³' },
      { label: 'Water Absorption', value: '0.05%' },
      { label: 'Compressive Strength', value: '180–200 MPa' },
      { label: 'Flexural Strength', value: '14–17 MPa' },
      { label: 'Mohs Hardness', value: '6–7' },
      { label: 'Frost Resistance', value: 'Excellent' },
      { label: 'Available Finishes', value: '3 options' }
    ],
    applications: ['Wall cladding', 'Countertops', 'Premium flooring', 'Lift interiors', 'Retail fixtures', 'Hotel lobbies'],
    care: [
      { title: 'Daily Cleaning', text: 'Use a microfibre cloth with warm water and pH-neutral soap. Buff dry to remove fingerprints from the high-polish surface.' },
      { title: 'Sealing', text: 'Apply an impregnating sealer every 12 months to maintain reflective depth.' },
      { title: 'Stain Removal', text: 'Blot spills immediately. Use a stone-specific poultice rather than scrubbing.' },
      { title: 'What to Avoid', text: 'Never use acidic or ammonia-based cleaners — they dull the pearl sheen.' }
    ],
    faqs: [
      { q: 'What gives Black Pearl its shimmer?', a: 'Labradorite and feldspar crystals create a shifting metallic lustre — most pronounced on the high-polish finish.' },
      { q: 'Is Black Pearl the same as Black Galaxy?', a: 'No. Black Galaxy has golden flecks; Black Pearl has a uniform pearl sheen without large flecks.' },
      { q: 'Which finish best shows the pearl effect?', a: 'The High Polish finish maximises the pearl shimmer.' },
      { q: 'What is the minimum order quantity?', a: '80 square metres.' }
    ],
  },  {
    slug: 'steel-gray',
    name: 'Steel Gray Granite',
    short: 'Steel Gray',
    origin: 'Krishnagiri, Tamil Nadu, India',
    tex: 'tex-steel',
    tagline: 'Architectural sophistication in every vein.',
    desc: 'From Tamil Nadu\'s Krishnagiri district, Steel Gray is defined by its restrained palette — deep charcoal and steel-blue tones threaded with fine white and silver veining. Versatile across contemporary and classical settings.',
    finishes: ['Polished', 'Honed', 'Flamed', 'Brushed', 'Sandblasted'],
    moq: '120 sq. metres',
    img: null,
    specs: [
      { label: 'Origin', value: 'Tamil Nadu, India' },
      { label: 'Density', value: '2.6–2.8 g/cm³' },
      { label: 'Water Absorption', value: '0.08%' },
      { label: 'Compressive Strength', value: '170–190 MPa' },
      { label: 'Flexural Strength', value: '12–15 MPa' },
      { label: 'Mohs Hardness', value: '6' },
      { label: 'Frost Resistance', value: 'Excellent' },
      { label: 'Available Finishes', value: '5 options' }
    ],
    applications: ['Architectural facades', 'Commercial flooring', 'Countertops', 'Heritage restoration', 'Memorial stones', 'Landscape paving'],
    care: [
      { title: 'Daily Cleaning', text: 'Wipe with warm water and a pH-neutral cleaner. Hides watermarks and fingerprints well.' },
      { title: 'Sealing', text: 'Seal every 12–18 months, especially for exterior and high-traffic applications.' },
      { title: 'Stain Removal', text: 'Treat oil and rust marks with a stone poultice.' },
      { title: 'What to Avoid', text: 'Avoid de-icing salts on exterior paving in winter. Avoid acidic cleaners.' }
    ],
    faqs: [
      { q: 'Is Steel Gray good for outdoor use?', a: 'Yes — excellent frost resistance, and flamed or sandblasted finishes give good slip resistance for paving and cladding.' },
      { q: 'What colour is Steel Gray exactly?', a: 'Deep charcoal to steel-blue grey with fine white and silver veining — cooler and more uniform than warmer greys.' },
      { q: 'How many finishes are available?', a: 'Five — the widest range in our collection.' },
      { q: 'What is the minimum order quantity?', a: '120 square metres.' }
    ],
  },  {
    slug: 'jet-black',
    name: 'Jet Black Granite',
    short: 'Jet Black',
    origin: 'Karimnagar, Telangana, India',
    tex: 'tex-jet',
    tagline: 'Absolute darkness. Absolute elegance.',
    desc: 'Jet Black is the purest expression of natural granite — quarried from the ancient formations of Karimnagar, Telangana. It presents an almost void-like uniformity with zero visible inclusions. Mirror-polished, it reaches a depth no manufactured material can replicate.',
    finishes: ['Mirror Polish', 'Honed', 'Flamed', 'Leathered'],
    moq: '100 sq. metres',
    img: null,
    specs: [
      { label: 'Origin', value: 'Telangana, India' },
      { label: 'Density', value: '3.0–3.2 g/cm³' },
      { label: 'Water Absorption', value: '0.03%' },
      { label: 'Compressive Strength', value: '200–220 MPa' },
      { label: 'Flexural Strength', value: '16–19 MPa' },
      { label: 'Mohs Hardness', value: '6–7' },
      { label: 'Frost Resistance', value: 'Excellent' },
      { label: 'Available Finishes', value: '4 options' }
    ],
    applications: ['Feature walls', 'Kitchen countertops', 'Bathroom floors', 'Commercial lobbies', 'Luxury retail', 'Memorials'],
    care: [
      { title: 'Daily Cleaning', text: 'Clean with a microfibre cloth and pH-neutral cleaner, then buff dry — the mirror finish shows every mark.' },
      { title: 'Sealing', text: 'Seal annually to protect the pristine surface despite very low porosity.' },
      { title: 'Stain Removal', text: 'Blot any spill instantly — even water can mark the mirror finish.' },
      { title: 'What to Avoid', text: 'Never use abrasive cleaners or scouring pads — they permanently dull the mirror polish.' }
    ],
    faqs: [
      { q: 'What makes Jet Black different from other black granites?', a: 'Zero visible veining, flecks or inclusions — a completely uniform pure black, ideal where total uniformity is required.' },
      { q: 'Is Jet Black truly 100% black?', a: 'Among the most uniform black granites available; mirror-polished it reaches a depth engineered stones cannot match.' },
      { q: 'What is the best finish for Jet Black?', a: 'Mirror Polish for maximum depth; Honed for contemporary matte; Flamed and Leathered for texture.' },
      { q: 'Why is Jet Black popular for memorials?', a: 'Its flawless surface takes engraving beautifully; Japanese craftsmen value its consistency.' }
    ],
  },
]

export const MARKETS = [
  {
    slug: 'united-kingdom',
    country: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Europe',
    tagline: 'Heritage meets contemporary design.',
    intro: 'Granava has supplied premium Indian granite to the United Kingdom for over two decades — from heritage restoration in Edinburgh to luxury residential developments in London and contemporary commercial interiors across Manchester and Birmingham.',
    highlights: ['Leading UK firms specify Black Galaxy and Steel Gray for contemporary residential and commercial projects.', 'Grade I and II listed projects use our Steel Gray and Black Pearl for sympathetic stone matching.'],
  },  {
    slug: 'united-states',
    country: 'United States',
    flag: '🇺🇸',
    region: 'North America',
    tagline: 'Reliable supply at scale.',
    intro: 'The United States is one of Granava\'s largest export markets. American kitchen and bathroom fabricators, luxury hotel developers, and commercial flooring contractors across the East Coast, West Coast and Southern states rely on Granava for consistent quality and reliable shipping.',
    highlights: ['US countertop fabricators in Texas, California, Florida and New York are among our largest-volume customers.', 'Luxury chains specify Granava for lobby flooring and feature walls in Las Vegas, Miami and New York.'],
  },  {
    slug: 'uae-middle-east',
    country: 'UAE & Middle East',
    flag: '🇦🇪',
    region: 'Gulf Region',
    tagline: 'Stone for landmark projects.',
    intro: 'The UAE and wider Middle East is one of the world\'s most demanding markets for premium natural stone. Granava supplies palace and royal-residence contractors, five-star hospitality groups, and grand civic development projects across Dubai, Abu Dhabi, Qatar, Saudi Arabia and Kuwait.',
    highlights: ['Granava supplies Jet Black and Black Galaxy for royal palaces and premium government residences.', 'Leading hotel brands specify our Black Galaxy and Jet Black for lobby flooring and pool surrounds.'],
  },  {
    slug: 'east-asia',
    country: 'East Asia',
    flag: '🌏',
    region: 'Japan · Korea · Singapore',
    tagline: 'Precision for discerning markets.',
    intro: 'East Asia represents one of Granava\'s most discerning markets. Memorial craftsmen in Japan, luxury interior designers in Singapore, civic contractors in South Korea, and large-scale developers in China and Taiwan rely on Granava for stone that meets the exacting standards of this region.',
    highlights: ['Japanese stone artisans prize the uniform quality and polishability of Black Galaxy and Jet Black for memorial monuments.', 'Singapore\'s premium firms specify Granava for high-end condominiums, hotels and corporate offices.'],
  },
]

export const getProduct = (slug) => PRODUCTS.find((p) => p.slug === slug)
export const getMarket = (slug) => MARKETS.find((m) => m.slug === slug)
