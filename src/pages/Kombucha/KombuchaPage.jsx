import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Zap, Shield, RefreshCw } from 'lucide-react';
import PageTransition from '../../components/PageTransition/PageTransition';
import { useCart } from '../../context/CartContext';
import { client } from '../../sanity';
import './KombuchaPage.css';

const baseColors = ['#F5DEB3', '#D4E157', '#FFCA28', '#FFEB3B', '#AB47BC', '#EF5350'];

const KombuchaPage = () => {
  let addToCart = () => {};
  try {
    const cart = useCart();
    addToCart = cart?.addToCart || (() => {});
  } catch (e) {
    // Fallback if context not found
  }

  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    client.fetch('*[_type == "product" && category == "Kombucha"] | order(name asc)').then(res => {
      if (res && res.length > 0) {
        const mapped = res.map((p, i) => ({
          ...p,
          id: p._id,
          slug: p.slug?.current || p.slug,
          color: baseColors[i % baseColors.length]
        }));
        setProducts(mapped);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <PageTransition>
      <div className="kombucha-page">
        <section className="kombucha-hero">
          <div className="kombucha-hero__overlay"></div>
          <motion.div 
            className="kombucha-hero__content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="kombucha-hero__title">Buddies Kombucha</h1>
            <p className="kombucha-hero__subtitle">Alive. Fermented. Extraordinary.</p>
          </motion.div>
        </section>

        <section className="kombucha-products">
          <div className="container">
            <div className="products-grid">
              {loading ? (
                <div style={{ textAlign: 'center', width: '100%', padding: '2rem', color: '#f8fafc' }}>Loading Kombucha...</div>
              ) : products.map((flavor, index) => (
                <motion.div 
                  key={flavor.id} 
                  className="product-card glass-panel"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <div className="product-card__image-placeholder" style={{ background: `radial-gradient(circle, ${flavor.color}55 0%, transparent 70%)` }}>
                    {/* Add actual Sanity image mapping if needed, fallback to asset placeholder */}
                  </div>
                  <h3 className="product-card__title">{flavor.name}</h3>
                  <p className="product-card__price">₹{flavor.price}</p>
                  
                  {flavor.inStock === false ? (
                    <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.9rem', fontWeight: 'bold', padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', marginTop: '1rem' }}>
                      OUT OF STOCK
                    </div>
                  ) : (
                    <button className="btn-primary product-card__btn" onClick={() => addToCart(flavor)}>
                      <ShoppingCart size={18} /> Add to Cart
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="kombucha-benefits">
          <div className="container">
            <h2 className="section-title">Why Kombucha?</h2>
            <div className="benefits-grid">
              <div className="benefit-card glass-panel">
                <Heart className="benefit-icon" />
                <h3>Gut Health</h3>
                <p>Rich in probiotics that support a healthy digestive system.</p>
              </div>
              <div className="benefit-card glass-panel">
                <Zap className="benefit-icon" />
                <h3>Natural Energy</h3>
                <p>A gentle lift without the crash, thanks to b-vitamins and enzymes.</p>
              </div>
              <div className="benefit-card glass-panel">
                <Shield className="benefit-icon" />
                <h3>Immune Support</h3>
                <p>Packed with antioxidants to help defend your body.</p>
              </div>
              <div className="benefit-card glass-panel">
                <RefreshCw className="benefit-icon" />
                <h3>Detox</h3>
                <p>Supports liver function and healthy detoxification.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default KombuchaPage;
