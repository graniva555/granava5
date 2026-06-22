import React from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'


    const { useState, useEffect, useRef, useCallback } = React;

    // ── Routing ────────────────────────────────────────────────────────────
    function getRoute() {
      let p = (typeof window !== 'undefined' ? window.location.pathname : '/').replace(/\/+$/, '') || '/';
      return p;
    }

    /**
     * Converts any raw ID/slug to the canonical lowercase-hyphen form
     * that matches every product's `slug` field exactly.
     *
     * Defends against:
     *  • trailing/leading whitespace  ("steel-gray " → "steel-gray")
     *  • percent-encoding             ("steel%20gray" → "steel-gray")
     *  • wrong casing                 ("Steel-Gray"  → "steel-gray")
     *  • spaces instead of hyphens   ("steel gray"  → "steel-gray")
     *
     * @param {string} raw
     * @returns {string}
     */
    function normalizeSlug(raw) {
      return decodeURIComponent(raw)   // decode %XX sequences first
        .trim()                         // strip leading / trailing whitespace
        .toLowerCase()                  // force lowercase
        .replace(/\s+/g, '-')           // spaces → hyphens
        .replace(/[^a-z0-9-]/g, '');   // strip anything else
    }

    function useRoute() {
      // React Router drives the path now — no custom click handling needed.
      const location = useLocation();
      let p = location.pathname.replace(/\/+$/, '') || '/';
      return p;
    }

    // ── FadeUp wrapper (scroll-triggered) ──────────────────────────────────
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function FadeUp({ children, delay = 0, style = {}, className = '' }) {
      const ref = useRef(null);
      const [vis, setVis] = useState(prefersReducedMotion);
      useEffect(() => {
        if (prefersReducedMotion) return;
        const el = ref.current;
        if (!el) return;
        // threshold 0.04 = fires early; no negative rootMargin = no cross-section bleed
        const obs = new IntersectionObserver(([e]) => {
          if (e.isIntersecting) { setVis(true); obs.unobserve(el); }
        }, { threshold: 0.04, rootMargin: '0px 0px 0px 0px' });
        obs.observe(el);
        return () => obs.disconnect();
      }, []);
      return (
        <div ref={ref} className={className} style={{
          opacity: vis ? 1 : 0,
          /* 12px instead of 24px — much smaller shift, no section-bleed on mobile */
          transform: vis ? 'none' : 'translateY(12px)',
          /* width:100% ensures it fills its row — fixes layout gaps on scroll-back */
          width: '100%',
          /* no willChange on invisible state — avoids stacking-context interference */
          transition: prefersReducedMotion ? 'none' : `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
          ...style
        }}>
          {children}
        </div>
      );
    }

    // ── Particle Canvas ────────────────────────────────────────────────────
    // ── CountUp: animates a number from 0 when scrolled into view ──
    function CountUp({ end, suffix = '', duration = 1400 }) {
      const ref = useRef(null);
      const [val, setVal] = useState(prefersReducedMotion ? end : 0);
      useEffect(() => {
        if (prefersReducedMotion) { setVal(end); return; }
        const el = ref.current;
        if (!el) return;
        let raf, started = false;
        const obs = new IntersectionObserver(([e]) => {
          if (e.isIntersecting && !started) {
            started = true;
            const t0 = performance.now();
            const tick = (now) => {
              const p = Math.min((now - t0) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
              setVal(Math.round(eased * end));
              if (p < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
            obs.unobserve(el);
          }
        }, { threshold: 0.3 });
        obs.observe(el);
        return () => { obs.disconnect(); if (raf) cancelAnimationFrame(raf); };
      }, [end, duration]);
      return <span ref={ref}>{val}{suffix}</span>;
    }

    // ── ScrollProgress: thin gold bar showing page scroll progress ──
    function ScrollProgress() {
      const [pct, setPct] = useState(0);
      useEffect(() => {
        const onScroll = () => {
          const h = document.documentElement;
          const max = h.scrollHeight - h.clientHeight;
          setPct(max > 0 ? (h.scrollTop / max) * 100 : 0);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
      }, []);
      return <div className="scroll-progress" style={{ transform: `scaleX(${pct / 100})` }} aria-hidden="true" />;
    }

    // ── TrustMarquee: slow-scrolling premium trust strip ──
    function TrustMarquee() {
      const items = ['Direct Quarry Sourcing', 'Export-Grade Selection', 'Full Customs Documentation', 'Worldwide Shipping', 'Consistent Quality Control', '25+ Countries Served'];
      const doubled = [...items, ...items];
      return (
        <div className="trust-marquee" aria-hidden="true">
          <div className="trust-track">
            {doubled.map((t, i) => (
              <span key={i} className="trust-item">{t}<span className="trust-dot">◆</span></span>
            ))}
          </div>
        </div>
      );
    }


    function ParticleCanvas() {
      const ref = useRef(null);
      useEffect(() => {
        // Skip canvas entirely on mobile — saves GPU, battery and paint time
        if (window.matchMedia('(max-width: 768px)').matches) return;
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
        let animId;
        let pts = [];

        function resize() {
          canvas.style.willChange = 'transform';
          canvas.width = canvas.offsetWidth || window.innerWidth;
          canvas.height = canvas.offsetHeight || window.innerHeight;
          const count = window.innerWidth < 768 ? 60 : (window.innerWidth < 1200 ? 110 : 170);
          pts = Array.from({ length: count }, (_, i) => ({

            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.16,
            vy: (Math.random() - 0.5) * 0.16 - 0.035,
            r: i < 22 ? Math.random() * 1.7 + 0.9 : Math.random() * 0.65 + 0.15,
            base: i < 22 ? Math.random() * 0.75 + 0.2 : Math.random() * 0.35 + 0.05,
            ph: Math.random() * Math.PI * 2,
            spd: Math.random() * 0.013 + 0.007,
            type: Math.random() < 0.72 ? 'plat' : 'blue',
          }));
        }

        resize();
        let resizeTick = false;
        const ro = new ResizeObserver(() => {
          if (!resizeTick) {
            resizeTick = true;
            requestAnimationFrame(() => { resize(); resizeTick = false; });
          }
        });
        ro.observe(canvas.parentElement);

        function draw() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          for (const p of pts) {
            p.x += p.vx; p.y += p.vy; p.ph += p.spd;
            if (p.x < -4) p.x = canvas.width + 4;
            if (p.x > canvas.width + 4) p.x = -4;
            if (p.y < -4) p.y = canvas.height + 4;
            if (p.y > canvas.height + 4) p.y = -4;
            const a = p.base * (0.62 + 0.38 * Math.sin(p.ph));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.type === 'blue'
              ? `rgba(100,160,210,${a.toFixed(2)})`
              : `rgba(184,158,124,${a.toFixed(2)})`;
            ctx.fill();
          }
          animId = requestAnimationFrame(draw);
        }
        draw();
        // Pause animation when tab is not visible
        const onVisibility = () => {
          if (document.hidden) { cancelAnimationFrame(animId); }
          else { animId = requestAnimationFrame(draw); }
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
          cancelAnimationFrame(animId);
          ro.disconnect();
          document.removeEventListener('visibilitychange', onVisibility);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
      }, []);
      return <canvas ref={ref} className="hero-canvas" />;
    }

    // ── Navbar ─────────────────────────────────────────────────────────────
    const NAV = [
      { l: 'Home', p: '/', f: '/' }, { l: 'Products', p: '/products', f: '/products' },
      { l: 'Markets', p: '/markets', f: '/markets' }, { l: 'About', p: '/about', f: '/about' },
      { l: 'Contact', p: '/contact', f: '/contact' },
    ];

    function Navbar({ route }) {
      const [scrolled, setScrolled] = useState(false);
      const [open, setOpen]         = useState(false);

      /* ── Scroll detection (rAF-debounced) ──────────────────── */
      useEffect(() => {
        let ticking = false;
        const onScroll = () => {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
              setScrolled(window.scrollY > 24);
              ticking = false;
            });
          }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
      }, []);

      /* ── Close on route change ──────────────────────────────── */
      useEffect(() => { setOpen(false); }, [route]);

      /* ── Escape key closes overlay ──────────────────────────── */
      useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
      }, []);

      /* ── Body scroll lock when overlay is open ──────────────── */
      useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
      }, [open]);

      const close = () => setOpen(false);

      return (
        <>
          {/* ── Topbar ─────────────────────────────────────────── */}
          <nav className={`navbar${scrolled ? ' scrolled' : ''}`}
               role="navigation" aria-label="Main navigation">
            <div className="navbar-inner">

              {/* Logo */}
              <Link to="/" className="navbar-logo" aria-label="Granava — Home">
                <svg className="navbar-logo-mark" viewBox="0 0 803.7 133.6" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GRANAVA" focusable="false">
                  <defs><linearGradient id="navRuleFade" gradientUnits="userSpaceOnUse" x1="7.1" y1="130.0" x2="791.7" y2="130.0"><stop offset="0" stop-color="#c9a96e" stop-opacity="0"/><stop offset="0.16" stop-color="#c9a96e" stop-opacity="1"/><stop offset="0.84" stop-color="#c9a96e" stop-opacity="1"/><stop offset="1" stop-color="#c9a96e" stop-opacity="0"/></linearGradient></defs><path d="M670.4982940569705 61.99904784575101Q654.998095691502 48.99912719193843 628.2481948742363 36.49928588431326Q601.4982940569705 23.99944457668809 568.7485916051733 13.999603269062922Q535.9988891533761 3.999761961437753 501.749186701579 -2.0001190192811236Q467.4994842497818 -8 436.99976196143774 -8Q350 -8 280.25017852892165 19.000039673093706Q210.50035705784336 46.00007934618741 161.0004760771245 94.00011901928113Q111.50059509640562 142.00015869237484 85.25065460604618 206.75013885582797Q59.00071411568674 271.5001190192811 59.00071411568674 347.5000396730937Q59.00071411568674 438.49924621121954 88.50063476949933 509.7489883361105Q118.00055542331191 580.9987304610014 169.25045624057765 630.4987304610014Q220.50035705784336 679.9987304610014 287.7502578751091 705.4988494802825Q355.00015869237484 730.9989684995636 429.5001190192811 730.9989684995636Q492.9995239228755 730.9989684995636 547.2491470284853 716.2490280092042Q601.498770134095 701.4990875188447 641.9987304610014 677.999047845751L609.4998809807189 588.5026580972784Q588.9996826152503 600.5028167896533 559.4997222883441 610.7528366262002Q529.9997619614378 621.002856462747 499.2497817979846 627.2528366262002Q468.4998016345315 633.5028167896533 441.4995635959692 633.5028167896533Q377.49924621121954 633.5028167896533 325.498770134095 614.00245973181Q273.49829405697056 594.5021026739665 236.24783781639292 558.0015869237484Q198.9973815758153 521.5010711735301 178.99706419106565 470.25053558676507Q158.99674680631597 419 158.99674680631597 355.49964294215664Q158.99674680631597 296.4990875188447 179.24692533523765 247.49849242243909Q199.49710386415933 198.4978973260335 236.49746092200272 162.74736173926843Q273.4978179798461 126.99682615250337 324.7483535666112 107.74648893120685Q375.9988891533762 88.49615170991034 438.4995635959692 88.49615170991034Q475 88.49615170991034 511.00079346187414 95.74636991192574Q547.0015869237483 102.99658811394113 572.5021820201539 117.49694517178449V260.5012298659049H429.00087280806156V353.9975402681901H670.4982940569705Z" transform="translate(0.00,98.76) scale(0.12000,-0.12000)" fill="currentColor"/><path d="M296.49829405697056 722.9989684995636Q350.997143537253 722.9989684995636 397.74656827739426 708.4992065381259Q444.4959930175355 693.9994445766881 478.9958343251607 665.4997619614378Q513.4956756327858 637.0000793461874 532.9957153058796 595.2503768943902Q552.4957549789733 553.500674442593 552.4957549789733 498.5008331349679Q552.4957549789733 456.0010315004364 539.7458144886139 414.7513290486392Q526.9958739982544 373.501626596842 498.2460128540824 340.00190430849796Q469.49615170991035 306.50218202015395 422.9964294215663 286.25236054907566Q376.49670713322223 266.0025390779973 307.997143537253 266.0025390779973H200.9969054986908V0H104.00071411568675V722.9989684995636ZM305.99706419106565 359.4988494802825Q348.9978576529398 359.4988494802825 377.498373403158 372.49900817265734Q405.9988891533762 385.4991668650321 422.249186701579 405.9994445766881Q438.4994842497818 426.49972228834406 445.49960326906296 450.0001190192811Q452.49972228834406 473.5005157502182 452.49972228834406 495.000952154249Q452.49972228834406 517.0017456161231 444.9994049035944 540.2521225105133Q437.4990875188447 563.5024994049036 420.9986511148139 583.7525985876379Q404.49821471078315 604.0026977703722 377.74787748948665 616.7526779338252Q350.9975402681901 629.5026580972784 312.9975402681901 629.5026580972784H200.9969054986908V359.4988494802825ZM424.99571530587957 303.5015472506546 614.4963104022852 0H501.50075378878046L309.50027771165594 301.00166626993575Z" transform="translate(121.32,98.76) scale(0.12000,-0.12000)" fill="currentColor"/><path d="M31.501547250654603 0 347.50027771165594 752.999047845751H353.5001190192811L669.4988494802825 0H558.0033325398715L321.50138855827976 600.5049591367135L390.9985717686265 646.002856462747L127.49781797984608 0Z" transform="translate(231.60,98.76) scale(0.12000,-0.12000)" fill="currentColor"/><path d="M730.4981353645958 -23.4994842497818 171.4980560184083 544.0055542331191 199.49686582559707 537.0069031183052 201.49678647940965 0H104.00071411568675V744.9984130762517H108.50059509640562L661.5011505197175 175.99309688169484L639.001904308498 180.9923827660081L637.0019836546854 722.9989684995636H733.4980560184083V-23.4994842497818Z" transform="translate(346.92,98.76) scale(0.12000,-0.12000)" fill="currentColor"/><path d="M31.501547250654603 0 347.50027771165594 752.999047845751H353.5001190192811L669.4988494802825 0H558.0033325398715L321.50138855827976 600.5049591367135L390.9985717686265 646.002856462747L127.49781797984608 0Z" transform="translate(478.56,98.76) scale(0.12000,-0.12000)" fill="currentColor"/><path d="M155.99603269062922 722.9989684995636 394.49789732603347 125.49361263191304 339.00015869237484 135.99309688169484 564.502578751091 722.9989684995636H678.497976672221L359.49932555740696 -33.49996032690629L40.50067444259303 722.9989684995636Z" transform="translate(593.88,98.76) scale(0.12000,-0.12000)" fill="currentColor"/><path d="M31.501547250654603 0 347.50027771165594 752.999047845751H353.5001190192811L669.4988494802825 0H558.0033325398715L321.50138855827976 600.5049591367135L390.9985717686265 646.002856462747L127.49781797984608 0Z" transform="translate(711.36,98.76) scale(0.12000,-0.12000)" fill="currentColor"/><line x1="7.1" y1="130.0" x2="791.7" y2="130.0" stroke="url(#navRuleFade)" stroke-width="1.68"/>
                </svg>
                <span className="navbar-tagline">NATURAL GRANITE</span>
              </Link>

              {/* Desktop links */}
              <ul className="navbar-links" role="list">
                {NAV.map(n => (
                  <li key={n.p}>
                    <Link to={n.f} className={route === n.p ? 'active' : ''}>{n.l}</Link>
                  </li>
                ))}
              </ul>

              {/* Desktop CTA */}
              <Link to="/contact" className="btn-gold navbar-cta">Get a Quote</Link>

              {/* Hamburger — mobile only */}
              <button
                className={`nav-burger${open ? ' is-open' : ''}`}
                onClick={() => setOpen(v => !v)}
                aria-label={open ? 'Close navigation' : 'Open navigation'}
                aria-expanded={open}
                aria-controls="mobile-nav-overlay"
              >
                <span className="burger-bar" aria-hidden="true" />
                <span className="burger-bar" aria-hidden="true" />
                <span className="burger-bar" aria-hidden="true" />
              </button>
            </div>
          </nav>

          {/* ── Full-screen glassmorphism overlay ─────────────── */}
          <div
            id="mobile-nav-overlay"
            className={`nav-overlay${open ? ' is-open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            aria-hidden={!open}
          >
            {/* Brand in overlay */}
            <div className="nav-ov-brand">
              <span className="nav-ov-wordmark">GRANAVA</span>
              <span className="nav-ov-tagline">Natural Granite</span>
            </div>

            {/* Staggered nav links */}
            <nav className="nav-ov-links" aria-label="Site pages">
              {NAV.map((n, i) => (
                <Link
                  key={n.p}
                  to={n.f}
                  className={`nav-ov-link${route === n.p ? ' is-active' : ''}`}
                  onClick={close}
                  tabIndex={open ? 0 : -1}
                >
                  <span className="nav-ov-num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="nav-ov-label">{n.l}</span>
                  <span className="nav-ov-arrow" aria-hidden="true">→</span>
                </Link>
              ))}
            </nav>

            {/* Bottom: CTA + contact */}
            <div className="nav-ov-bottom">
              <Link to="/contact" className="nav-ov-cta" onClick={close}
                 tabIndex={open ? 0 : -1}>
                Get a Quote →
              </Link>
              <div className="nav-ov-contact">
                <a href="mailto:info@granava.in" tabIndex={open ? 0 : -1}>
                  info@granava.in
                </a>
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)' }}>
                  Ongole, Andhra Pradesh
                </span>
              </div>
            </div>
          </div>
        </>
      );
    }

    // ── Footer ─────────────────────────────────────────────────────────────
    function Footer() {
      const currentYear = new Date().getFullYear();
      return (
        <footer className="footer">
          <div className="container">
            
            {/* ── DESKTOP FOOTER (hidden on mobile) ── */}
            <div className="footer-desktop">
            <div className="footer-grid">
              <div className="footer-col">
                <div style={{ marginBottom:20 }}>
                  <svg viewBox="0 0 803.7 133.6" width="184" height="31" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Granava" focusable="false" style={{ color: 'var(--gold)' }}>
                    <defs><linearGradient id="navRuleFadeF" gradientUnits="userSpaceOnUse" x1="7.1" y1="130.0" x2="791.7" y2="130.0"><stop offset="0" stop-color="#c9a96e" stop-opacity="0"/><stop offset="0.16" stop-color="#c9a96e" stop-opacity="1"/><stop offset="0.84" stop-color="#c9a96e" stop-opacity="1"/><stop offset="1" stop-color="#c9a96e" stop-opacity="0"/></linearGradient></defs><path d="M670.4982940569705 61.99904784575101Q654.998095691502 48.99912719193843 628.2481948742363 36.49928588431326Q601.4982940569705 23.99944457668809 568.7485916051733 13.999603269062922Q535.9988891533761 3.999761961437753 501.749186701579 -2.0001190192811236Q467.4994842497818 -8 436.99976196143774 -8Q350 -8 280.25017852892165 19.000039673093706Q210.50035705784336 46.00007934618741 161.0004760771245 94.00011901928113Q111.50059509640562 142.00015869237484 85.25065460604618 206.75013885582797Q59.00071411568674 271.5001190192811 59.00071411568674 347.5000396730937Q59.00071411568674 438.49924621121954 88.50063476949933 509.7489883361105Q118.00055542331191 580.9987304610014 169.25045624057765 630.4987304610014Q220.50035705784336 679.9987304610014 287.7502578751091 705.4988494802825Q355.00015869237484 730.9989684995636 429.5001190192811 730.9989684995636Q492.9995239228755 730.9989684995636 547.2491470284853 716.2490280092042Q601.498770134095 701.4990875188447 641.9987304610014 677.999047845751L609.4998809807189 588.5026580972784Q588.9996826152503 600.5028167896533 559.4997222883441 610.7528366262002Q529.9997619614378 621.002856462747 499.2497817979846 627.2528366262002Q468.4998016345315 633.5028167896533 441.4995635959692 633.5028167896533Q377.49924621121954 633.5028167896533 325.498770134095 614.00245973181Q273.49829405697056 594.5021026739665 236.24783781639292 558.0015869237484Q198.9973815758153 521.5010711735301 178.99706419106565 470.25053558676507Q158.99674680631597 419 158.99674680631597 355.49964294215664Q158.99674680631597 296.4990875188447 179.24692533523765 247.49849242243909Q199.49710386415933 198.4978973260335 236.49746092200272 162.74736173926843Q273.4978179798461 126.99682615250337 324.7483535666112 107.74648893120685Q375.9988891533762 88.49615170991034 438.4995635959692 88.49615170991034Q475 88.49615170991034 511.00079346187414 95.74636991192574Q547.0015869237483 102.99658811394113 572.5021820201539 117.49694517178449V260.5012298659049H429.00087280806156V353.9975402681901H670.4982940569705Z" transform="translate(0.00,98.76) scale(0.12000,-0.12000)" fill="currentColor"/><path d="M296.49829405697056 722.9989684995636Q350.997143537253 722.9989684995636 397.74656827739426 708.4992065381259Q444.4959930175355 693.9994445766881 478.9958343251607 665.4997619614378Q513.4956756327858 637.0000793461874 532.9957153058796 595.2503768943902Q552.4957549789733 553.500674442593 552.4957549789733 498.5008331349679Q552.4957549789733 456.0010315004364 539.7458144886139 414.7513290486392Q526.9958739982544 373.501626596842 498.2460128540824 340.00190430849796Q469.49615170991035 306.50218202015395 422.9964294215663 286.25236054907566Q376.49670713322223 266.0025390779973 307.997143537253 266.0025390779973H200.9969054986908V0H104.00071411568675V722.9989684995636ZM305.99706419106565 359.4988494802825Q348.9978576529398 359.4988494802825 377.498373403158 372.49900817265734Q405.9988891533762 385.4991668650321 422.249186701579 405.9994445766881Q438.4994842497818 426.49972228834406 445.49960326906296 450.0001190192811Q452.49972228834406 473.5005157502182 452.49972228834406 495.000952154249Q452.49972228834406 517.0017456161231 444.9994049035944 540.2521225105133Q437.4990875188447 563.5024994049036 420.9986511148139 583.7525985876379Q404.49821471078315 604.0026977703722 377.74787748948665 616.7526779338252Q350.9975402681901 629.5026580972784 312.9975402681901 629.5026580972784H200.9969054986908V359.4988494802825ZM424.99571530587957 303.5015472506546 614.4963104022852 0H501.50075378878046L309.50027771165594 301.00166626993575Z" transform="translate(121.32,98.76) scale(0.12000,-0.12000)" fill="currentColor"/><path d="M31.501547250654603 0 347.50027771165594 752.999047845751H353.5001190192811L669.4988494802825 0H558.0033325398715L321.50138855827976 600.5049591367135L390.9985717686265 646.002856462747L127.49781797984608 0Z" transform="translate(231.60,98.76) scale(0.12000,-0.12000)" fill="currentColor"/><path d="M730.4981353645958 -23.4994842497818 171.4980560184083 544.0055542331191 199.49686582559707 537.0069031183052 201.49678647940965 0H104.00071411568675V744.9984130762517H108.50059509640562L661.5011505197175 175.99309688169484L639.001904308498 180.9923827660081L637.0019836546854 722.9989684995636H733.4980560184083V-23.4994842497818Z" transform="translate(346.92,98.76) scale(0.12000,-0.12000)" fill="currentColor"/><path d="M31.501547250654603 0 347.50027771165594 752.999047845751H353.5001190192811L669.4988494802825 0H558.0033325398715L321.50138855827976 600.5049591367135L390.9985717686265 646.002856462747L127.49781797984608 0Z" transform="translate(478.56,98.76) scale(0.12000,-0.12000)" fill="currentColor"/><path d="M155.99603269062922 722.9989684995636 394.49789732603347 125.49361263191304 339.00015869237484 135.99309688169484 564.502578751091 722.9989684995636H678.497976672221L359.49932555740696 -33.49996032690629L40.50067444259303 722.9989684995636Z" transform="translate(593.88,98.76) scale(0.12000,-0.12000)" fill="currentColor"/><path d="M31.501547250654603 0 347.50027771165594 752.999047845751H353.5001190192811L669.4988494802825 0H558.0033325398715L321.50138855827976 600.5049591367135L390.9985717686265 646.002856462747L127.49781797984608 0Z" transform="translate(711.36,98.76) scale(0.12000,-0.12000)" fill="currentColor"/><line x1="7.1" y1="130.0" x2="791.7" y2="130.0" stroke="url(#navRuleFadeF)" stroke-width="1.68"/>
                  </svg>
                  <span style={{ display:'block', fontFamily:"'Josefin Sans',sans-serif", fontSize:'10px', letterSpacing:'0.34em', color:'var(--gold)', textTransform:'uppercase', marginTop:'6px', paddingLeft:'3px' }}>Natural Granite</span>
                </div>
                <p style={{ maxWidth: 260 }}>
                  Premium natural granite sourced directly from India's finest quarries, exported to
                  architects and developers worldwide.
                </p>
                <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                  <Link to="/contact" className="btn-gold" style={{ fontSize: 11, padding: '9px 18px' }}>Contact Us</Link>
                </div>
              </div>
              <div className="footer-col">
                <h4>Quick Links</h4>
                <ul>{NAV.map(n => <li key={n.p}><Link to={n.f}>{n.l}</Link></li>)}</ul>
              </div>
              <div className="footer-col">
                <h4>Products</h4>
                <ul>
                  <li><Link to="/products">Black Galaxy Granite</Link></li>
                  <li><Link to="/products">Black Pearl Granite</Link></li>
                  <li><Link to="/products">Steel Gray Granite</Link></li>
                  <li><Link to="/products">Jet Black Granite</Link></li>
                  <li><Link to="/contact">Request Sample</Link></li>
                  <li><Link to="/contact">Get Pricing</Link></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Contact</h4>
                <p>📍 Ongole, Andhra Pradesh, India</p>
                <p>📧 info@granava.in</p>
                <p>📞 +91 00000 00000</p>
                <p style={{ marginTop: 14, fontSize: 12, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  Mon–Fri 9 AM – 6 PM IST<br />Saturday 9 AM – 2 PM IST
                </p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© {currentYear} Granava. All rights reserved.</p>
              <p>Premium Natural Granite Exporter · India</p>
            </div>
            </div>{/* /footer-desktop */}

            {/* ── MOBILE FOOTER — compact accordion layout ── */}
            <div className="footer-mobile">

              {/* Brand block */}
              <div className="fm-brand">
                <span className="fm-brand-name">GRANAVA</span>
                <span className="fm-brand-tag">Natural Granite</span>
                <p>Premium granite exported directly from India's finest quarries to the world.</p>
                <Link to="/contact" className="btn-gold">Get a Quote →</Link>
              </div>

              {/* Contact strip */}
              <div className="fm-contact">
                <div className="fm-contact-item">
                  <span>Email</span>
                  <a href="mailto:info@granava.in">info@granava.in</a>
                </div>
                <div className="fm-contact-item">
                  <span>Origin</span>
                  Andhra Pradesh, India
                </div>
                <div className="fm-contact-item">
                  <span>Markets</span>
                  UK · US · UAE
                </div>
              </div>

              {/* Accordion sections */}
              <div className="fm-accordion">
                <details>
                  <summary>Quick Links</summary>
                  <ul>
                    {NAV.map(n => (
                      <li key={n.p}><Link to={n.f}>{n.l}</Link></li>
                    ))}
                  </ul>
                </details>
                <details>
                  <summary>Our Products</summary>
                  <ul>
                    <li><Link to="/products">Black Galaxy Granite</Link></li>
                    <li><Link to="/products">Black Pearl Granite</Link></li>
                    <li><Link to="/products">Steel Gray Granite</Link></li>
                    <li><Link to="/products">Jet Black Granite</Link></li>
                    <li><Link to="/contact">Request a Sample</Link></li>
                  </ul>
                </details>
              </div>

              {/* Copyright */}
              <div className="fm-copyright">
                <p>© {currentYear} Granava. All rights reserved.</p>
                <p>Premium Natural Granite Exporter · India</p>
              </div>

            </div>{/* /footer-mobile */}

          </div>
        </footer>
      );
    }

    // ── HOME PAGE ──────────────────────────────────────────────────────────
    const HOME_PRODS = [
      {
        num: '01', slug: 'black-galaxy', name: 'Black Galaxy', type: 'Granite',
        cls: 'granite-galaxy', img: null,
        origin: 'Nellore, Andhra Pradesh',
        desc: 'Deep black with golden bronze metallic flecks — the night sky, captured in stone. Among the world\'s most sought-after premium dark granites.',
        finishes: ['Polished', 'Honed', 'Flamed', 'Leathered'],
      },
      {
        num: '02', slug: 'black-pearl',  name: 'Black Pearl', type: 'Granite',
        cls: 'granite-pearl', img: null,
        origin: 'Karnataka, India',
        desc: 'Jet black with a pearl-like metallic lustre. When high-polished, it achieves a mirror depth unmatched by any other natural stone.',
        finishes: ['High Polish', 'Honed', 'Brushed'],
      },
      {
        num: '03', slug: 'steel-gray',   name: 'Steel Gray', type: 'Granite',
        cls: 'granite-steel', img: null,
        origin: 'Krishnagiri, Tamil Nadu',
        desc: 'Sophisticated charcoal-gray with fine silver veining. Architecturally versatile — equally at home in minimal interiors and heritage restoration.',
        finishes: ['Polished', 'Honed', 'Flamed', 'Brushed'],
      },
      {
        num: '04', slug: 'jet-black',    name: 'Jet Black', type: 'Granite',
        cls: 'granite-jet', img: null,
        origin: 'Karimnagar, Telangana',
        desc: 'Absolute, uniform black with a mirror-like depth unlike any other stone. Zero visible inclusions — pure velvety darkness that commands every space it touches.',
        finishes: ['Mirror Polish', 'Honed', 'Flamed', 'Leathered'],
      },
    ];

    const FEATURES = [
      { icon: '◈', t: 'Premium Grade', d: 'Only first-quality A-grade slabs with zero tolerance for surface defects, inconsistent colouring, or structural irregularities.' },
      { icon: '◉', t: 'Global Shipping', d: 'Full export documentation, sea freight coordination, and delivery to 25+ countries with professional customs clearance support.' },
      { icon: '◧', t: 'Custom Sizes', d: 'Cut-to-specification service for any project requirement — from precision mosaic tiles to monumental slab installations.' },
      { icon: '◈', t: 'Direct from Source', d: 'Quarry-to-customer supply chain based in Andhra Pradesh, the origin of the world\'s finest Black Galaxy granite.' },
    ];

    const HOME_MARKETS = [
      {
        num: '01', country: 'United Kingdom', region: 'Europe', slug: 'united-kingdom', page: '/markets/united-kingdom/', slug: 'united-kingdom',
        highlight: false,
        desc: 'Heritage restoration specialists and luxury residential developers across England, Scotland, and Wales.',
        buyers: ['Architects', 'Heritage Specialists', 'Stone Fabricators', 'Luxury Developers'],
      },
      {
        num: '02', country: 'United States', region: 'North America', slug: 'united-states', page: '/markets/united-states/', slug: 'united-states',
        highlight: false,
        desc: 'Kitchen and bathroom fabricators, commercial flooring contractors, and luxury hotel developers coast to coast.',
        buyers: ['Kitchen Fabricators', 'Hotel Developers', 'Commercial Contractors'],
      },
      {
        num: '03', country: 'UAE & Middle East', region: 'Gulf Region', slug: 'uae-middle-east', page: '/markets/uae-middle-east/', slug: 'uae-middle-east',
        highlight: false,
        desc: 'Palace contractors, five-star hospitality groups, and grand civic development projects across the region.',
        buyers: ['Palace Contractors', 'Hospitality Groups', 'Civic Developers'],
      },
      {
        num: '04', country: 'East Asia', region: 'Japan · Korea · Singapore', slug: 'east-asia', page: '/markets/east-asia/', slug: 'east-asia',
        highlight: false,
        desc: 'Memorial craftsmen, luxury interior designers, and civic construction across Japan, South Korea, China, and Singapore.',
        buyers: ['Memorial Craftsmen', 'Interior Designers', 'Civic Construction'],
      },
    ];

    function HomePage() {
      useEffect(() => {
        document.title = 'Granava | Indian Granite Exporter — Black Galaxy, Jet Black & Natural Stone';
        setMeta('Export-grade Black Galaxy, Jet Black, Black Pearl & Steel Gray granite from India. Trusted granite supplier for architects & fabricators in UK, USA, UAE & East Asia.');
      }, []);
      return (
        <div>
          {/* Hero */}
          <section className="hero" aria-label="Hero — Granava Granite Export">
            <ParticleCanvas />
            <div className="hero-grid-overlay" />
            <div className="hero-overlay" />
            <div className="hero-content">
              <div style={{ maxWidth: 640 }}>
                <div className="h-fade d1" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                  <span className="eyebrow">Direct from Indian Quarries</span>
                  <span style={{ display: 'block', width: 48, height: 1, background: 'var(--gold)' }} />
                  <span className="eyebrow" style={{ color: 'var(--muted)' }}>Andhra Pradesh, India</span>
                </div>
                <h1 className="display-xl h-fade d2" style={{ marginBottom: 28 }}>
                  India's Premier<br />
                  <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Granite</em> Exporter<br />
                  to the World
                </h1>
                <p className="h-fade d3" style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 520, marginBottom: 40, lineHeight: 1.75 }}>
                  Four exceptional granites — Black Galaxy, Jet Black, Black Pearl &amp; Steel Gray —
                  quarried in India and exported directly to architects, fabricators and developers
                  across the UK, USA, UAE and East Asia.
                </p>
                <div className="h-fade d4 hero-cta-row">
                  <Link to="/products" className="btn-gold">Explore Collection →</Link>
                  <Link to="/contact" className="btn-outline">Request a Quote</Link>
                </div>
                <div className="hero-stats h-fade d5">
                  <div className="hero-stat">
                    <span className="hero-stat-num"><CountUp end={4} /></span>
                    <span className="hero-stat-label">Continents</span>
                  </div>
                  <div className="hero-stat-div"/>
                  <div className="hero-stat">
                    <span className="hero-stat-num"><CountUp end={4} /></span>
                    <span className="hero-stat-label">Granite Varieties</span>
                  </div>
                  <div className="hero-stat-div"/>
                  <div className="hero-stat">
                    <span className="hero-stat-num"><CountUp end={20} suffix="+" /></span>
                    <span className="hero-stat-label">Years of Export</span>
                  </div>
                  <div className="hero-stat-div"/>
                  <div className="hero-stat">
                    <span className="hero-stat-num">UK · US · UAE</span>
                    <span className="hero-stat-label">Key Markets</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-bottom-line" />
          </section>

          <TrustMarquee />


          {/* Our Collection — editorial stone gallery */}
          <section className="section-sm" style={{ background: 'var(--bg)', paddingBottom: 0 }}>
            <div className="container" style={{ paddingBottom: 48 }}>
              <FadeUp>
                <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
                  <div>
                    <span className="eyebrow">Our Collection</span>
                    <h2 className="display-md" style={{ marginTop:10, marginBottom:0 }}>Three Stones.</h2>
                    <h2 className="display-md" style={{ color:'var(--gold)', marginBottom:0, fontStyle:'italic' }}>Infinite Possibilities.</h2>
                  </div>
                  <Link to="/products" className="catalogue-link" style={{
                    fontFamily:'var(--font-sans)', fontSize:11, fontWeight:600,
                    letterSpacing:'0.14em', textTransform:'uppercase',
                    color:'var(--muted)', borderBottom:'1px solid var(--border)',
                    paddingBottom:2, whiteSpace:'nowrap',
                    transition:'color 0.2s, border-color 0.2s',
                  }}>View Full Catalogue →</Link>
                </div>
              </FadeUp>
            </div>

            {/* Stone grid — full bleed, 1px-gap editorial layout */}
            <FadeUp delay={100}>
              <div className="stone-grid">
                {HOME_PRODS.map((p, i) => (
                  <Link
                    key={p.slug}
                    to={`/products/${p.slug}/`}
                    className="stone-card"
                    data-product-id={p.slug}
                  >
                    {/* Visual panel */}
                    <div className="stone-vis">
                      {p.img
                        ? <img src={p.img} alt={p.name} loading="lazy" decoding="async" className="stone-vis-tex" style={{objectFit:'cover'}} />
                        : <div className={`stone-vis-tex ${p.cls}`} />
                      }
                      <div className="stone-vis-fade" />
                      <div className="stone-vis-label">
                        <span className="stone-vis-num">{p.num} — {p.type}</span>
                        <span className="stone-vis-name">{p.name}</span>
                      </div>
                    </div>

                    {/* Content panel */}
                    <div className="stone-body">
                      <div className="stone-meta">
                        <span className="stone-origin">{p.origin}</span>
                        <span className="stone-type-pill">{p.type}</span>
                      </div>
                      <p className="stone-desc">{p.desc}</p>
                      <div className="stone-finishes">
                        {p.finishes.map(f => (
                          <span key={f} className="stone-finish">{f}</span>
                        ))}
                      </div>
                      <span className="stone-cta">
                        View Specifications <span className="stone-cta-arrow">→</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </FadeUp>
          </section>

          {/* Why Choose Us */}
          <section className="section">
            <div className="container">
              <FadeUp style={{ textAlign: 'center', marginBottom: 56 }}>
                <span className="eyebrow">Why Choose Us</span>
                <h2 className="display-md" style={{ marginTop: 10 }}>Built on Quality.<br />Trusted Globally.</h2>
              </FadeUp>
              <div className="feature-grid">
                {FEATURES.map((f, i) => (
                  <FadeUp key={f.t} delay={i * 75}>
                    <div className="feature-item">
                      <div className="feature-icon">{f.icon}</div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', marginBottom: 12 }}>{f.t}</h3>
                      <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.72 }}>{f.d}</p>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

          {/* Markets We Serve — horizontal editorial list */}
          <section className="section" style={{ background: 'var(--surface)' }}>
            <div className="container">
              <FadeUp>
                <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:56 }}>
                  <div>
                    <span className="eyebrow">Markets We Serve</span>
                    <h2 className="display-md" style={{ marginTop:10, marginBottom:0 }}>
                      Global Reach.<br />
                      <em style={{ fontStyle:'italic', color:'var(--gold)' }}>Local Understanding.</em>
                    </h2>
                  </div>
                  <Link to="/markets" style={{
                    fontFamily:'var(--font-sans)', fontSize:11, fontWeight:600,
                    letterSpacing:'0.14em', textTransform:'uppercase',
                    color:'var(--muted)', borderBottom:'1px solid var(--border)',
                    paddingBottom:2, whiteSpace:'nowrap',
                    transition:'color 0.2s, border-color 0.2s',
                  }}>All Markets →</Link>
                </div>
              </FadeUp>

              {/* Editorial row list */}
              <div className="mkt-list">
                {HOME_MARKETS.map((m, i) => (
                  <FadeUp key={m.country} delay={i * 70}>
                    <Link to={m.page} className="mkt-row">
                      {/* 01 number */}
                      <span className="mkt-num">{m.num}</span>

                      {/* Country name block */}
                      <div className="mkt-name-block">
                        <span className="mkt-region">{m.region}</span>
                        <span className="mkt-country">{m.country}</span>
                      </div>

                      {/* Buyer profile tags */}
                      <div className="mkt-buyers-block">
                        <span className="mkt-buyers-label">Key Buyers</span>
                        <div className="mkt-buyer-tags">
                          {m.buyers.map(b => (
                            <span key={b} className="mkt-buyer-tag">{b}</span>
                          ))}
                        </div>
                      </div>

                      {/* Arrow */}
                      <span className="mkt-arrow">→</span>
                    </Link>
                  </FadeUp>
                ))}
              </div>

              {/* Stat strip under markets list */}
              <FadeUp delay={300}>
                <div className="mkt-stat-strip">
                  {[
                    { n:'4', l:'Export Markets', gold:true },
                    { n:'25+', l:'Countries Served', gold:false },
                    { n:'UK · US · UAE · Asia', l:'Primary Regions', gold:false },
                    { n:'24h', l:'Quote Response', gold:false },
                  ].map((s, i, arr) => (
                    <div key={s.l} className="mkt-stat-item" style={{
                      borderRight: i < arr.length-1 ? '1px solid var(--border)' : 'none',
                      background: s.gold ? 'rgba(201,169,110,0.05)' : 'transparent',
                    }}>
                      <div style={{ fontFamily:'var(--font-serif)', fontSize:'1.55rem', fontWeight:500, color:'var(--text)', lineHeight:1, marginBottom:6 }}>{s.n}</div>
                      <div style={{ fontSize:'9.5px', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--muted)' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>
          </section>

          {/* CTA */}
          <section className="section-sm">
            <div className="container">
              <FadeUp>
                <div className="cta-banner">
                  <span className="eyebrow" style={{ display: 'block', marginBottom: 16 }}>Ready to Source?</span>
                  <h2 className="display-md" style={{ marginBottom: 18 }}>
                    Request a Quote —<br />
                    <em style={{ color: 'var(--gold)' }}>Response within 24 hours</em>
                  </h2>
                  <p style={{ color: 'var(--muted)', maxWidth: 460, margin: '0 auto 36px', fontSize: 15 }}>
                    Tell us your project requirements and receive a detailed price sheet with
                    sample availability by the next business day.
                  </p>
                  <Link to="/contact" className="btn-gold">Submit an Inquiry →</Link>
                </div>
              </FadeUp>
            </div>
          </section>
        </div>
      );
    }

    // ── PRODUCTS PAGE ──────────────────────────────────────────────────────
    const FINISH_DESC = {
      'Polished': 'a glossy, reflective surface that deepens the colour and reveals full detail.',
      'High Polish': 'a mirror-bright, highly reflective surface with maximum depth and shine.',
      'Mirror Polish': 'the most reflective treatment — a flawless, glass-like mirror surface.',
      'Honed': 'a smooth matte finish with a soft, understated, contemporary look.',
      'Flamed': 'a textured, rugged surface created by intense heat — ideal for grip and exteriors.',
      'Leathered': 'a soft-sheen textured finish that hides smudges while keeping rich colour.',
      'Brushed': 'a subtly textured antique-style surface with a gentle worn feel.',
      'Sandblasted': 'a fine matte-textured non-slip surface, excellent for flooring and steps.',
    };

    const PRODS = [
      {
        name: 'Black Galaxy Granite', slug: 'black-galaxy',
        origin: 'Nellore, Andhra Pradesh, India',
        cls: 'granite-galaxy',
        tagline: 'The night sky, captured in stone.',
        desc: `Quarried exclusively from the Nellore district of Andhra Pradesh, Black Galaxy is among the world's most recognised premium granites. Its near-black base is scattered with golden and bronze metallic flecks — a naturally occurring crystalline effect that intensifies dramatically under light. No two slabs are identical, making each installation genuinely unique.`,
        uses: ['Feature walls', 'Kitchen countertops', 'Bathroom vanities', 'Commercial flooring', 'Monuments & memorials', 'Exterior facades'],
        finishes: ['Polished', 'Honed', 'Flamed', 'Leathered'],
        sizes: '30×30 · 60×60 · 60×90 · Custom slabs to 320×180 cm',
        thickness: '15mm · 18mm · 20mm · 30mm',
        moq: '100 sq. metres',
        rev: false,
        img: null,   // ← replace with '/images/black-galaxy.jpg' when ready
        specs: [{ k: 'Origin', v: 'Andhra Pradesh, India' }, { k: 'Density', v: '3.0–3.1 g/cm³' }, { k: 'Water Absorption', v: '0.04%' }, { k: 'Compressive Strength', v: '190–210 MPa' }, { k: 'Flexural Strength', v: '15–18 MPa' }, { k: 'Mohs Hardness', v: '6–7' }, { k: 'Frost Resistance', v: 'Excellent' }, { k: 'Available Finishes', v: '4 options' }],
        care: [{ title: 'Daily Cleaning', text: `Wipe with a soft cloth and warm water. Use a pH-neutral stone cleaner — never acidic or abrasive cleaners.` }, { title: 'Sealing', text: `Very low porosity, but seal every 12–18 months for kitchen worktops to guard against oil staining.` }, { title: 'Stain Removal', text: `Blot spills immediately. For oil stains, apply a baking-soda poultice for 24 hours, then rinse.` }, { title: 'What to Avoid', text: `Use trivets for hot cookware. Avoid standing water on honed finishes.` }],
        faqs: [{ q: `What causes the golden flecks in Black Galaxy granite?`, a: `The golden-bronze flecks are bronzite, a naturally occurring magnesium-iron silicate mineral. Premium-grade Black Galaxy has fine, evenly distributed flecks.` }, { q: `Is Black Galaxy suitable for kitchen countertops?`, a: `Yes — with 0.04% water absorption and high heat resistance it is one of the best granites for worktops. A polished finish is recommended.` }, { q: `What finishes are available?`, a: `Polished, Honed, Flamed and Leathered.` }, { q: `What is the minimum order quantity?`, a: `100 square metres, with full export documentation provided.` }],
      },
      {
        name: 'Black Pearl Granite',  slug: 'black-pearl',
        origin: 'Karnataka, India',
        cls: 'granite-pearl',
        tagline: 'Depth and lustre in pure black.',
        desc: `Black Pearl originates from Karnataka and delivers a pure, mirror-deep black surface with a distinctive pearl-like metallic shimmer across the face. When high-polished, it achieves a reflective quality rarely surpassed by any other natural stone — drawing the eye in any interior context.`,
        uses: ['Countertops & worktops', 'Wall cladding', 'Premium flooring', 'Lift car interiors', 'High-end retail fixtures', 'Hotel lobbies'],
        finishes: ['High Polish', 'Honed', 'Brushed'],
        sizes: '60×60 · 60×90 · 90×180 · Full slab',
        thickness: '18mm · 20mm · 30mm',
        moq: '80 sq. metres',
        rev: true,
        img: null,   // ← replace with '/images/black-pearl.jpg' when ready
        specs: [{ k: 'Origin', v: 'Karnataka, India' }, { k: 'Density', v: '2.9–3.0 g/cm³' }, { k: 'Water Absorption', v: '0.05%' }, { k: 'Compressive Strength', v: '180–200 MPa' }, { k: 'Flexural Strength', v: '14–17 MPa' }, { k: 'Mohs Hardness', v: '6–7' }, { k: 'Frost Resistance', v: 'Excellent' }, { k: 'Available Finishes', v: '3 options' }],
        care: [{ title: 'Daily Cleaning', text: `Use a microfibre cloth with warm water and pH-neutral soap. Buff dry to remove fingerprints from the high-polish surface.` }, { title: 'Sealing', text: `Apply an impregnating sealer every 12 months to maintain reflective depth.` }, { title: 'Stain Removal', text: `Blot spills immediately. Use a stone-specific poultice rather than scrubbing.` }, { title: 'What to Avoid', text: `Never use acidic or ammonia-based cleaners — they dull the pearl sheen.` }],
        faqs: [{ q: `What gives Black Pearl its shimmer?`, a: `Labradorite and feldspar crystals create a shifting metallic lustre — most pronounced on the high-polish finish.` }, { q: `Is Black Pearl the same as Black Galaxy?`, a: `No. Black Galaxy has golden flecks; Black Pearl has a uniform pearl sheen without large flecks.` }, { q: `Which finish best shows the pearl effect?`, a: `The High Polish finish maximises the pearl shimmer.` }, { q: `What is the minimum order quantity?`, a: `80 square metres.` }],
      },
      {
        name: 'Steel Gray Granite',   slug: 'steel-gray',
        origin: 'Krishnagiri, Tamil Nadu, India',
        cls: 'granite-steel',
        tagline: 'Architectural sophistication in every vein.',
        desc: `From Tamil Nadu's Krishnagiri district, Steel Gray is defined by its restrained, sophisticated palette — deep charcoal and steel-blue tones threaded with fine white and silver veining. Its versatility bridges the contemporary and classical, equally at home in a minimalist Tokyo interior and a heritage stone restoration in Edinburgh.`,
        uses: ['Architectural facades', 'Commercial flooring', 'Countertops', 'Heritage restoration', 'Memorial stones', 'Landscape paving'],
        finishes: ['Polished', 'Honed', 'Flamed', 'Brushed', 'Sandblasted'],
        sizes: '30×30 · 60×60 · 60×90 · Custom slabs',
        thickness: '15mm · 18mm · 20mm · 30mm · 40mm',
        moq: '120 sq. metres',
        rev: false,
        img: null,   // ← replace with '/images/steel-gray.jpg' when ready
        specs: [{ k: 'Origin', v: 'Tamil Nadu, India' }, { k: 'Density', v: '2.6–2.8 g/cm³' }, { k: 'Water Absorption', v: '0.08%' }, { k: 'Compressive Strength', v: '170–190 MPa' }, { k: 'Flexural Strength', v: '12–15 MPa' }, { k: 'Mohs Hardness', v: '6' }, { k: 'Frost Resistance', v: 'Excellent' }, { k: 'Available Finishes', v: '5 options' }],
        care: [{ title: 'Daily Cleaning', text: `Wipe with warm water and a pH-neutral cleaner. Hides watermarks and fingerprints well.` }, { title: 'Sealing', text: `Seal every 12–18 months, especially for exterior and high-traffic applications.` }, { title: 'Stain Removal', text: `Treat oil and rust marks with a stone poultice.` }, { title: 'What to Avoid', text: `Avoid de-icing salts on exterior paving in winter. Avoid acidic cleaners.` }],
        faqs: [{ q: `Is Steel Gray good for outdoor use?`, a: `Yes — excellent frost resistance, and flamed or sandblasted finishes give good slip resistance for paving and cladding.` }, { q: `What colour is Steel Gray exactly?`, a: `Deep charcoal to steel-blue grey with fine white and silver veining — cooler and more uniform than warmer greys.` }, { q: `How many finishes are available?`, a: `Five — the widest range in our collection.` }, { q: `What is the minimum order quantity?`, a: `120 square metres.` }],
      },
      {
        name: 'Jet Black Granite',    slug: 'jet-black',
        origin: 'Karimnagar, Telangana, India',
        cls: 'granite-jet',
        tagline: 'Absolute darkness. Absolute elegance.',
        desc: `Jet Black is the purest expression of natural granite — quarried from the ancient formations of Karimnagar, Telangana, it presents an almost void-like uniformity of colour with zero visible veining or inclusions. When mirror-polished, the surface achieves a depth of black that no manufactured material can replicate. Architects prize it for the way it transforms a space: walls appear to dissolve, countertops become obsidian pools, floors become a statement. An uncompromising choice for spaces that demand absolute presence.`,
        uses: ['Feature walls & statement surfaces', 'Kitchen countertops', 'Bathroom floors & vanities', 'Commercial lobbies', 'Luxury retail & hospitality', 'Memorial & monumental work'],
        finishes: ['Mirror Polish', 'Honed', 'Flamed', 'Leathered'],
        sizes: '30×30 · 60×60 · 60×90 · 90×180 · Custom slabs to 300×180 cm',
        thickness: '15mm · 18mm · 20mm · 30mm',
        moq: '100 sq. metres',
        rev: true,
        img: null,   // ← replace with '/images/jet-black.jpg' when ready
        specs: [{ k: 'Origin', v: 'Telangana, India' }, { k: 'Density', v: '3.0–3.2 g/cm³' }, { k: 'Water Absorption', v: '0.03%' }, { k: 'Compressive Strength', v: '200–220 MPa' }, { k: 'Flexural Strength', v: '16–19 MPa' }, { k: 'Mohs Hardness', v: '6–7' }, { k: 'Frost Resistance', v: 'Excellent' }, { k: 'Available Finishes', v: '4 options' }],
        care: [{ title: 'Daily Cleaning', text: `Clean with a microfibre cloth and pH-neutral cleaner, then buff dry — the mirror finish shows every mark.` }, { title: 'Sealing', text: `Seal annually to protect the pristine surface despite very low porosity.` }, { title: 'Stain Removal', text: `Blot any spill instantly — even water can mark the mirror finish.` }, { title: 'What to Avoid', text: `Never use abrasive cleaners or scouring pads — they permanently dull the mirror polish.` }],
        faqs: [{ q: `What makes Jet Black different from other black granites?`, a: `Zero visible veining, flecks or inclusions — a completely uniform pure black, ideal where total uniformity is required.` }, { q: `Is Jet Black truly 100% black?`, a: `Among the most uniform black granites available; mirror-polished it reaches a depth engineered stones cannot match.` }, { q: `What is the best finish for Jet Black?`, a: `Mirror Polish for maximum depth; Honed for contemporary matte; Flamed and Leathered for texture.` }, { q: `Why is Jet Black popular for memorials?`, a: `Its flawless surface takes engraving beautifully; Japanese craftsmen value its consistency.` }],
      },
    ];

    function ProductsPage() {
      // Extract optional product slug from hash: /products/black-galaxy → 'black-galaxy'
      const route = useRoute();
      // normalizeSlug() fixes casing, percent-encoding, spaces, trailing chars
      const targetSlug = route.startsWith('/products/')
        ? normalizeSlug(route.slice('/products/'.length))
        : null;

      // Scroll to the specific product after mount/route-change
      useEffect(() => {
        if (!targetSlug) return;

        console.log('[Granava] targetSlug resolved to:', targetSlug);

        /**
         * Retry loop — rAF fires once per frame, but products 3 & 4
         * (Steel Gray, Jet Black) are below-fold; React may not have
         * committed their DOM nodes by the first frame.
         * We retry up to MAX_ATTEMPTS times, 50ms apart.
         */
        const MAX_ATTEMPTS = 10;
        let attempts = 0;

        function tryScroll() {
          attempts += 1;
          const el = document.getElementById(`product-${targetSlug}`);

          console.log(`[Granava] scroll attempt ${attempts}: element=`, el);

          if (!el) {
            if (attempts < MAX_ATTEMPTS) {
              setTimeout(tryScroll, 50); // retry after 50 ms
            } else {
              console.warn('[Granava] product element not found after', MAX_ATTEMPTS, 'attempts. id looked up:', `product-${targetSlug}`);
            }
            return;
          }

          const navH = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
          ) || 80;
          const top = el.getBoundingClientRect().top + window.scrollY - navH - 24;

          console.log('[Granava] scrolling to top:', top, 'navH:', navH);
          window.scrollTo({ top, behavior: 'smooth' });

          el.classList.add('product-detail--highlight');
          setTimeout(() => el.classList.remove('product-detail--highlight'), 1400);
        }

        // Start after first paint
        requestAnimationFrame(tryScroll);
      }, [targetSlug]);

      useEffect(() => {
        document.title = 'Black Galaxy, Black Pearl, Steel Gray & Jet Black Granite Export | Granava India';
        // Breadcrumb schema
        const bc = document.getElementById('ld-breadcrumb');
        if (bc) bc.textContent = JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.granava.in/"},{"@type":"ListItem","position":2,"name":"Products","item":"https://www.granava.in/#/products"}]});
        setMeta('Technical specifications for Black Galaxy, Jet Black, Black Pearl & Steel Gray granite for export. Available in polished, honed, flamed & leathered finishes. Request samples.');
      }, []);
      return (
        <div>
          {/* ── Editorial hero ── */}
          <div className="coll-hero">
            <div className="container">
              <FadeUp>
                <span className="eyebrow">Our Collection</span>
                <h1 className="coll-hero-title">The Granava Collection</h1>
                <p className="coll-hero-sub">
                  Four exceptional granites — each individually quarry-graded, inspected,
                  and prepared for international export to the highest standards.
                </p>
                <div className="coll-hero-meta">
                  <div><b>4</b><span>Premium Varieties</span></div>
                  <div><b>25+</b><span>Countries Served</span></div>
                  <div><b>20+</b><span>Years of Export</span></div>
                </div>
              </FadeUp>
            </div>
          </div>

          {/* ── Gallery grid of product cards ── */}
          <section className="section">
            <div className="container">
              <div className="coll-grid">
                {PRODS.map((p, i) => (
                  <FadeUp key={p.slug} delay={i * 80}>
                    <Link
                      to={`/products/${p.slug}/`}
                      className="coll-card"
                      id={`product-${p.slug}`}
                      data-product-id={p.slug}
                    >
                      <div className={`coll-card-vis ${p.cls}`}>
                        {p.img && (
                          <img src={p.img} alt={`${p.name} granite slab`} loading="lazy" decoding="async" />
                        )}
                        <span className="coll-card-num">{String(i + 1).padStart(2, '0')}</span>
                        <div className="coll-card-overlay">
                          <span className="coll-card-cta">View Specifications →</span>
                        </div>
                      </div>
                      <div className="coll-card-body">
                        <span className="eyebrow">{p.origin}</span>
                        <h2 className="coll-card-name">{p.name}</h2>
                        <p className="coll-card-tag">{p.tagline}</p>
                        <div className="coll-card-finishes">
                          {p.finishes.slice(0, 4).map(f => (
                            <span key={f} className="finish-badge">{f}</span>
                          ))}
                        </div>
                        <div className="coll-card-foot">
                          <span className="coll-card-moq">MOQ · {p.moq}</span>
                          <span className="coll-card-arrow">→</span>
                        </div>
                      </div>
                    </Link>
                  </FadeUp>
                ))}
              </div>

              {/* ── CTA strip ── */}
              <FadeUp>
                <div className="coll-cta">
                  <div>
                    <h3>Not sure which granite suits your project?</h3>
                    <p>Our export team will help you choose the right stone, finish, and specification.</p>
                  </div>
                  <Link to="/contact" className="btn-gold">Talk to Our Team →</Link>
                </div>
              </FadeUp>
            </div>
          </section>
        </div>
      );
    }

    // ── MARKETS PAGE ───────────────────────────────────────────────────────
    const MARKETS = [
      {
        flag: '🇬🇧', name: 'United Kingdom', code: 'UK', page: '/markets/united-kingdom/', slug: 'united-kingdom',
        tagline: 'Architectural heritage meets contemporary ambition.',
        p1: 'Granava supplies granite to some of the UK\'s most demanding architectural projects — from RIBA-shortlisted commercial developments to Grade II heritage building restorations in London, Edinburgh, and beyond.',
        p2: 'UK clients value our consistent batch colouration, compliance with British Standards, and our ability to match exact specifications for sensitive heritage stone replacement work.',
        tags: ['Flooring', 'Wall Cladding', 'Heritage Restoration', 'Countertops', 'External Paving'],
      },
      {
        flag: '🇺🇸', name: 'United States', code: 'USA', page: '/markets/united-states/', slug: 'united-states',
        tagline: 'Where kitchen design meets natural luxury.',
        p1: 'The American market sets the global benchmark for granite countertop quality expectations. Granava serves fabricators, kitchen designers, general contractors, and luxury hotel developers from New York to Los Angeles.',
        p2: 'We provide material certifications for food-contact surfaces and work with US import partners to streamline customs processing and warehouse delivery timelines across all 50 states.',
        tags: ['Countertops', 'Commercial Flooring', 'Hotel Lobbies', 'Bathroom Vanities', 'Residential'],
      },
      {
        flag: '🌏', name: 'East Asia', code: 'Japan · South Korea · China · Singapore', page: '/markets/east-asia/', slug: 'east-asia',
        tagline: 'Precision, permanence, and prestige.',
        p1: 'East Asian markets demand the highest level of surface consistency and finishing precision. From Japanese memorial stone workshops requiring perfect grain uniformity to Singapore\'s ultra-luxury residential developments, Granava meets the region\'s exacting standards.',
        p2: 'We maintain dedicated quality protocols for East Asian orders, including enhanced visual grading, reinforced packaging, and detailed inspection documentation in Japanese, Korean, and Chinese on request.',
        tags: ['Memorials', 'Monuments', 'Luxury Interiors', 'Civic Projects', 'Commercial Flooring'],
      },
      {
        flag: '🇦🇪', name: 'UAE & Middle East', code: 'UAE · Saudi Arabia · Qatar · Kuwait', page: '/markets/uae-middle-east/', slug: 'uae-middle-east',
        tagline: 'Stone worthy of the region\'s grandest ambitions.',
        p1: 'The Gulf market demands materials that project power and permanence. Palace lobbies, royal residences, five-star hotel atriums, and landmark civic developments rely on Granava for granite that commands respect at any scale.',
        p2: 'We have established relationships with Dubai and Abu Dhabi stone distributors and can coordinate delivery to project sites across Saudi Arabia, Qatar, Kuwait, and Bahrain with full customs documentation.',
        tags: ['Hotel Lobbies', 'Palaces', 'Civic Projects', 'Royal Residences', 'Luxury Hospitality'],
      },
    ];

    function MarketsPage() {
      useEffect(() => {
        document.title = 'Granite Export to UK, USA, UAE & East Asia | Granava India';
        setMeta('Granava supplies Indian granite to UK architects, US fabricators, UAE developers & East Asian importers. Market-specific expertise for every region.');
      }, []);
      return (
        <div>
          {/* ── Editorial hero ── */}
          <div className="coll-hero">
            <div className="container">
              <FadeUp>
                <span className="eyebrow">Where We Export</span>
                <h1 className="coll-hero-title">Markets We Serve</h1>
                <p className="coll-hero-sub">
                  Granava exports premium Indian granite to architects, fabricators, and
                  developers across four key regions — each with dedicated quality protocols,
                  documentation, and logistics support.
                </p>
                <div className="coll-hero-meta">
                  <div><b>4</b><span>Key Regions</span></div>
                  <div><b>25+</b><span>Countries Served</span></div>
                  <div><b>100%</b><span>Export Documentation</span></div>
                </div>
              </FadeUp>
            </div>
          </div>

          {/* ── Grid of market cards (each links to its detail page) ── */}
          <section className="section">
            <div className="container">
              <div className="coll-grid">
                {MARKETS.map((m, i) => (
                  <FadeUp key={m.name} delay={i * 80}>
                    <Link to={m.page} className="mkt-card">
                      <div className="mkt-card-top">
                        <span className="mkt-card-flag">{m.flag}</span>
                        <div>
                          <h2 className="mkt-card-name">{m.name}</h2>
                          <span className="mkt-card-code">{m.code}</span>
                        </div>
                      </div>
                      <p className="mkt-card-tag">{m.tagline}</p>
                      <p className="mkt-card-desc">{m.p1}</p>
                      <div className="mkt-card-tags">
                        {m.tags.slice(0, 4).map(t => (
                          <span key={t} className="finish-badge">{t}</span>
                        ))}
                      </div>
                      <div className="mkt-card-foot">
                        <span className="mkt-card-link">View Market Details</span>
                        <span className="mkt-card-arrow">→</span>
                      </div>
                    </Link>
                  </FadeUp>
                ))}
              </div>

              {/* ── CTA strip ── */}
              <FadeUp>
                <div className="coll-cta">
                  <div>
                    <h3>Exporting to a region not listed here?</h3>
                    <p>We ship worldwide with full customs documentation. Tell us your destination.</p>
                  </div>
                  <Link to="/contact" className="btn-gold">Contact Our Export Team →</Link>
                </div>
              </FadeUp>
            </div>
          </section>
        </div>
      );
    }

    // ── ABOUT PAGE ─────────────────────────────────────────────────────────
    const VALUES = [
      { n: '01', t: 'Uncompromised Quality', d: 'Every consignment is hand-inspected at source. We reject any slab that does not meet our visual and structural grade standards before it is packed for export.' },
      { n: '02', t: 'Trust & Transparency', d: 'Honest pricing, accurate lead times, and clear communication throughout every order. We build long-term partnerships, not one-time transactions.' },
      { n: '03', t: 'On-Time Delivery', d: 'Our quarry relationships and freight partnerships allow us to commit to delivery windows that keep your project on schedule — and we honour them.' },
      { n: '04', t: 'Responsible Sourcing', d: 'We partner with quarries holding valid environmental clearances and Indian mining compliance, ensuring a responsible supply chain from ground to global.' },
    ];

    function AboutPage() {
      useEffect(() => {
        document.title = 'About Granava | Granite Exporter from Andhra Pradesh, India';
        setMeta('Granava is a premium granite exporter based in Ongole, Andhra Pradesh. Sourcing directly from Nellore quarries to supply Black Galaxy & premium granites globally.');
      }, []);
      return (
        <div>
          <div className="page-hero">
            <div className="page-hero-grid" />
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
              <FadeUp>
                <span className="eyebrow">Our Story</span>
                <h1 className="display-lg" style={{ marginTop: 10, maxWidth: 560 }}>
                  Sourced at the Origin,<br />Trusted Worldwide
                </h1>
              </FadeUp>
            </div>
          </div>

          <section className="section">
            <div className="container">
              <div className="story-grid">
                <FadeUp>
                  <span className="eyebrow">Our Foundation</span>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', marginTop: 10, marginBottom: 24 }}>
                    Born in the heartland<br />of Black Galaxy
                  </h2>
                  <p style={{ color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.82, marginBottom: 18 }}>
                    Granava was founded in Andhra Pradesh — the single region on earth where true Black Galaxy granite
                    is quarried. Our proximity to the source is not incidental. It is the foundation of everything we offer:
                    first selection rights at the quarry face, direct pricing, and the ability to personally verify the
                    quality of every consignment before it leaves India.
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.82 }}>
                    From this position, we expanded to supply Black Pearl from Karnataka and Steel Gray from Tamil Nadu —
                    building a portfolio of India's three most internationally respected dark granites, all under one
                    reliably sourced roof.
                  </p>
                </FadeUp>
                <FadeUp delay={150}>
                  <span className="eyebrow">Our Process</span>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', marginTop: 10, marginBottom: 24 }}>
                    From quarry face<br />to your project site
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {[
                      ['Quarry Selection', 'We partner exclusively with quarries holding valid environmental and mining clearances — no exceptions.'],
                      ['Slab Inspection', 'Every slab is assessed for colour consistency, surface finish quality, and structural integrity before acceptance.'],
                      ['Precision Cutting', 'Orders are cut to customer specification in our Ongole processing facility using CNC water-jet and bridge saw equipment.'],
                      ['Export Documentation', 'Full GSTIN invoicing, phytosanitary certificates, and country-specific compliance documentation issued for every consignment.'],
                    ].map(([title, desc]) => (
                      <div key={title} style={{ display: 'flex', gap: 14 }}>
                        <span style={{ color: 'var(--gold)', fontSize: 16, flexShrink: 0, marginTop: 3 }}>◈</span>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 4 }}>{title}</div>
                          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.68 }}>{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </FadeUp>
              </div>
            </div>
          </section>

          <section className="section" style={{ background: 'var(--surface)' }}>
            <div className="container">
              <FadeUp style={{ textAlign: 'center', marginBottom: 52 }}>
                <span className="eyebrow">Our Values</span>
                <h2 className="display-md" style={{ marginTop: 10 }}>What We Stand For</h2>
              </FadeUp>
              <div className="values-grid">
                {VALUES.map((v, i) => (
                  <FadeUp key={v.t} delay={i * 80}>
                    <div className="value-card">
                      <div className="value-num">{v.n}</div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', marginBottom: 12 }}>{v.t}</h3>
                      <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.72 }}>{v.d}</p>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </section>

          <section className="section-sm">
            <div className="container">
              <FadeUp>
                <span className="eyebrow">Certifications & Compliance</span>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginTop: 10, marginBottom: 36 }}>Export-Ready Documentation</h2>
                <div className="cert-grid">
                  {[
                    ['📋', 'ISO 9001:2015', 'Quality Management', 'Certification in progress'],
                    ['📄', 'GSTIN Registered', 'Indian Tax Compliance', 'Active exporter status'],
                    ['🌿', 'Phytosanitary', 'Export Certificates', 'Issued per consignment'],
                    ['✅', 'Country Compliance', 'CE / UKCA / Others', 'Available on request'],
                  ].map(([icon, t, s, st]) => (
                    <div key={t} className="cert-card">
                      <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>{icon}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{t}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{s}</div>
                      <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{st}</div>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>
          </section>
        </div>
      );
    }

    // ── CONTACT PAGE ───────────────────────────────────────────────────────
    // Replace with your EmailJS credentials:
    const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID'; // ← Replace YOUR_FORM_ID with your Formspree form ID

    const PHONE_CODES = [
      { l: 'UK +44', v: '+44' }, { l: 'USA +1', v: '+1' },
      { l: 'UAE +971', v: '+971' }, { l: 'SG +65', v: '+65' },
      { l: 'JP +81', v: '+81' }, { l: 'KR +82', v: '+82' },
      { l: 'CN +86', v: '+86' }, { l: 'IN +91', v: '+91' },
    ];

    function InquiryForm() {
      const [form, setForm] = useState({
        fullName: '', company: '', email: '',
        phoneCode: '+44', phone: '',
        products: [], appType: '',
        quantity: '', deliveryCountry: '', message: '',
      });
      const [errs, setErrs] = useState({});
      const [status, setStatus] = useState('idle');

      function upd(k, v) {
        setForm(p => ({ ...p, [k]: v }));
        if (errs[k]) setErrs(p => ({ ...p, [k]: '' }));
      }

      function toggleProd(prod) {
        setForm(p => {
          if (prod === 'All Products') {
            return { ...p, products: p.products.includes('All Products') ? [] : ['All Products'] };
          }
          const base = p.products.filter(x => x !== 'All Products');
          return { ...p, products: base.includes(prod) ? base.filter(x => x !== prod) : [...base, prod] };
        });
      }

      function validate() {
        const e = {};
        const trimmed = { ...form, fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() };
        if (!trimmed.fullName) e.fullName = 'Full name is required';
        if (!form.email.trim()) e.email = 'Email address is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
        if (form.products.length === 0) e.products = 'Please select at least one product';
        setErrs(e);
        return Object.keys(e).length === 0;
      }

      async function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;
        setStatus('sending');
        const data = {
          name: form.fullName,
          _replyto: form.email,
          email: form.email,
          company: form.company || 'Not provided',
          phone: `${form.phoneCode} ${form.phone}`,
          products: form.products.join(', '),
          application: form.appType || 'Not specified',
          quantity: form.quantity || 'Not specified',
          delivery_country: form.deliveryCountry || 'Not specified',
          message: form.message || 'No additional message.',
          _subject: `New Granite Inquiry — ${form.products.join(', ')} — ${form.fullName}`,
        };
        try {
          const res = await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data),
          });
          if (res.ok) {
            setStatus('success');
          } else {
            console.error('Formspree error:', await res.text());
            setStatus('error');
          }
        } catch (err) {
          console.error('Form submission error:', err);
          setStatus('error');
        }
      }

      if (status === 'success') return (
        <div className="form-success-box">
          <div style={{ fontSize: '2rem', marginBottom: 14, color: 'var(--gold)' }}>✓</div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: 12 }}>
            Inquiry Received
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>
            Thank you, {form.fullName}. We will respond to your inquiry within 24 hours.
          </p>
        </div>
      );

      return (
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="f-group">
              <label className="f-label">Full Name <span className="req">*</span></label>
              <input className="f-input" value={form.fullName} onChange={e => upd('fullName', e.target.value)} placeholder="Your full name" />
              {errs.fullName && <span className="f-err">{errs.fullName}</span>}
            </div>
            <div className="f-group">
              <label className="f-label">Company Name</label>
              <input className="f-input" value={form.company} onChange={e => upd('company', e.target.value)} placeholder="Company (optional)" />
            </div>
            <div className="f-group">
              <label className="f-label">Email Address <span className="req">*</span></label>
              <input className="f-input" type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="your@email.com" />
              {errs.email && <span className="f-err">{errs.email}</span>}
            </div>
            <div className="f-group">
              <label className="f-label">Phone Number</label>
              <div className="phone-wrap">
                <select className="f-select phone-code" value={form.phoneCode} onChange={e => upd('phoneCode', e.target.value)} style={{ borderRight: 'none', width: 108 }}>
                  {PHONE_CODES.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                </select>
                <input className="f-input phone-num" value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="Phone number" style={{ borderLeft: 'none' }} />
              </div>
            </div>
            <div className="f-group full">
              <label className="f-label">Product Interest <span className="req">*</span></label>
              <div className="cb-grid">
                {['Black Galaxy Granite', 'Black Pearl Granite', 'Steel Gray Granite', 'All Products'].map(p => (
                  <label key={p} className="cb-item">
                    <input type="checkbox" checked={form.products.includes(p)} onChange={() => toggleProd(p)} />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
              {errs.products && <span className="f-err">{errs.products}</span>}
            </div>
            <div className="f-group">
              <label className="f-label">Application Type</label>
              <select className="f-select" value={form.appType} onChange={e => upd('appType', e.target.value)}>
                <option value="">Select application</option>
                <option>Countertops</option>
                <option>Flooring</option>
                <option>Wall Cladding</option>
                <option>Monuments</option>
                <option>Facade</option>
                <option>Other</option>
              </select>
            </div>
            <div className="f-group">
              <label className="f-label">Quantity Required</label>
              <input className="f-input" value={form.quantity} onChange={e => upd('quantity', e.target.value)} placeholder="e.g. 500 sq ft or 50 sq metres" />
            </div>
            <div className="f-group full">
              <label className="f-label">Delivery Country</label>
              <input className="f-input" value={form.deliveryCountry} onChange={e => upd('deliveryCountry', e.target.value)} placeholder="Country for delivery" />
            </div>
            <div className="f-group full">
              <label className="f-label">Message / Special Requirements</label>
              <textarea className="f-textarea" value={form.message} onChange={e => upd('message', e.target.value)} placeholder="Specific requirements, sizes, finish preferences, or questions..." rows={5} />
            </div>
            <div className="f-group full">
              {status === 'error' && (
                <div className="form-error-box">
                  <p style={{ fontSize: 13.5, color: '#e05050' }}>
                    Something went wrong. Please try again or email us directly at info@granava.in
                  </p>
                </div>
              )}
              <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center', padding: 16 }} disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending Inquiry...' : 'Submit Inquiry →'}
              </button>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, textAlign: 'center', lineHeight: 1.6 }}>
                We respond to all inquiries within 24 business hours (Mon–Sat, IST).
              </p>
            </div>
          </div>
        </form>
      );
    }

    function ContactPage() {
      useEffect(() => {
        document.title = 'Contact Granava | Granite Export Inquiry & Quotation | India';
        setMeta('Submit a granite sourcing inquiry to Granava. Get pricing, specs & sample availability within 24 hours. Serving UK, USA, UAE & East Asia exporters.');
      }, []);
      return (
        <div>
          <div className="page-hero">
            <div className="page-hero-grid" />
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
              <FadeUp>
                <span className="eyebrow">Get in Touch</span>
                <h1 className="display-lg" style={{ marginTop: 10 }}>Start Your Inquiry</h1>
                <p style={{ color: 'var(--muted)', marginTop: 16, maxWidth: 480 }}>
                  Tell us your project requirements. We'll respond with pricing, specifications,
                  and sample availability within 24 hours.
                </p>
              </FadeUp>
            </div>
          </div>

          <section className="section">
            <div className="container">
              <div className="contact-layout">
                <FadeUp>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: 32 }}>Inquiry Form</h2>
                  <InquiryForm />
                </FadeUp>
                <FadeUp delay={150}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: 20 }}>
                    Contact Details
                  </h2>
                  <div className="contact-card">
                    <div className="contact-row">
                      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>📍</span>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 7 }}>Address</div>
                        <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.7 }}>
                          Granava Exports<br />
                          Ongole, Andhra Pradesh<br />
                          India — 523 001
                        </p>
                      </div>
                    </div>
                    <div className="contact-row">
                      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>📧</span>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 7 }}>Email</div>
                        <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>info@granava.in</p>
                        <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>export@granava.in</p>
                      </div>
                    </div>
                    <div className="contact-row">
                      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>📞</span>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 7 }}>Phone</div>
                        <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>+91 00000 00000</p>
                        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>WhatsApp available</p>
                      </div>
                    </div>
                    <div className="contact-row">
                      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>🕐</span>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 7 }}>Business Hours (IST)</div>
                        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Monday – Friday: 9:00 AM – 6:00 PM</p>
                        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Saturday: 9:00 AM – 2:00 PM</p>
                        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                  <div className="map-ph">
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>🗺️</div>
                      <p style={{ fontSize: 13, color: 'var(--muted)' }}>Ongole, Andhra Pradesh, India</p>
                      <p style={{ fontSize: 11, color: 'var(--border)', marginTop: 6 }}>Replace with Google Maps embed URL</p>
                    </div>
                  </div>
                </FadeUp>
              </div>
            </div>
          </section>
        </div>
      );
    }

    // ── 404 ────────────────────────────────────────────────────────────────
    function NotFoundPage() {
      return (
        <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 72 }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '4rem', color: 'rgba(184,158,124,0.3)' }}>404</h1>
            <p style={{ color: 'var(--muted)', marginTop: 12, marginBottom: 28 }}>Page not found</p>
            <Link to="/" className="btn-outline">← Back to Home</Link>
          </div>
        </div>
      );
    }

    // ── Meta helper ────────────────────────────────────────────────────────
    function setMeta(desc) {
      let el = document.querySelector('meta[name="description"]');
      if (!el) { el = document.createElement('meta'); el.name = 'description'; document.head.appendChild(el); }
      el.content = desc;
      // Update OG tags dynamically
      ['og:description','twitter:description'].forEach(prop => {
        let tag = document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
        if (tag) tag.content = desc;
      });
    }
    function setCanonical(path) {
      let el = document.querySelector('link[rel="canonical"]');
      if (!el) { el = document.createElement('link'); el.rel = 'canonical'; document.head.appendChild(el); }
      el.href = 'https://www.granava.in/' + (path || '');
    }

    // ── App ────────────────────────────────────────────────────────────────
    const PAGE_MAP = {
      '/': HomePage,
      '/products': ProductsPage,
      '/markets': MarketsPage,
      '/about': AboutPage,
      '/contact': ContactPage,
    };

    function ScrollManager() {
      // scroll to top on top-level route change (product sub-routes handle their own scroll)
      const location = useLocation();
      useEffect(() => {
        if (!location.pathname.startsWith('/products/')) window.scrollTo(0, 0);
      }, [location.pathname]);
      return null;
    }

    function Layout({ children }) {
      const route = useRoute();
      useEffect(() => {
        const el = document.getElementById('ps-loading');
        if (el) { el.style.opacity = '0'; setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 600); }
      }, []);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
          <ScrollProgress />
          <Navbar route={route} />
          <main>{children}</main>
          <Footer />
        </div>
      );
    }

    
    // ─── Standalone Product Detail Page ───
    function ProductDetailPage() {
      const route = useRoute();
      const slug = normalizeSlug(route.slice('/products/'.length));
      const product = PRODS.find((p) => p.slug === slug);
      const [activeFinish, setActiveFinish] = useState(0);
      const [openFaq, setOpenFaq] = useState(null);

      useEffect(() => {
        if (product) {
          document.title = `${product.name} | Granava`;
          setMeta(product.desc.slice(0, 155));
          window.scrollTo(0, 0);
        }
      }, [slug, product]);

      if (!product) return <NotFoundPage />;

      const related = PRODS.filter((p) => p.slug !== slug);

      return (
        <div className="pd">
          <div className="container">
            <nav className="pd-breadcrumb">
              <Link to="/">Home</Link> <span>›</span> <Link to="/products">Collection</Link> <span>›</span> <span className="pd-crumb-current">{product.name}</span>
            </nav>
          </div>

          {/* Hero: visual + intro */}
          <div className="container">
            <div className="pd-hero">
              <div className="pd-hero-visual">
                <div className={`pd-vis ${product.cls} fin-${product.finishes[activeFinish].toLowerCase().replace(/ /g, '-')}`}>
                  {product.img && <img src={product.img} alt={`${product.name} ${product.finishes[activeFinish]} finish`} loading="eager" />}
                  <span className="pd-vis-finish-tag">{product.finishes[activeFinish]} Finish</span>
                </div>
                <p className="pd-vis-caption">Showing: <b>{product.finishes[activeFinish]}</b> finish — {FINISH_DESC[product.finishes[activeFinish]] || 'a distinctive surface treatment.'}</p>
              </div>
              <div className="pd-hero-body">
                <FadeUp>
                  <span className="pd-eyebrow">{product.origin}</span>
                  <h1 className="pd-title">{product.name}</h1>
                  <p className="pd-tagline">{product.tagline}</p>
                  <p className="pd-desc">{product.desc}</p>

                  <div className="pd-quick">
                    <div><span>Sizes</span><b>{product.sizes}</b></div>
                    <div><span>Thickness</span><b>{product.thickness}</b></div>
                    <div><span>Minimum Order</span><b>{product.moq}</b></div>
                  </div>

                  <div className="pd-finishes">
                    <span className="pd-label">Available Finishes</span>
                    <div className="pd-finish-row">
                      {product.finishes.map((f, i) => (
                        <button
                          key={f}
                          type="button"
                          className={`pd-finish-btn ${i === activeFinish ? 'active' : ''}`}
                          onClick={() => setActiveFinish(i)}
                        >{f}</button>
                      ))}
                    </div>
                  </div>

                  <div className="pd-cta-row">
                    <a className="btn-gold" href={`mailto:info@granava.in?subject=Sample Request: ${product.name}`}>Request a Sample</a>
                    <a className="btn-outline" href={`mailto:info@granava.in?subject=Pricing Enquiry: ${product.name}`}>Get Pricing</a>
                  </div>
                </FadeUp>
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="container">
            <section className="pd-section">
              <h2 className="pd-h2"><span className="pd-num">01</span> Technical Specifications</h2>
              <div className="pd-specs">
                {product.specs.map((s) => (
                  <div key={s.k} className="pd-spec-row"><span>{s.k}</span><b>{s.v}</b></div>
                ))}
              </div>
            </section>
          </div>

          {/* Applications */}
          <div className="container">
            <section className="pd-section">
              <h2 className="pd-h2"><span className="pd-num">02</span> Common Applications</h2>
              <div className="pd-uses">
                {product.uses.map((u) => <span key={u} className="pd-use">{u}</span>)}
              </div>
            </section>
          </div>

          {/* Care */}
          

          <div className="container">
            <section className="pd-section">
              <h2 className="pd-h2"><span className="pd-num">03</span> Care &amp; Maintenance</h2>
              <div className="pd-care">
                {product.care.map((c, i) => (
                  <div key={c.title} className="pd-care-item">
                    <div className="pd-care-num">{String(i + 1).padStart(2, '0')}</div>
                    <div><h3>{c.title}</h3><p>{c.text}</p></div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* FAQ */}
          <div className="container">
            <section className="pd-section">
              <h2 className="pd-h2"><span className="pd-num">04</span> Frequently Asked Questions</h2>
              <div className="pd-faqs">
                {product.faqs.map((f, i) => (
                  <div key={i} className={`pd-faq ${openFaq === i ? 'open' : ''}`}>
                    <button type="button" className="pd-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <span>{f.q}</span><span className="pd-faq-icon">{openFaq === i ? '−' : '+'}</span>
                    </button>
                    {openFaq === i && <p className="pd-faq-a">{f.a}</p>}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Related */}
          <div className="container">
            <section className="pd-section pd-related">
              <h2 className="pd-h2"><span className="pd-num">05</span> Also in Our Collection</h2>
              <div className="pd-related-grid">
                {related.map((p) => (
                  <Link key={p.slug} to={`/products/${p.slug}/`} className="pd-related-card">
                    <div className={`pd-related-vis ${p.cls}`}>{p.img && <img src={p.img} alt={p.name} loading="lazy" />}</div>
                    <div className="pd-related-body">
                      <h3>{p.name}</h3>
                      <span>{p.tagline}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="container">
            <div className="pd-final-cta">
              <h2>Ready to Order {product.short || product.name}?</h2>
              <p>Request samples, pricing, or a shipping quote to your destination.</p>
              <div className="pd-cta-row">
                <a className="btn-gold" href={`mailto:info@granava.in?subject=Order Enquiry: ${product.name}`}>Contact Our Export Team</a>
                <Link className="btn-outline" to="/products">View Full Collection</Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    
    // ─── Standalone Market Detail Page ───
    function MarketDetailPage() {
      const route = useRoute();
      const slug = normalizeSlug(route.slice('/markets/'.length));
      const market = MARKETS.find((m) => m.slug === slug);

      useEffect(() => {
        if (market) {
          document.title = `Granite Export to ${market.name} | Granava`;
          setMeta(`Granava exports premium Indian granite to ${market.name}. ${market.tagline}`);
          window.scrollTo(0, 0);
        }
      }, [slug, market]);

      if (!market) return <NotFoundPage />;

      const others = MARKETS.filter((m) => m.slug !== slug);

      return (
        <div className="md">
          <div className="container">
            <nav className="pd-breadcrumb">
              <Link to="/">Home</Link> <span>›</span> <Link to="/markets">Markets</Link> <span>›</span> <span className="pd-crumb-current">{market.name}</span>
            </nav>
          </div>

          <div className="container">
            <div className="md-hero">
              <FadeUp>
                <span className="md-flag">{market.flag}</span>
                <span className="pd-eyebrow">{market.code}</span>
                <h1 className="pd-title">Granite Export to {market.name}</h1>
                <p className="pd-tagline">{market.tagline}</p>
                <p className="pd-desc">{market.p1}</p>
                <p className="pd-desc">{market.p2}</p>
                <div className="pd-cta-row">
                  <a className="btn-gold" href={`mailto:info@granava.in?subject=Enquiry from ${market.name}`}>Email Our Export Team</a>
                  <Link className="btn-outline" to="/products">View Collection</Link>
                </div>
              </FadeUp>
            </div>
          </div>

          <div className="container">
            <section className="pd-section">
              <h2 className="pd-h2"><span className="pd-num">01</span> Common Applications</h2>
              <div className="pd-uses">
                {market.tags.map((t) => <span key={t} className="pd-use">{t}</span>)}
              </div>
            </section>
          </div>

          <div className="container">
            <section className="pd-section">
              <h2 className="pd-h2"><span className="pd-num">02</span> Our Granite Collection</h2>
              <div className="pd-related-grid">
                {PRODS.map((p) => (
                  <Link key={p.slug} to={`/products/${p.slug}/`} className="pd-related-card">
                    <div className={`pd-related-vis ${p.cls}`}>{p.img && <img src={p.img} alt={p.name} loading="lazy" />}</div>
                    <div className="pd-related-body">
                      <h3>{p.name}</h3>
                      <span>{p.tagline}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="container">
            <section className="pd-section">
              <h2 className="pd-h2"><span className="pd-num">03</span> Other Markets We Serve</h2>
              <div className="md-others">
                {others.map((m) => (
                  <Link key={m.slug} to={m.page} className="md-other-card">
                    <span className="md-other-flag">{m.flag}</span>
                    <div>
                      <h3>{m.name}</h3>
                      <span>{m.tagline}</span>
                    </div>
                    <span className="md-other-arrow">→</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="container">
            <div className="pd-final-cta">
              <h2>Exporting to {market.name}?</h2>
              <p>Request samples, pricing, or a shipping quote to your destination.</p>
              <div className="pd-cta-row">
                <a className="btn-gold" href={`mailto:info@granava.in?subject=Order Enquiry: ${market.name}`}>Contact Our Export Team</a>
                <Link className="btn-outline" to="/markets">All Markets</Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    function App() {
      return (
        <BrowserRouter>
          <ScrollManager />
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/markets" element={<MarketsPage />} />
              <Route path="/markets/:slug" element={<MarketDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      );
    }

export default App
