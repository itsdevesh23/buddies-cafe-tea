import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

/* ─── Constants ─────────────────────────────────────────────────────── */
const STORAGE_KEY = 'buddies_cafe_wishlist';

/* ─── Helpers ───────────────────────────────────────────────────────── */
const loadWishlist = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* silently ignore */
  }
};

/* ─── Context ───────────────────────────────────────────────────────── */
const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(loadWishlist);

  /* Persist on every change */
  useEffect(() => {
    saveWishlist(items);
  }, [items]);

  /* Toggle a product in / out of the wishlist */
  const toggleWishlist = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === product.id);
      if (exists) {
        return prev.filter((i) => i.id !== product.id);
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.image,
          accentColor: product.accentColor,
          category: product.category,
        },
      ];
    });
  }, []);

  /* Check membership */
  const isInWishlist = useCallback(
    (id) => items.some((i) => i.id === id),
    [items]
  );

  /* ── Value ───────────────────────────────────────────────────────── */
  const value = useMemo(
    () => ({
      items,
      toggleWishlist,
      isInWishlist,
      count: items.length,
    }),
    [items, toggleWishlist, isInWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

/* ─── Hook ──────────────────────────────────────────────────────────── */
export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a <WishlistProvider>');
  return ctx;
};

export default WishlistContext;
