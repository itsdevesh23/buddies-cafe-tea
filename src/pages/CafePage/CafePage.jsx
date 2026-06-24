import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, BookOpen, BatteryCharging, Mountain, Coffee, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../../components/PageTransition/PageTransition';
import buddiesLogo from '../../assets/BuddiesLogo.jpg';
import './CafePage.css';

const CafePage = () => {
  return (
    <PageTransition>
      <div className="cafe-page">
        <section className="cafe-hero">
          <div className="cafe-hero__overlay"></div>
          <motion.div 
            className="cafe-hero__content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img src={buddiesLogo} alt="Buddies Cafe" style={{ height: '100px', marginBottom: '1.5rem', borderRadius: '8px', objectFit: 'contain' }} />
            <h1 className="cafe-hero__title">The Buddies Cafe Experience</h1>
            <p className="cafe-hero__subtitle">Find us at Garden Road, Pudumund, Ooty</p>
          </motion.div>
        </section>

        <section className="cafe-description">
          <div className="container">
            <div className="description-content glass-panel">
              <h2 className="section-title">A Sanctuary in the Hills</h2>
              <p>Nestled in the lush hills of Ooty, Buddies Cafe is more than just a tea room. It's a retreat designed for connection, reflection, and the pure appreciation of artisanal brews. With the misty Nilgiri mountains as our backdrop, every sip here tells a story.</p>
            </div>
          </div>
        </section>

        <section className="cafe-features">
          <div className="container">
            <div className="features-grid">
              <div className="feature-item">
                <Wifi className="feature-icon" />
                <h3>Free WiFi</h3>
              </div>
              <div className="feature-item">
                <Coffee className="feature-icon" />
                <h3>100+ Teas</h3>
              </div>
              <div className="feature-item">
                <BookOpen className="feature-icon" />
                <h3>Reading Corner</h3>
              </div>
              <div className="feature-item">
                <BatteryCharging className="feature-icon" />
                <h3>Power Outlets</h3>
              </div>
              <div className="feature-item">
                <Mountain className="feature-icon" />
                <h3>Mountain Views</h3>
              </div>
            </div>
          </div>
        </section>

        <section className="cafe-menu-highlights">
          <div className="container">
            <h2 className="section-title">Menu Highlights</h2>
            <div className="menu-grid">
              <motion.div className="menu-block glass-panel" whileHover={{ scale: 1.02 }}>
                <h3>Signature Nilgiri White</h3>
                <p>Delicate, floral, hand-plucked silver tips. Served in glass teapots.</p>
              </motion.div>
              <motion.div className="menu-block glass-panel" whileHover={{ scale: 1.02 }}>
                <h3>Buddies Kombucha Flights</h3>
                <p>A tasting board of 4 seasonal kombucha flavors.</p>
              </motion.div>
              <motion.div className="menu-block glass-panel" whileHover={{ scale: 1.02 }}>
                <h3>Artisanal Sandwiches</h3>
                <p>Freshly baked sourdough, local cheeses, and organic greens.</p>
              </motion.div>
              <motion.div className="menu-block glass-panel" whileHover={{ scale: 1.02 }}>
                <h3>Matcha Pastries</h3>
                <p>Decadent matcha-infused delights baked fresh daily.</p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="cafe-location">
          <div className="container">
            <div className="location-wrapper glass-panel">
              <div className="location-info">
                <h2>Visit Us</h2>
                <a href="https://maps.app.goo.gl/MRVrPEtBnoNxGMJ39" target="_blank" rel="noreferrer" style={{color: 'inherit', display: 'block', marginBottom: '8px'}}><MapPin size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} /> Buddies Cafe, Pudumund</a>
                <a href="https://maps.app.goo.gl/asTAExdsJ7cWboBD7" target="_blank" rel="noreferrer" style={{color: 'inherit', display: 'block', marginBottom: '8px'}}><MapPin size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} /> Commercial Road, Ooty</a>
                <a href="https://maps.app.goo.gl/BG6HAjUA81hPz8SX7" target="_blank" rel="noreferrer" style={{color: 'inherit', display: 'block', marginBottom: '16px'}}><MapPin size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} /> Coonoor Branch</a>
                <p>Open Daily: 10:00 AM - 8:00 PM</p>
                <Link to="/booking" className="btn-primary reserve-btn">
                  Reserve a Table
                </Link>
              </div>
              <div className="map-placeholder">
                <MapPin size={48} className="map-icon" />
                <span>Google Maps View</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default CafePage;
