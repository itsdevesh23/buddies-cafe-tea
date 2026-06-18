import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Heart, User } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import './Navbar.css';

export default function Navbar({ cartCount, onCartClick, hasBanner }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { items: wishlistItems } = useWishlist();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const links = [
    { label: 'Our Blends', to: '/shop' },
    { label: 'Heritage', to: '/heritage' },
    { label: 'Tasting', to: '/tasting' },
    { label: 'Café', to: '/cafe' },
    { label: 'Journal', to: '/journal' },
  ];

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-text">Buddies Cafe</span>
        </Link>

        <div className="navbar__links-pill">
          {links.map((link) => (
            <Link
              key={link.to + link.label}
              to={link.to}
              className={`navbar__link ${location.pathname === link.to ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar__actions">
          <Link to="/account" className="navbar__icon-btn" aria-label="Account Login">
            <User size={19} />
          </Link>

          <Link to="/account?tab=wishlist" className="navbar__icon-btn" aria-label="Wishlist">
            <Heart size={19} />
            {wishlistItems.length > 0 && (
              <span className="navbar__badge">{wishlistItems.length}</span>
            )}
          </Link>

          <button
            className="navbar__icon-btn"
            onClick={onCartClick}
            aria-label="Open cart"
            id="cart-toggle"
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <motion.span
                className="navbar__badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={cartCount}
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          <button
            className="navbar__menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar__mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {links.map((link) => (
              <Link
                key={link.to + link.label}
                to={link.to}
                className="navbar__mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/contact" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
