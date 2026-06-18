import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import kombuchaImg from '../../assets/kombucha_product.png';
import { client } from '../../sanity';
import './KombuchaSpotlight.css';

const baseColors = ['#A8B77E', '#8BC34A', '#CDDC39', '#FFD54F', '#9C6ADE', '#EF5350'];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9, x: 60 },
  visible: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const pillVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay: 0.4 + i * 0.08, ease: 'easeOut' },
  }),
};

const KombuchaSpotlight = () => {
  const sectionRef = React.useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [flavors, setFlavors] = React.useState([]);

  React.useEffect(() => {
    client.fetch(`*[_type == "product" && category == "Kombucha"] | order(name asc) { name, slug }`)
      .then(res => {
        if (res && res.length > 0) {
          const fetchedFlavors = res.map((p, i) => ({
            name: p.name,
            color: baseColors[i % baseColors.length],
            slug: p.slug?.current || p.slug
          }));
          setFlavors(fetchedFlavors);
        } else {
          // Fallback if none exist
          setFlavors([
            { name: 'Raw', color: '#A8B77E' },
            { name: 'Lime', color: '#8BC34A' },
            { name: 'Ginger Lime', color: '#CDDC39' },
            { name: 'Pineapple', color: '#FFD54F' }
          ]);
        }
      })
      .catch(err => console.error("Error fetching kombucha:", err));
  }, []);

  return (
    <section className="kombucha" ref={sectionRef}>
      <div className="kombucha__glow kombucha__glow--left" />
      <div className="kombucha__glow kombucha__glow--right" />

      <div className="kombucha__container">
        <motion.div
          className="kombucha__content"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.div className="kombucha__label" variants={itemVariants}>
            <Sparkles size={14} />
            <span>Buddies Kombucha</span>
          </motion.div>

          <motion.h2 className="kombucha__heading" variants={itemVariants}>
            Alive. Fermented.<br />Extraordinary.
          </motion.h2>

          <motion.p className="kombucha__body" variants={itemVariants}>
            Handcrafted in small batches, our kombucha is naturally fermented,
            probiotic-rich, and bursting with life. Made from premium Nilgiris tea
            with natural carbonation.
          </motion.p>

          <motion.div className="kombucha__flavors" variants={itemVariants}>
            {flavors.map((flavor, i) => (
              <Link to={`/product/${flavor.slug}`} key={flavor.name} style={{ textDecoration: 'none' }}>
                <motion.span
                  className="kombucha__pill"
                  style={{
                    '--pill-color': flavor.color,
                    borderColor: `${flavor.color}60`,
                    color: flavor.color,
                    cursor: 'pointer'
                  }}
                  custom={i}
                  variants={pillVariants}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: `${flavor.color}20`,
                    borderColor: flavor.color,
                  }}
                >
                  {flavor.name}
                </motion.span>
              </Link>
            ))}
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link to="/kombucha" className="kombucha__cta btn-primary">
              Discover Kombucha
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="kombucha__image-col"
          variants={imageVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <div className="kombucha__image-glow" />
          <img
            src={kombuchaImg}
            alt="Artisanal kombucha bottle by Buddies Cafe"
            className="kombucha__image"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default KombuchaSpotlight;
