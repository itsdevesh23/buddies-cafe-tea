import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { client } from '../../sanity';
import './FeaturedTeas.css';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
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

export default function FeaturedTeas() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const { addToCart } = useCart();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch(`*[_type == "product"] | order(price desc)[0...6]`).then(res => {
      if (res) {
        setFeatured(res.map(p => ({
          ...p,
          id: p._id,
          slug: p.slug?.current || p.slug
        })));
      }
      setLoading(false);
    }).catch(err => {
      console.error("Sanity fetch error:", err);
      setLoading(false);
    });
  }, []);

  const handleAdd = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
    });
  };

  return (
    <section className="featured-teas" id="featured" ref={sectionRef}>
      <motion.div
        className="featured-teas__container"
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        <motion.span
          className="featured-teas__label"
          variants={headingVariants}
        >
          Featured
        </motion.span>

        <motion.h2
          className="featured-teas__heading"
          variants={headingVariants}
        >
          Handpicked Treasures
        </motion.h2>

        <motion.div
          className="featured-teas__grid"
          variants={containerVariants}
        >
          {loading && (
            <div style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1', padding: '2rem' }}>
              <span style={{ fontSize: '2rem' }}>⏳</span>
              <p>Fetching curated collection...</p>
            </div>
          )}
          {!loading && featured.map((tea) => (
            <motion.div
              key={tea.id}
              className="featured-teas__card glass-panel"
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Accent stripe */}
              <div
                className="featured-teas__card-stripe"
                style={{ background: tea.accentColor }}
              />

              {/* Emoji Icon */}
              <div
                className="featured-teas__card-icon"
                style={{
                  background: `${tea.accentColor}22`,
                }}
              >
                <span>{tea.category === 'Kombucha' ? '🫧' : '🍵'}</span>
              </div>

              {/* Category Tag */}
              <span className="featured-teas__card-category">
                {tea.category}
              </span>

              {/* Name */}
              <Link to={`/product/${tea.slug}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <h3 className="featured-teas__card-name">{tea.name}</h3>
              </Link>

              {/* Description */}
              <p className="featured-teas__card-desc">{tea.description}</p>

              {/* Footer */}
              <div className="featured-teas__card-footer">
                <span className="featured-teas__card-price">
                  ₹{tea.price}
                </span>
                {tea.inStock === false ? (
                  <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                    OUT OF STOCK
                  </span>
                ) : (
                  <button
                    className="featured-teas__card-add"
                    onClick={() => handleAdd(tea)}
                    aria-label={`Add ${tea.name} to cart`}
                  >
                    <Plus size={18} strokeWidth={2} />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="featured-teas__bottom"
          variants={headingVariants}
        >
          <Link to="/shop" className="featured-teas__view-all">
            View All Teas →
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
