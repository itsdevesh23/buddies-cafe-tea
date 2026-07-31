import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, ChevronRight, Star, Coffee, Thermometer, Clock, Leaf } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';
import PageTransition from '../../components/PageTransition/PageTransition';
import BrewingGuide from '../../components/BrewingGuide/BrewingGuide';
import { client, urlFor } from '../../sanity';
import SEO from '../../components/SEO/SEO';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { settings } = useSettings() || { settings: {} };
  
  const [sanityProduct, setSanityProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [packWeight, setPackWeight] = useState(0);
  
  useEffect(() => {
    setLoading(true);
    client.fetch(`*[_type == "product" && slug.current == $slug][0]`, { slug }).then(res => {
      if (res) {
        setSanityProduct({
          ...res,
          id: res._id,
          slug: res.slug?.current || res.slug
        });
        const cwStr = res.customBulkWeights || '50, 100, 150, 200, 250';
        const cwList = cwStr.split(',').map(s => parseInt(s.trim())).filter(w => !isNaN(w));
        setPackWeight(res.moq > 20 ? (cwList[0] || 50) : (res.moq || 1));
        setQty(1);
        
        // Fetch related products
        client.fetch(`*[_type == "product" && subcategory == $subcategory && _id != $id][0...4]`, { 
          subcategory: res.subcategory || '', 
          id: res._id 
        }).then(relRes => {
          setRelated(relRes.map(p => ({...p, id: p._id, slug: p.slug?.current || p.slug})));
          setLoading(false);
        }).catch(err => {
          console.error("Related fetch error:", err);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch(err => {
      console.error("Sanity error:", err);
      setLoading(false);
    });
  }, [slug]);

  const product = sanityProduct;

  if (loading) {
    return (
      <PageTransition>
        <div className="pdp-notfound">
          <h2>Brewing your tea...</h2>
        </div>
      </PageTransition>
    );
  }

  if (!product) {
    return (
      <PageTransition>
        <div className="pdp-notfound">
          <h2>Tea not found</h2>
          <Link to="/shop" className="btn-primary">Back to Shop</Link>
        </div>
      </PageTransition>
    );
  }

  const moq = product.moq || 250;
  const packPrice = Math.round((product.price / moq) * packWeight);
  const packMrp = product.mrp ? Math.round((product.mrp / moq) * packWeight) : null;
  
  const customWeightsString = product.customBulkWeights || '50, 100, 150, 200, 250';
  const customWeights = customWeightsString.split(',').map(s => parseInt(s.trim())).filter(w => !isNaN(w));
  
  const availablePacks = moq > 20 ? customWeights : [moq];

  return (
    <PageTransition>
      <SEO 
        title={`${product.name} | Danjo Teas`} 
        description={product.description || `Buy ${product.name} at Danjo Teas.`} 
        image={product.image}
        url={`/product/${slug}`}
      />
      <section className="pdp">
        {/* Breadcrumb */}
        <nav className="pdp__breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop">Shop</Link>
          <ChevronRight size={14} />
          <Link to={`/shop?category=${encodeURIComponent(product.subcategory || 'Tea')}`}>{product.subcategory || 'Tea'}</Link>
          <ChevronRight size={14} />
          <span>{product.name}</span>
        </nav>

        <div className="pdp__main">
          {/* Image / Visual */}
          <motion.div
            className="pdp__visual"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div
              className="pdp__image-block"
              style={{ background: product.image ? 'transparent' : `linear-gradient(135deg, ${product.accentColor}22, ${product.accentColor}08)`, position: 'relative' }}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            >
              {/* Invisible overlay to block direct image interaction */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}></div>
              
              {product.image ? (
                <img 
                  src={urlFor(product.image).width(800).url()} 
                  alt={product.name} 
                  className="pdp__real-image" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px', pointerEvents: 'none', userSelect: 'none' }}
                />
              ) : (
                <span className="pdp__image-emoji">{product.subcategory === 'Kombucha' ? '🫧' : '🍵'}</span>
              )}
              {product.tags && product.tags[0] && (
                <span className="pdp__badge">{product.tags[0]}</span>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            className="pdp__details"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <span className="pdp__category">{product.subcategory || 'Tea'}</span>
            <h1 className="pdp__name">{product.name}</h1>
            <div className="pdp__rating">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              <span>5.0 · 24 reviews</span>
            </div>
            <p className="pdp__price">
              {packMrp > packPrice && (
                <span style={{textDecoration: 'line-through', opacity: 0.6, fontSize: '1.2rem', marginRight: '10px', fontWeight: 'normal'}}>
                  ₹{packMrp}
                </span>
              )}
              ₹{Math.round(packPrice)} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 'normal' }}>(including GST)</span>
            </p>
            <p className="pdp__desc">{product.description}</p>

            {/* Tasting & Aroma */}
            {(product.tastingNotes || product.aroma || product.brewTemp || product.steepTime) && (
              <div className="pdp__meta-grid">
                {product.tastingNotes && (
                  <div className="pdp__meta-item">
                    <Coffee size={16} />
                    <div>
                      <span className="pdp__meta-label">Tasting Notes</span>
                      <span className="pdp__meta-value">{product.tastingNotes}</span>
                    </div>
                  </div>
                )}
                {product.aroma && (
                  <div className="pdp__meta-item">
                    <Leaf size={16} />
                    <div>
                      <span className="pdp__meta-label">Aroma</span>
                      <span className="pdp__meta-value">{product.aroma}</span>
                    </div>
                  </div>
                )}
                {product.brewTemp && (
                  <div className="pdp__meta-item">
                    <Thermometer size={16} />
                    <div>
                      <span className="pdp__meta-label">Brew Temperature</span>
                      <span className="pdp__meta-value">{product.brewTemp}</span>
                    </div>
                  </div>
                )}
                {product.steepTime && (
                  <div className="pdp__meta-item">
                    <Clock size={16} />
                    <div>
                      <span className="pdp__meta-label">Steep Time</span>
                      <span className="pdp__meta-value">{product.steepTime}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="pdp__origin glass-panel">
              <span className="pdp__origin-label">Pack Size</span>
              <span className="pdp__origin-value">
                {moq > 20 ? (packWeight >= 1000 ? `${packWeight / 1000} kg` : `${packWeight} gms`) : `${packWeight} Unit`}
              </span>
              <span className="pdp__origin-sub">Quantity of 1 pack</span>
            </div>

            {/* Weight Presets (Only show for bulk teas in grams, not unit items) */}
            {moq > 20 && (
              <div className="pdp__weight-presets">
                <span className="pdp__weight-presets-label">Quick Select Pack Size:</span>
                <div className="pdp__weight-presets-buttons">
                  {availablePacks.map(w => (
                    <button 
                      key={w}
                      className={`pdp__weight-preset-btn ${packWeight === w ? 'pdp__weight-preset-btn--active' : ''}`}
                      onClick={() => { setPackWeight(w); setQty(1); }}
                    >
                      {w >= 1000 ? `${w / 1000} kg` : `${w} gms`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div className="pdp__actions">
              <div className="pdp__qty-control">
                <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={product.inStock === false}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(qty + 1)} disabled={product.inStock === false}>+</button>
              </div>
              <motion.button
                className={`btn-primary pdp__add-btn ${product.inStock === false ? 'out-of-stock-btn' : ''}`}
                style={product.inStock === false ? { background: '#334155', color: '#94a3b8', cursor: 'not-allowed' } : {}}
                whileHover={product.inStock === false ? {} : { scale: 1.03 }}
                whileTap={product.inStock === false ? {} : { scale: 0.97 }}
                onClick={() => {
                  if (product.inStock !== false) {
                    addToCart({
                      ...product,
                      id: `${product.id}-${packWeight}`,
                      originalId: product.id,
                      name: `${product.name} (${packWeight >= 1000 ? packWeight/1000 + ' kg' : packWeight + ' gms'})`,
                      price: packPrice,
                      packWeight: packWeight,
                      quantity: qty
                    });
                  }
                }}
              >
                <ShoppingBag size={16} />
                {product.inStock === false ? 'OUT OF STOCK' : `Add to Cart · ₹${Math.round(packPrice * qty)}`}
              </motion.button>
              <button
                className={`pdp__wishlist-btn ${isInWishlist(product.id) ? 'pdp__wishlist-btn--active' : ''}`}
                onClick={() => toggleWishlist(product)}
              >
                <Heart size={18} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="pdp__benefits">
                <h4>Benefits</h4>
                <div className="pdp__benefits-list">
                  {product.benefits.map((b, i) => (
                    <span key={i} className="pdp__benefit-pill">{b}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Pairings */}
            {product.pairings && product.pairings.length > 0 && (
              <div className="pdp__pairings">
                <h4>Pairs Well With</h4>
                <p>{product.pairings.join(' · ')}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="pdp__related">
            <h3>You May Also Like</h3>
            <div className="pdp__related-grid">
              {related.map((p) => (
                <Link key={p.id} to={`/product/${p.slug}`} className="pdp__related-card glass-panel">
                  <span className="pdp__related-emoji">🍵</span>
                  <span className="pdp__related-name">{p.name}</span>
                  <span className="pdp__related-price">₹{p.price}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Brewing Guide Injection */}
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <BrewingGuide />
        </div>
      </section>
    </PageTransition>
  );
}
