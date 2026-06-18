import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import Cart from '../Cart/Cart';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { useState } from 'react';
import ChatWidget from '../ChatWidget/ChatWidget';
import CookieBanner from '../CookieBanner/CookieBanner';

export default function Layout() {
  const { items, cartCount, updateQuantity, removeItem, isOpen, setIsOpen } = useCart();
  const { settings, loading } = useSettings() || { settings: null, loading: true };
  const location = useLocation();
  const hasBanner = !loading && settings?.announcement_text;

  if (!loading && settings?.maintenance_mode) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f8fafc', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', color: '#4ade80', marginBottom: '1rem' }}>We're brewing some updates 🍵</h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', lineHeight: '1.6' }}>
          Buddies Cafe is currently undergoing scheduled maintenance to improve your experience. We will be back online shortly.
        </p>
        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
          Are you an admin? <a href="/admin" style={{ color: '#4ade80' }}>Login here</a>
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ position: 'relative', zIndex: 1000 }}>
        {hasBanner && (
          <div style={{ background: '#4ade80', color: '#0f172a', padding: '0.6rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>
            {settings.announcement_text}
          </div>
        )}
        <Navbar cartCount={cartCount} onCartClick={() => setIsOpen(true)} hasBanner={hasBanner} />
      </div>
      <AnimatePresence mode="wait">
        <main key={location.pathname}>
          <Outlet />
        </main>
      </AnimatePresence>
      <Footer />
      <ChatWidget />
      <CookieBanner />
      <Cart
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
      />
    </>
  );
}
