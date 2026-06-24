import React from 'react';
import PageTransition from '../../components/PageTransition/PageTransition';
import BrewingGuide from '../../components/BrewingGuide/BrewingGuide';
import { motion } from 'framer-motion';

const BrewingGuidePage = () => {
  return (
    <PageTransition>
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#0f172a' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', color: '#f8fafc', marginBottom: '1.5rem' }}
          >
            The Art of Brewing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6' }}
          >
            Brewing tea is an ancient art that requires patience and precision. Different types of tea leaves require specific temperatures and steeping times to extract their perfect flavor profiles without bitterness. Use our master guide below to elevate your daily tea ritual.
          </motion.p>
        </div>
        <BrewingGuide />
      </div>
    </PageTransition>
  );
};

export default BrewingGuidePage;
