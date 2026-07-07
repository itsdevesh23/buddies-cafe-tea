import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Heart, Plus, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import PageTransition from '../../components/PageTransition/PageTransition';
import { client, urlFor } from '../../sanity';
import './Shop.css';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [sanityProducts, setSanityProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeCategory = searchParams.get('category') || 'All Teas';
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search, sort]);

  useEffect(() => {
    client.fetch('*[_type == "product"]').then(res => {
      if (res && res.length > 0) {
        // Map sanity fields back to app expectations
        const mapped = res.map(p => ({
          ...p,
          id: p._id,
          slug: p.slug?.current || p.slug
        }));
        setSanityProducts(mapped);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Sanity fetch error:", err);
      setLoading(false);
    });
  }, []);

  const dynamicCategories = useMemo(() => {
    const rawCategories = Array.from(new Set(sanityProducts.map(p => p.subcategory).filter(Boolean)));
    return rawCategories.sort((a, b) => {
      const aIsBrand = a.toUpperCase().startsWith('BRAND') || a.toUpperCase().startsWith('SMALL GROWERS') || a.toUpperCase().startsWith('SILVERMIST');
      const bIsBrand = b.toUpperCase().startsWith('BRAND') || b.toUpperCase().startsWith('SMALL GROWERS') || b.toUpperCase().startsWith('SILVERMIST');
      if (aIsBrand && !bIsBrand) return 1;
      if (!aIsBrand && bIsBrand) return -1;
      
      const aUpper = a.toUpperCase();
      const bUpper = b.toUpperCase();
      
      const getWeight = (cat) => {
        if (cat === 'SPICES') return 2;
        if (cat === 'COFFEE') return 1;
        return 0;
      };

      const weightA = getWeight(aUpper);
      const weightB = getWeight(bUpper);

      if (weightA !== weightB) {
        return weightA - weightB;
      }

      return a.localeCompare(b);
    });
  }, [sanityProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...sanityProducts];
    if (activeCategory !== 'All Teas') {
      result = result.filter((p) => p.subcategory === activeCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.subcategory || '').toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return result;
  }, [activeCategory, search, sort, sanityProducts]);

  const setCategory = (cat) => {
    if (cat === 'All Teas') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <PageTransition>
      <section className="shop-page">
        <div className="shop-page__header">
          <motion.h1
            className="shop-page__title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The <span className="text-gradient-green">Collection</span>
          </motion.h1>
          <p className="shop-page__subtitle">
            {filteredProducts.length} teas curated from the Nilgiris highlands
          </p>
        </div>

        <div className="shop-page__controls">
          <div className="shop-page__search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search teas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="shop-search"
            />
          </div>
          <select
            className="shop-page__sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
          </select>
          <button
            className="shop-page__filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        <div className="shop-page__body">
          <aside className={`shop-page__sidebar ${showFilters ? 'shop-page__sidebar--open' : ''}`}>
            <div className="shop-page__sidebar-header">
              <h3>Categories</h3>
              <button className="shop-page__sidebar-close" onClick={() => setShowFilters(false)}>
                <X size={18} />
              </button>
            </div>
            <button
              className={`shop-page__cat-btn ${activeCategory === 'All Teas' ? 'shop-page__cat-btn--active' : ''}`}
              onClick={() => setCategory('All Teas')}
            >
              All Teas
            </button>
            {dynamicCategories.map((cat) => {
              const danjoCategories = [
                'BLACK TEA', 'DARJEELING SPECIAL', 'ESSENTIAL OILS', 'FLAVOURED TEA',
                'FRUIT BASED INFUSION', 'GREEN TEAS', 'HERBAL INFUSION', 'MILKED TEA',
                'OOLONG TEA', 'WHITE TEA', 'COFFEE', 'SPICES'
              ];
              const displayName = danjoCategories.includes(cat) ? `Danjo - ${cat}` : cat;
              return (
                <button
                  key={cat}
                  className={`shop-page__cat-btn ${activeCategory === cat ? 'shop-page__cat-btn--active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {displayName}
                </button>
              );
            })}
          </aside>

          <div className="shop-page__grid-container">
            <div className="shop-page__grid">
              {(() => {
                const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
                const currentProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

                return (
                  <>
                    {currentProducts.map((product, i) => (
                      <motion.div
                        key={product.id}
                        className="shop-card glass-panel"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        whileHover={{ y: -6 }}
                      >
                        <div
                          className="shop-card__accent"
                          style={{ background: `linear-gradient(135deg, ${product.accentColor}, transparent)` }}
                        />
                        <button
                          className={`shop-card__wishlist ${isInWishlist(product.id) ? 'shop-card__wishlist--active' : ''}`}
                          onClick={() => toggleWishlist(product)}
                          aria-label="Toggle wishlist"
                        >
                          <Heart size={16} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                        </button>
                        {product.tags && product.tags[0] && (
                          <span className="shop-card__tag">{product.tags[0]}</span>
                        )}
                        <div className="shop-card__icon" style={product.image ? { background: 'transparent', padding: 0 } : {}}>
                          {product.image ? (
                            <img 
                              src={urlFor(product.image).width(400).url()} 
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                            />
                          ) : (
                            <span>{product.category === 'Kombucha' ? '🫧' : '🍵'}</span>
                          )}
                        </div>
                        <Link to={`/product/${product.slug}`} className="shop-card__info">
                          <span className="shop-card__category">{product.subcategory || 'Tea'}</span>
                          <h3 className="shop-card__name">{product.name}</h3>
                          <p className="shop-card__desc">{product.description}</p>
                        </Link>
                        <div className="shop-card__footer">
                          {(() => {
                            const moq = product.moq || 250;
                            const defaultWeight = moq > 20 ? 50 : moq;
                            const basePrice = product.price || 0;
                            const displayPrice = moq > 20 ? Math.round((basePrice / moq) * 50) : basePrice;

                            return (
                              <>
                                <span className="shop-card__price">₹{displayPrice} {moq > 20 && <span style={{fontSize: '0.65rem', opacity: 0.7}}>from 50g</span>}</span>
                                {product.inStock === false ? (
                                  <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                                    OUT OF STOCK
                                  </span>
                                ) : (
                                  <motion.button
                                    className="shop-card__add"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      addToCart({
                                        ...product,
                                        id: `${product._id}-${defaultWeight}`,
                                        originalId: product._id,
                                        name: `${product.name} (${defaultWeight >= 1000 ? defaultWeight/1000 + ' kg' : defaultWeight + ' gms'})`,
                                        price: displayPrice,
                                        packWeight: defaultWeight,
                                        quantity: 1
                                      });
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label={`Add ${product.name} to cart`}
                                  >
                                    <Plus size={16} />
                                  </motion.button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="shop-page__pagination" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                        <button 
                          onClick={() => {
                            setCurrentPage(p => Math.max(1, p - 1));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          disabled={currentPage === 1}
                          className="btn-primary"
                          style={{ padding: '0.5rem 1rem', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                          Prev
                        </button>
                        <span style={{ color: 'var(--color-text-cream)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
                          Page {currentPage} of {totalPages}
                        </span>
                        <button 
                          onClick={() => {
                            setCurrentPage(p => Math.min(totalPages, p + 1));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          disabled={currentPage === totalPages}
                          className="btn-primary"
                          style={{ padding: '0.5rem 1rem', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
              
              {loading && (
                <div className="shop-page__loading" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>⏳</span>
                  <p>Fetching fresh teas from the estate...</p>
                </div>
              )}
              {!loading && filteredProducts.length === 0 && (
                <div className="shop-page__empty" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>🍃</span>
                  <p>No teas found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
