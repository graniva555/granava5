import { Routes, Route, Link, useParams, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { PRODUCTS, MARKETS, getProduct, getMarket } from './data.js'

function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo" aria-label="Granava — Home" onClick={() => setOpen(false)}>
          <svg className="logo-mark" viewBox="0 0 480 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
            <text x="240" y="55" textAnchor="middle" fontFamily="'Josefin Sans','Century Gothic',Arial,sans-serif" fontSize="54" fontWeight="300" fill="#c9a96e" letterSpacing="20">GRANAVA</text>
            <line x1="18" y1="73" x2="462" y2="73" stroke="#c9a96e" strokeWidth="0.9" />
          </svg>
          <span className="logo-tagline">NATURAL GRANITE</span>
        </Link>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <Link to="/products" onClick={() => setOpen(false)}>Collection</Link>
          <Link to="/markets" onClick={() => setOpen(false)}>Markets</Link>
          <Link to="/about" onClick={() => setOpen(false)}>About</Link>
          <Link to="/contact" onClick={() => setOpen(false)}>Contact</Link>
        </nav>
        <Link to="/contact" className="nav-cta">Get a Quote</Link>
        <button className="nav-burger" aria-label="Menu" onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
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
            <ul>{PRODUCTS.map((p) => <li key={p.slug}><Link to={`/products/${p.slug}`}>{p.short}</Link></li>)}</ul>
          </div>
          <div className="footer-col">
            <h4>Markets</h4>
            <ul>{MARKETS.map((m) => <li key={m.slug}><Link to={`/markets/${m.slug}`}>{m.country}</Link></li>)}</ul>
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

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Home() {
  useEffect(() => { document.title = 'Granava | Indian Granite Exporter — Black Galaxy, Jet Black & Natural Stone' }, [])
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
      <section className="band">
        <div className="band-inner">
          <div className="band-item"><b>4</b><span>Premium Granites</span></div>
          <div className="band-item"><b>20+</b><span>Years Exporting</span></div>
          <div className="band-item"><b>25+</b><span>Countries Served</span></div>
          <div className="band-item"><b>100%</b><span>Export Documentation</span></div>
        </div>
      </section>
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
            <div className={`card-vis ${p.tex}`}>{p.img && <img src={p.img} alt={`${p.name} slab`} loading="lazy" />}</div>
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
  useEffect(() => { document.title = 'Export Markets — UK, USA, UAE & East Asia | Granava' }, [])
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

function FinishSelector({ finishes }) {
  const [active, setActive] = useState(0)
  return (
    <div className="finishes">
      {finishes.map((f, i) => (
        <button key={f} type="button" className={`chip ${i === active ? 'active' : ''}`} onClick={() => setActive(i)}>{f}</button>
      ))}
    </div>
  )
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq ${open ? 'open' : ''}`}>
      <button type="button" className="faq-q" onClick={() => setOpen(!open)}>
        <span>{q}</span><span className="faq-icon">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="faq-a">{a}</p>}
    </div>
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
        <div className="detail-visual">
          <div className={`detail-vis ${p.tex}`} aria-hidden="true" />
        </div>
        <div className="detail-body">
          <span className="eyebrow">{p.origin}</span>
          <h1>{p.name}</h1>
          <p className="detail-tag">{p.tagline}</p>
          <p className="detail-desc">{p.desc}</p>
          <h4>Available Finishes</h4>
          <FinishSelector finishes={p.finishes} />
          <p className="moq">Minimum order: {p.moq}</p>
          <div className="hero-ctas">
            <a className="btn btn-gold" href={`mailto:info@granava.in?subject=Sample Request: ${p.name}`}>Request a Sample</a>
            <a className="btn btn-outline" href={`mailto:info@granava.in?subject=Pricing: ${p.name}`}>Get Pricing</a>
          </div>
        </div>
      </div>

      <section className="body-sec">
        <h2><span className="sec-num">01</span> Technical Specifications</h2>
        <div className="specs-grid">
          {p.specs.map((s) => (
            <div key={s.label} className="spec-row"><span>{s.label}</span><span>{s.value}</span></div>
          ))}
        </div>
      </section>

      <section className="body-sec">
        <h2><span className="sec-num">02</span> Common Applications</h2>
        <div className="uses-grid">
          {p.applications.map((a) => <span key={a} className="use-pill">{a}</span>)}
        </div>
      </section>

      <section className="body-sec">
        <h2><span className="sec-num">03</span> Care &amp; Maintenance</h2>
        <div className="care-list">
          {p.care.map((c, i) => (
            <div key={c.title} className="care-item">
              <div className="care-icon">{String(i + 1).padStart(2, '0')}</div>
              <div><h3>{c.title}</h3><p>{c.text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="body-sec">
        <h2><span className="sec-num">04</span> Frequently Asked Questions</h2>
        <div className="faq-list">
          {p.faqs.map((f) => <Faq key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

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
      {m.highlights.length > 0 && (
        <section className="body-sec">
          <h2><span className="sec-num">01</span> Projects &amp; Sectors</h2>
          <div className="highlight-list">
            {m.highlights.map((h, i) => (
              <div key={i} className="highlight-item"><span className="highlight-dot" />{h}</div>
            ))}
          </div>
        </section>
      )}
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

function About() {
  useEffect(() => { document.title = 'About Granava — Premium Indian Granite Exporter' }, [])
  return (
    <article className="detail">
      <nav className="breadcrumb"><Link to="/">Home</Link> › <span>About</span></nav>
      <div className="market-hero">
        <span className="eyebrow">About Granava</span>
        <h1>Stone, Sourced at the Origin</h1>
        <p className="detail-desc">Granava is a premium natural granite exporter based in Ongole, Andhra Pradesh — at the heart of India's finest granite belt. We supply Black Galaxy, Black Pearl, Steel Gray and Jet Black granite directly from source quarries to architects, fabricators and developers across the UK, USA, UAE and East Asia.</p>
        <p className="detail-desc">By working directly with quarries rather than through intermediaries, we control quality from block selection through finishing — and pass the cost advantage to our clients. Every order ships with complete export documentation.</p>
      </div>
      <section className="body-sec">
        <h2><span className="sec-num">01</span> Why Granava</h2>
        <div className="uses-grid">
          <span className="use-pill">Direct quarry sourcing</span>
          <span className="use-pill">Export-grade selection</span>
          <span className="use-pill">Full documentation</span>
          <span className="use-pill">Worldwide shipping</span>
          <span className="use-pill">Consistent quality</span>
          <span className="use-pill">Competitive pricing</span>
        </div>
      </section>
      <div className="related">
        <h4>Explore</h4>
        <div className="related-links">
          <Link to="/products" className="related-link">View Collection →</Link>
          <Link to="/markets" className="related-link">Our Markets →</Link>
          <Link to="/contact" className="related-link">Contact Us →</Link>
        </div>
      </div>
    </article>
  )
}

function Contact() {
  useEffect(() => { document.title = 'Contact Granava — Request a Quote or Samples' }, [])
  return (
    <article className="detail">
      <nav className="breadcrumb"><Link to="/">Home</Link> › <span>Contact</span></nav>
      <div className="market-hero">
        <span className="eyebrow">Get in Touch</span>
        <h1>Request a <em>Quote</em></h1>
        <p className="detail-desc">Email our export team for granite samples, pricing, and shipping quotes to your destination. We respond to all enquiries within one business day.</p>
        <div className="contact-cards">
          <a className="contact-card" href="mailto:info@granava.in">
            <span className="contact-label">Email</span>
            <span className="contact-value">info@granava.in</span>
          </a>
          <div className="contact-card">
            <span className="contact-label">Location</span>
            <span className="contact-value">Ongole, Andhra Pradesh, India</span>
          </div>
        </div>
        <div className="hero-ctas">
          <a className="btn btn-gold" href="mailto:info@granava.in?subject=Granite Enquiry">Email info@granava.in</a>
        </div>
      </div>
    </article>
  )
}

function NotFound() {
  useEffect(() => { document.title = 'Page Not Found — Granava' }, [])
  return (
    <div className="notfound">
      <div className="notfound-code">404</div>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or may have moved.</p>
      <div className="hero-ctas">
        <Link to="/" className="btn btn-gold">← Back to Home</Link>
        <Link to="/products" className="btn btn-outline">View Collection</Link>
      </div>
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
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
