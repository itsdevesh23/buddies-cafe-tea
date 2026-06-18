import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import './TastingCTA.css';

const details = [
  '₹3,500 for 4 guests',
  'Hosted by Nirmal Raj',
  'By Reservation Only',
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const TastingCTA = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section className="tasting" ref={sectionRef}>
      <div className="tasting__bg-overlay" />
      <div className="tasting__noise" />

      <motion.div
        className="tasting__content"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <motion.div className="tasting__label" variants={fadeUp}>
          <Star size={14} />
          <span>Exclusive Experience</span>
        </motion.div>

        <motion.h2 className="tasting__heading" variants={fadeUp}>
          The Tea Tasting Ritual
        </motion.h2>

        <motion.p className="tasting__subheading" variants={fadeUp}>
          A 2–3 hour intimate journey through 4–6 premium Nilgiris teas
        </motion.p>

        <motion.div className="tasting__details" variants={fadeUp}>
          {details.map((detail, i) => (
            <span key={i} className="tasting__pill glass-panel">
              {detail}
            </span>
          ))}
        </motion.div>

        <motion.p className="tasting__body" variants={fadeUp}>
          Paired with artisanal chocolates and curated food, this is more than a
          tasting — it's a sensory masterclass in Nilgiris tea heritage.
        </motion.p>

        <motion.div variants={fadeUp}>
          <Link to="/booking" className="tasting__cta btn-primary">
            Reserve Your Experience
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TastingCTA;
