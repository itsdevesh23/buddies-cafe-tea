import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import './CategoryShowcase.css';

const CATEGORIES = [
  { name: 'Milked Tea', emoji: '☕', slug: 'MILKED TEA' },
  { name: 'Black Tea', emoji: '🫖', slug: 'BLACK TEA' },
  { name: 'White Tea', emoji: '🤍', slug: 'WHITE TEA' },
  { name: 'Green Teas', emoji: '🍵', slug: 'GREEN TEAS' },
  { name: 'Oolong Tea', emoji: '🌿', slug: 'OOLONG TEA' },
  { name: 'Herbal Infusion', emoji: '🌸', slug: 'HERBAL INFUSION' },
  { name: 'Flavoured Tea', emoji: '🍫', slug: 'FLAVOURED TEA' },
  { name: 'Fruit Infusion', emoji: '🍓', slug: 'FRUIT BASED INFUSION' },
  { name: 'Coffee', emoji: '☕', slug: 'COFFEE' },
  { name: 'Spices', emoji: '🌶️', slug: 'SPICES' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function CategoryShowcase() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section
      className="category-showcase"
      id="categories"
      ref={sectionRef}
    >
      <motion.div
        className="category-showcase__container"
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        <motion.span
          className="category-showcase__label"
          variants={headingVariants}
        >
          The Collection
        </motion.span>

        <motion.h2
          className="category-showcase__heading"
          variants={headingVariants}
        >
          Explore Our World of Tea
        </motion.h2>

        <motion.div
          className="category-showcase__grid"
          variants={containerVariants}
        >
          {CATEGORIES.map((cat) => (
            <motion.div
              key={cat.name}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <Link
                to={`/shop?category=${encodeURIComponent(cat.slug)}`}
                className="category-showcase__card glass-panel"
              >
                <span className="category-showcase__card-emoji">
                  {cat.emoji}
                </span>
                <span className="category-showcase__card-name">
                  {cat.name}
                </span>
                <span className="category-showcase__card-cta">
                  Explore →
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
