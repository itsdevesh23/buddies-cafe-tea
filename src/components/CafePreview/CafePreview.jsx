import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Wifi,
  Coffee,
  BookOpen,
  Plug,
  Mountain,
  UtensilsCrossed,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';
import './CafePreview.css';

const features = [
  { icon: Wifi, label: 'Free High-Speed WiFi' },
  { icon: Coffee, label: '100+ Tea Varieties' },
  { icon: BookOpen, label: 'Reading Corner' },
  { icon: Plug, label: 'Power Outlets' },
  { icon: Mountain, label: 'Mountain Views' },
  { icon: UtensilsCrossed, label: 'Tea & Food Pairings' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const featureVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay: 0.3 + i * 0.08, ease: 'easeOut' },
  }),
};

const decorVariants = {
  hidden: { opacity: 0, scale: 0.9, x: 60 },
  visible: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.9, ease: 'easeOut' } },
};

const CafePreview = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section className="cafe" ref={sectionRef}>
      <div className="cafe__container">
        {/* ── Left: Content ── */}
        <motion.div
          className="cafe__content"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.span className="cafe__label" variants={fadeUp}>
            The Space
          </motion.span>

          <motion.h2 className="cafe__heading" variants={fadeUp}>
            A Mountain Sanctuary
          </motion.h2>

          <motion.p className="cafe__body" variants={fadeUp}>
            Nestled in the heart of Ooty, Buddies Cafe is where cozy wooden interiors
            meet mountain-fresh air. Work remotely with free WiFi, lose yourself in a
            book, or simply watch the mist roll in.
          </motion.p>

          <div className="cafe__features">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.label}
                  className="cafe__feature glass-panel"
                  custom={i}
                  variants={featureVariants}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                >
                  <div className="cafe__feature-icon">
                    <Icon size={20} />
                  </div>
                  <span className="cafe__feature-label">{feat.label}</span>
                </motion.div>
              );
            })}
          </div>

          <motion.div className="cafe__location" variants={fadeUp}>
            <div className="cafe__location-row">
              <MapPin size={15} />
              <span>Garden Road, Pudumund, Ooty</span>
            </div>
            <div className="cafe__location-row">
              <Clock size={15} />
              <span>Open Daily 8:00 AM – 9:00 PM</span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Link to="/cafe" className="cafe__cta btn-primary">
              Visit the Café
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Right: Decorative ── */}
        <motion.div
          className="cafe__decor"
          variants={decorVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <div className="cafe__decor-block">
            <div className="cafe__decor-inner">
              <span className="cafe__decor-text">Buddies Cafe</span>
              <span className="cafe__decor-sub">Ooty · Nilgiris</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CafePreview;
