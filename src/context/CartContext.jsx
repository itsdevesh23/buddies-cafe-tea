import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
