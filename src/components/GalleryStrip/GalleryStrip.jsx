import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import teaCeremonyImg from '../../assets/tea_ceremony.png';
import kombuchaImg from '../../assets/kombucha_product.png';
import './GalleryStrip.css';

const tiles = [
  { type: 'image', src: teaCeremonyImg, alt: 'Tea ceremony at Buddies Cafe', label: 'The Ceremony' },
  {
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #1a3d24, #2d5a36, #4A5D23)',
    label: 'Morning Mist',
  },
  { type: 'image', src: kombuchaImg, alt: 'Artisanal kombucha', label: 'Our Kombucha' },
  {
    type: 'gradient',
    gradient: 'linear-gradient(160deg, #0A1A12, #1e4a2a, #7C9A5E)',
    label: 'The Pour',
  },
  {
    type: 'gradient',
    gradient: 'linear-gradient(145deg, #2d5a36, #4A5D23, #8BC34A)',
    label: 'Tea Gardens',
  },
  {
    type: 'gradient',
    gradient: 'linear-gradient(170deg, #122418, #3a5c2e, #6b8f4e)',
    label: 'Our Blends',
  },
  {
    type: 'gradient',
    gradient: 'linear-gradient(130deg, #1a2f1e, #4A5D23, #D4A853)',
    label: 'The Ritual',
  },
  {
    type: 'gradient',
    gradient: 'linear-gradient(155deg, #0d2818, #1e5030, #7C9A5E)',
    label: 'Mountain Air',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const tileVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: 0.2 + i * 0.07, ease: 'easeOut' },
  }),
};

const GalleryStrip = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section className="gallery" ref={sectionRef}>
      <motion.div
        className="gallery__header"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <motion.span className="gallery__label" variants={fadeUp}>
          Gallery
        </motion.span>
        <motion.h2 className="gallery__heading" variants={fadeUp}>
          Moments at Buddies
        </motion.h2>
      </motion.div>

      <div className="gallery__scroll-container">
        <div className="gallery__strip">
          {tiles.map((tile, i) => (
            <motion.div
              key={i}
              className="gallery__tile"
              custom={i}
              variants={tileVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <div className="gallery__tile-inner">
                {tile.type === 'image' ? (
                  <img
                    src={tile.src}
                    alt={tile.alt}
                    className="gallery__tile-image"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="gallery__tile-gradient"
                    style={{ background: tile.gradient }}
                  />
                )}
                <div className="gallery__tile-overlay">
                  <span className="gallery__tile-label">{tile.label}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="gallery__cta-wrap"
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <Link to="/gallery" className="gallery__cta">
          View Full Gallery
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>
  );
};

export default GalleryStrip;
