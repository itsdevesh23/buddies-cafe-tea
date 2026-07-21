import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Mountain, Droplets, Sun } from 'lucide-react';
import PageTransition from '../../components/PageTransition/PageTransition';
import SEO from '../../components/SEO/SEO';
import './HeritagePage.css';

const HeritagePage = () => {
  return (
    <PageTransition>
      <SEO title="Our Heritage | The Danjo Teas Story" url="/heritage" />
      <div className="heritage-page">
        <section className="heritage-hero">
          <motion.div 
            className="heritage-hero__content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <h1 className="heritage-hero__title">Nilgiris Heritage</h1>
            <p className="heritage-hero__subtitle">Cultivated at 6,500ft. Steeped in history.</p>
          </motion.div>
        </section>

        <section className="terroir-section">
          <div className="container">
            <div className="terroir-content glass-panel">
              <h2 className="section-title">The Blue Mountain Terroir</h2>
              <p>
                The Nilgiris, or "Blue Mountains," offer a unique microclimate for tea cultivation. At an elevation of 6,500 feet, the crisp mountain air, distinct dry spells, and nutrient-rich soil coalesce to produce teas that are intensely aromatic, brisk, and exquisitely smooth. We honor a legacy that dates back over a century, preserving the delicate balance of nature in every harvest.
              </p>
            </div>
          </div>
        </section>

        <section className="timeline-section">
          <div className="container">
            <h2 className="section-title text-center">Our Sourcing Journey</h2>
            <div className="timeline">
              <motion.div className="timeline-item" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="timeline-icon"><Mountain /></div>
                <div className="timeline-content glass-panel">
                  <h3>The Gardens</h3>
                  <p>Sourced from high-elevation estates in the Nilgiris where the air is pure and the soil is rich.</p>
                </div>
              </motion.div>
              <motion.div className="timeline-item" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="timeline-icon"><Leaf /></div>
                <div className="timeline-content glass-panel">
                  <h3>The Harvest</h3>
                  <p>Hand-plucked selectively, choosing only the finest two leaves and a bud for maximum flavor.</p>
                </div>
              </motion.div>
              <motion.div className="timeline-item" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="timeline-icon"><Sun /></div>
                <div className="timeline-content glass-panel">
                  <h3>The Craft</h3>
                  <p>Processed using orthodox methods, allowing the leaves to wither and oxidize naturally.</p>
                </div>
              </motion.div>
              <motion.div className="timeline-item" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="timeline-icon"><Droplets /></div>
                <div className="timeline-content glass-panel">
                  <h3>The Cup</h3>
                  <p>Brewed with precision in our cafe, delivering the authentic taste of the Nilgiris to you.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="ethics-section">
          <div className="container">
            <div className="ethics-grid">
              <div className="ethics-card glass-panel">
                <Leaf className="ethics-icon" size={40} />
                <h3>Biodynamic Practices</h3>
                <p>We work with estates that treat their farms as living organisms, fostering biodiversity and soil health.</p>
              </div>
              <div className="ethics-card glass-panel">
                <Sun className="ethics-icon" size={40} />
                <h3>Fairtrade Commitment</h3>
                <p>Ensuring that the skilled hands who pluck our teas are fairly compensated and their communities thrive.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default HeritagePage;
