import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Mail, Phone, MapPin, ArrowRight, MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import './Footer.css';

const exploreLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Tea Tasting', to: '/booking' },
  { label: 'Kombucha', to: '/kombucha' },
  { label: 'Heritage', to: '/heritage' },
  { label: 'Gallery', to: '/gallery' },
];

const shopLinks = [
  { label: 'All Teas', to: '/shop' },
  { label: 'Black Tea', to: '/shop?category=black' },
  { label: 'Green Tea', to: '/shop?category=green' },
  { label: 'White Tea', to: '/shop?category=white' },
  { label: 'Kombucha', to: '/shop?category=kombucha' },
  { label: 'Accessories', to: '/shop?category=accessories' },
];

const visitLinks = [
  { label: 'Café Experience', to: '/cafe' },
  { label: 'Contact', to: '/contact' },
  { label: 'Booking', to: '/booking' },
  { label: 'Journal', to: '/journal' },
  { label: 'FAQ', to: '/faq' },
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const { settings } = useSettings() || { settings: null };

  const storeEmail = settings?.store_email || 'hello@buddiescafe.com';
  const storePhone = settings?.store_phone || '+91 98765 43210';

  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      {/* ── Top Brand Banner ── */}
      <div className="footer__top">
        <h2 className="footer__brand-name">Buddies Cafe Tea Room</h2>
        <p className="footer__brand-tagline">
          South India's First Specialty Tea Room · Est. 2012
        </p>
      </div>

      {/* ── About Us (Only on Home Page) ── */}
      {isHome && (
        <div className="footer__about">
          <h3 className="footer__about-title">Our Story</h3>
          <p className="footer__about-text">
            After 10 successful years with Buddies Cafe, DANJO TEAs now expands the supply chain to E Platform. Now our buddies can order online the finest tea and brew at home like connoisseurs. We began our journey as Tea Brewer in DANJO TEAS, now we are stretching our hands to give our customers the same fine Tea Experience in his comfortable chair at his home. Mr Nirmal Raj whose inspiration was his loving father Daniel Dhanaseelan (late) who was a renowned tea maker and tea Taster himself! Nirmal's journey with tea began as a kid when his Mom used to take tea stock in a Tea Factory and made his bed with a bunch of warm tea gunny bags! The flavour and aroma of tea leaves revolved around his life. His love for tea made him embark his journey further with Danjo Teas.
          </p>
          <p className="footer__about-text">
            Being the first tea room in southern India, Danjo teas began with just 15 varieties of tea and right now it brews over 150+ varieties of tea from around the world! Every leaf is handpicked from the organic gardens by the farmers who practice Biodynamic cultivation method. Danjo teas sources Tea from the farmers directly from all over the world with utmost love! Nirmal says its love that adds taste to his tea! Every tea served at Danjo teas is freshly brewed by world class tea masters!
          </p>
          
          <div className="footer__about-features">
            <div className="footer__feature">
              <h4>100% Natural</h4>
              <p>Array of Tea at DANJO TEAS are sourced directly from the farmers and finest tea producers in Nilgiris, Darjeeling, Assam. Our herbal teas are sourced from Egypt, Germany and Australia.</p>
            </div>
            <div className="footer__feature">
              <h4>Quality Product</h4>
              <p>Quality and Servers is the major motto of DANJO TEA, Most of the teas at DANJO are picked from the organic farm and Bio Dynamic Cultivation practicing farmers.</p>
            </div>
            <div className="footer__feature">
              <h4>Unique Taste</h4>
              <p>Experience like never before.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="footer__grid">
        {/* Column 1: Brand */}
        <div className="footer__col footer__col--brand">
          <h3 className="footer__col-title">Buddies Cafe</h3>
          <p className="footer__brand-desc">
            A mountain sanctuary for tea lovers. Premium Nilgiris teas, artisanal
            kombucha, and a world-class café experience in Ooty.
          </p>
          <div className="footer__socials">
            <a
              href="https://buddiescafe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
              aria-label="Website"
            >
              <Globe size={18} />
            </a>
            <a
              href={`mailto:${storeEmail}`}
              className="footer__social-link"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
            <a
              href={`tel:${storePhone.replace(/\s+/g, '')}`}
              className="footer__social-link"
              aria-label="Phone"
            >
              <Phone size={18} />
            </a>
            <a
              href="https://maps.google.com/?q=Buddies+Cafe+Ooty"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
              aria-label="Location"
            >
              <MapPin size={18} />
            </a>
          </div>
        </div>

        {/* Column 2: Explore */}
        <div className="footer__col">
          <h3 className="footer__col-title">Explore</h3>
          <ul className="footer__links">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="footer__link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Shop */}
        <div className="footer__col">
          <h3 className="footer__col-title">Shop</h3>
          <ul className="footer__links">
            {shopLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="footer__link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Visit */}
        <div className="footer__col">
          <h3 className="footer__col-title">Visit</h3>
          <ul className="footer__list">
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/faq">FAQs</Link></li>
            <li><Link to="/shipping">Shipping & Returns</Link></li>
            <li><Link to="/track-order">Track Order</Link></li>
          </ul>
        </div>

        {/* Column 5: Newsletter */}
        <div className="footer__col footer__col--newsletter">
          <h3 className="footer__col-title">Stay Connected</h3>
          <p className="footer__newsletter-text">
            Subscribe for exclusive tea stories, seasonal blends, and special offers.
          </p>
          <form className="footer__newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="footer__newsletter-input"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
            />
            <button type="submit" className="footer__newsletter-btn" aria-label="Subscribe">
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="footer__whatsapp">
            <MessageCircle size={16} />
            <span>Chat with us on WhatsApp</span>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="footer__bottom">
        <span className="footer__copyright">
          © 2025 Buddies Cafe Tea Room. All rights reserved.
        </span>
        <div className="footer__legal">
          <Link to="/privacy" className="footer__legal-link">Privacy</Link>
          <Link to="/terms" className="footer__legal-link">Terms</Link>
          <Link to="/shipping" className="footer__legal-link">Shipping</Link>
          <Link to="/refunds" className="footer__legal-link">Refunds</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
