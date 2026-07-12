import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShoppingBag, Plus } from 'lucide-react';
import './ProductGrid.css';

const PRODUCTS = [
  {
    id: 1,
    name: 'Nilgiris Orthodox Gold',
    category: 'Single-Origin',
    price: 599,
    tag: 'Bestseller',
    description: 'Rich muscatel notes from high-altitude estates',
    color: '#4A5D23',
  },
  {
    id: 2,
    name: 'Misty Peak Green',
    category: 'Handcrafted',
    price: 499,
    tag: 'New',
    description: 'Delicate, floral with a sweet vegetal finish',
    color: '#7C9A5E',
  },
  {
    id: 3,
    name: 'Wild Berry Kombucha',
    category: 'Kombucha',
    price: 349,
    tag: 'Popular',
    description: 'Probiotic-rich, naturally fermented tea',
    color: '#8B4A6B',
  },
  {
    id: 4,
    name: 'Chamomile Lavender Tisane',
    category: 'Herbal / Tisane',
    price: 449,
    tag: null,
    description: 'Caffeine-free calm in every cup',
    color: '#9A8A5E',
  },
  {
    id: 5,
    name: 'Frost Mountain Oolong',
    category: 'Artisanal',
    price: 749,
    tag: 'Premium',
    description: 'Rolled leaves, complex floral & creamy body',
    color: '#5E7A6A',
  },
  {
    id: 6,
    name: 'Spiced Chai Masala',
    category: 'Specialty Blend',
    price: 399,
    tag: null,
    description: 'Bold CTC tea with whole Nilgiris spices',
    color: '#7A5E3E',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function ProductGrid({ onAddToCart }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="products" id="shop" ref={ref}>
      <div className="products__glow" />

      <div className="products__header">
        <motion.span
          className="products__label"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          The Collection
        </motion.span>
        <motion.h2
          className="products__heading"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Handpicked <span className="products__heading--accent">Treasures</span>
        </motion.h2>
        <motion.p
          className="products__subheading"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Curated from the finest Nilgiris gardens, each blend is a journey.
        </motion.p>
      </div>

      <div className="products__grid">
        {PRODUCTS.map((product, i) => (
          <motion.div
            key={product.id}
            className="product-card glass-panel"
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            {/* Color accent stripe */}
            <div
              className="product-card__accent"
              style={{ background: `linear-gradient(135deg, ${product.color}, transparent)` }}
            />

            {product.tag && (
              <span className="product-card__tag">{product.tag}</span>
            )}

            <div className="product-card__icon-area">
              <div
                className="product-card__icon-circle"
                style={{ background: `${product.color}22`, borderColor: `${product.color}44` }}
              >
                <span style={{ fontSize: '1.8rem' }}>🍵</span>
              </div>
            </div>

            <div className="product-card__info">
              <span className="product-card__category">{product.category}</span>
              <h3 className="product-card__name">{product.name}</h3>
              <p className="product-card__desc">{product.description}</p>
            </div>

            <div className="product-card__footer">
              <span className="product-card__price">
                ₹{product.price} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'normal', marginLeft: '4px' }}>(incl. GST)</span>
              </span>
              <motion.button
                className="product-card__add-btn"
                onClick={() => onAddToCart(product)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Add ${product.name} to cart`}
              >
                <Plus size={18} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
