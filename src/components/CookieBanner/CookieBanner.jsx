import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (accepted) => {
    localStorage.setItem('cookie_consent', accepted ? 'accepted' : 'declined');
    setIsVisible(false);
    
    // In a real app, you would initialize or disable analytics here
    // based on the `accepted` value.
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            right: '20px',
            maxWidth: '600px',
            margin: '0 auto',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            color: '#f8fafc'
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#4ade80' }}>We value your privacy</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: '#cbd5e1' }}>
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => handleConsent(false)}
              style={{
                background: 'transparent',
                border: '1px solid #475569',
                color: '#cbd5e1',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Reject All
            </button>
            <button
              onClick={() => handleConsent(true)}
              style={{
                background: '#4ade80',
                border: 'none',
                color: '#0f172a',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              Accept All
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
