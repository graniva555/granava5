import { Routes, Route, Link, useParams, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { PRODUCTS, MARKETS, getProduct, getMarket } from './data.js'

// ── Shared layout: header + footer wrap every page ──
function Header() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo" aria-label="Granava — Home">
          <svg className="logo-mark" viewBox="0 0 480 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
            <text x="240" y="55" textAnchor="middle" fontFamily="'Josefin Sans','Century Gothic',Arial,sans-serif" fontSize="54" fontWeight="300" fill="#c9a96e" letterSpacing="20">GRANAVA</text>
            <line x1="18" y1="73" x2="462" y2="73" stroke="#c9a96e" strokeWidth="0.9" />
          </svg>
          <span className="logo-tagline">NATURAL GRANITE</span>
        </Link>
        <nav className="nav-links">
          <Link to="/products">Collection</Link>
          <Link to="/markets">Markets</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <Link to="/contact" className="nav-cta">Get a Quote</Link>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-logo"><b>GRANAVA</b><small>NATURAL GRANITE</small></div>
            <p className="footer-desc">Premium granite exported directly from India's finest quarries to architects, fabricators and developers worldwide.</p>
          </div>
          <div className="footer-col">
            <h4>Products</h4>
            <ul>
              {PRODUCTS.map((p) => (
                <li key={p.slug}><Link to={`/products/${p.slug}`}>{p.short}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Markets</h4>
            <ul>
              {MARKETS.map((m) => (
                <li key={m.slug}><Link to={`/markets/${m.slug}`}>{m.country}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:info@granava.in">info@granava.in</a></li>
              <li>Ongole, Andhra Pradesh</li>
              <li>India</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Granava. All rights reserved.</p>
          <p>Premium Natural Granite Exporter · India</p>
        </div>
      </div>
    </footer>
  )
}

// Scroll to top on route change
function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// ── Pages ──
function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">Direct from Indian Quarries</span>
          <h1>India's Premier<br /><em>Granite</em> Exporter<br />to the World</h1>
          <p>Four exceptional granites — Black Galaxy, Jet Black, Black Pearl &amp; Steel Gray — exported directly to architects, fabricators and developers across the UK, USA, UAE and East Asia.</p>
          <div className="hero-ctas">
            <Link to="/products" className="btn btn-gold">View Collection</Link>
            <Link to="/contact" className="btn btn-outline">Request a Quote</Link>
          </div>
        </div>
      </section>
      <Collection />
    </>
  )
}

function Collection() {
  return (
    <section className="section">
      <div className="section-head">
        <span className="eyebrow">Our Collection</span>
        <h2>Four Stones. <em>Infinite Possibilities.</em></h2>
      </div>
      <div className="grid">
        {PRODUCTS.map((p) => (
          <Link key={p.slug} to={`/products/${p.slug}`} className="card">
            <div className={`card-vis ${p.tex}`}>
              {p.img && <img src={p.img} alt={`${p.name} slab`} loading="lazy" />}
            </div>
            <div className="card-body">
              <span className="card-origin">{p.origin}</span>
              <h3>{p.name}</h3>
              <p className="card-tag">{p.tagline}</p>
              <span className="card-cta">View Specifications →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function Markets() {
  return (
    <section className="section">
      <div className="section-head">
        <span className="eyebrow">Markets We Serve</span>
        <h2>Global Reach. <em>Local Understanding.</em></h2>
      </div>
      <div className="grid">
        {MARKETS.map((m) => (
          <Link key={m.slug} to={`/markets/${m.slug}`} className="card mkt">
            <span className="mkt-flag">{m.flag}</span>
            <h3>{m.country}</h3>
            <span className="card-origin">{m.region}</span>
            <p className="card-tag">{m.tagline}</p>
            <span className="card-cta">View Market →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ProductDetail() {
  const { slug } = useParams()
  const p = getProduct(slug)
  useEffect(() => { if (p) document.title = `${p.name} — Granava` }, [p])
  if (!p) return <NotFound />
  return (
    <article className="detail">
      <nav className="breadcrumb"><Link to="/">Home</Link> › <Link to="/products">Collection</Link> › <span>{p.short}</span></nav>
      <div className="detail-grid">
        <div className={`detail-vis ${p.tex}`} aria-hidden="true" />
        <div className="detail-body">
          <span className="eyebrow">{p.origin}</span>
          <h1>{p.name}</h1>
          <p className="detail-tag">{p.tagline}</p>
          <p className="detail-desc">{p.desc}</p>
          <h4>Available Finishes</h4>
          <div className="chips">{p.finishes.map((f) => <span key={f} className="chip">{f}</span>)}</div>
          <p className="moq">Minimum order: {p.moq}</p>
          <div className="hero-ctas">
            <a className="btn btn-gold" href={`mailto:info@granava.in?subject=Sample: ${p.name}`}>Request a Sample</a>
            <a className="btn btn-outline" href={`mailto:info@granava.in?subject=Pricing: ${p.name}`}>Get Pricing</a>
          </div>
        </div>
      </div>
      <div className="related">
        <h4>Also in our collection</h4>
        <div className="related-links">
          {PRODUCTS.filter((x) => x.slug !== p.slug).map((x) => (
            <Link key={x.slug} to={`/products/${x.slug}`} className="related-link">{x.short} →</Link>
          ))}
        </div>
      </div>
    </article>
  )
}

function MarketDetail() {
  const { slug } = useParams()
  const m = getMarket(slug)
  useEffect(() => { if (m) document.title = `Granite Export to ${m.country} — Granava` }, [m])
  if (!m) return <NotFound />
  return (
    <article className="detail">
      <nav className="breadcrumb"><Link to="/">Home</Link> › <Link to="/markets">Markets</Link> › <span>{m.country}</span></nav>
      <div className="market-hero">
        <span className="mkt-flag-lg">{m.flag}</span>
        <span className="eyebrow">{m.region}</span>
        <h1>Granite Export to {m.country}</h1>
        <p className="detail-desc">{m.intro}</p>
        <div className="hero-ctas">
          <a className="btn btn-gold" href={`mailto:info@granava.in?subject=Enquiry from ${m.country}`}>Email Our Export Team</a>
          <Link to="/products" className="btn btn-outline">View Collection</Link>
        </div>
      </div>
      <div className="related">
        <h4>Other markets we serve</h4>
        <div className="related-links">
          {MARKETS.filter((x) => x.slug !== m.slug).map((x) => (
            <Link key={x.slug} to={`/markets/${x.slug}`} className="related-link">{x.country} →</Link>
          ))}
        </div>
      </div>
    </article>
  )
}

function Contact() {
  useEffect(() => { document.title = 'Contact — Granava' }, [])
  return (
    <section className="section">
      <div className="section-head">
        <span className="eyebrow">Get in Touch</span>
        <h2>Request a <em>Quote</em></h2>
      </div>
      <p className="detail-desc">Email our export team for samples, pricing, and shipping quotes.</p>
      <a className="btn btn-gold" href="mailto:info@granava.in">Email info@granava.in</a>
    </section>
  )
}

function NotFound() {
  return (
    <div className="notfound">
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-gold">← Back to Home</Link>
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Collection />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/markets/:slug" element={<MarketDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
