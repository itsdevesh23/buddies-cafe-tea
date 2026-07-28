import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { client } from '../sanity';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('buddies_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOpen, setIsOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('buddies_cart', JSON.stringify(items));
  }, [items]);

  // Validate cart items against live database on mount
  useEffect(() => {
    if (items.length === 0) return;
    
    const productIds = [...new Set(items.map(item => item.originalId).filter(Boolean))];
    
    if (productIds.length > 0) {
      client.fetch(`*[_type == "product" && _id in $ids]`, { ids: productIds })
        .then(liveProducts => {
          setItems(prevItems => {
            let hasChanges = false;
            
            const updatedItems = prevItems.map(item => {
              const liveProduct = liveProducts.find(p => p._id === item.originalId);
              
              // 1. Remove if deleted or out of stock
              if (!liveProduct || liveProduct.inStock === false) {
                 hasChanges = true;
                 return null;
              }
              
              // 2. Remove if weight is no longer available
              const moq = liveProduct.moq || 250;
              const cwStr = liveProduct.customBulkWeights || '50, 100, 150, 200, 250';
              const cwList = cwStr.split(',').map(s => parseInt(s.trim())).filter(w => !isNaN(w));
              const availablePacks = moq > 20 ? cwList : [moq];
              
              if (!availablePacks.includes(item.packWeight)) {
                 hasChanges = true;
                 return null;
              }
              
              // 3. Update price and name if changed
              const newPrice = Math.round((liveProduct.price / moq) * item.packWeight);
              const expectedName = `${liveProduct.name} (${item.packWeight >= 1000 ? item.packWeight/1000 + ' kg' : item.packWeight + ' gms'})`;
              
              if (item.price !== newPrice || item.name !== expectedName) {
                 hasChanges = true;
                 return { ...item, price: newPrice, name: expectedName };
              }
              
              return item;
            }).filter(Boolean); // Remove nulls
            
            if (hasChanges) {
              return updatedItems;
            }
            return prevItems;
          });
        })
        .catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const addToCart = useCallback((product) => {
    const qtyToAdd = product.quantity || 1;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        );
      }
      return [...prev, { ...product, quantity: qtyToAdd }];
    });
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback((id, newQty) => {
    if (newQty <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      )
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const [couponCode, setCouponCode] = useState('');
  const [couponDetails, setCouponDetails] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const applyCoupon = useCallback(async (code) => {
    setCouponError('');
    if (!code) return;

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error || !data) {
        setCouponError('Invalid promo code');
        setDiscount(0);
        setCouponCode('');
        return;
      }

      if (!data.is_active) {
        setCouponError('This promo code has expired or is inactive');
        setDiscount(0);
        setCouponCode('');
        setCouponDetails(null);
        return;
      }

      if (data.min_cart_value && subtotal < data.min_cart_value) {
        setCouponError(`This code requires a minimum cart value of ₹${data.min_cart_value}`);
        setDiscount(0);
        setCouponCode('');
        setCouponDetails(null);
        return;
      }

      if (data.usage_limit && data.times_used >= data.usage_limit) {
        setCouponError('This promo code has reached its usage limit');
        setDiscount(0);
        setCouponCode('');
        setCouponDetails(null);
        return;
      }

      // Valid coupon!
      setCouponCode(data.code);
      setCouponDetails(data);
      
      let discountAmount = 0;
      if (data.type === 'percentage' || !data.type) {
        discountAmount = Math.floor(subtotal * (data.discount_percent / 100));
      } else if (data.type === 'flat_discount') {
        discountAmount = Math.min(subtotal, data.discount_percent);
      } else if (data.type === 'free_shipping') {
        discountAmount = 0; // Shipping handled in CheckoutPage
      }
      
      setDiscount(discountAmount);
      
    } catch (err) {
      console.error('Coupon validation error:', err);
      setCouponError('Failed to validate code');
    }
  }, [subtotal]);

  const removeCoupon = useCallback(() => {
    setCouponCode('');
    setDiscount(0);
    setCouponDetails(null);
  }, []);

  const grandTotal = subtotal - discount;

  const value = {
    items,
    isOpen,
    setIsOpen,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    cartCount,
    subtotal,
    grandTotal,
    couponCode,
    couponDetails,
    discount,
    couponError,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
