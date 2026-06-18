import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Cart.css';

export default function Cart({ isOpen, onClose }) {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    grandTotal,
    couponCode,
    discount,
    couponError,
    applyCoupon,
    removeCoupon,
  } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="cart-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="cart-panel__header">
              <div className="cart-panel__header-title">
                <ShoppingBag size={20} />
                <h3>Your Cart</h3>
                <span className="cart-panel__count">{items.length} items</span>
              </div>
              <button className="cart-panel__close" onClick={onClose} aria-label="Close cart">
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="cart-panel__empty">
                <span style={{ fontSize: '3rem' }}>🍃</span>
                <p>Your cart is empty</p>
                <span className="cart-panel__empty-sub">
                  Explore our collection to begin your tea journey
                </span>
              </div>
            ) : (
              <>
                <div className="cart-panel__items">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="cart-item"
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="cart-item__info">
                        <span className="cart-item__category">{item.category}</span>
                        <span className="cart-item__name">{item.name}</span>
                        <span className="cart-item__price">₹{item.price} each</span>
                      </div>
                      <div className="cart-item__right">
                        <div className="cart-item__controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease">
                            <Minus size={14} />
                          </button>
                          <span className="cart-item__qty">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase">
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="cart-item__subtotal">₹{item.price * item.quantity}</span>
                        <button className="cart-item__remove" onClick={() => removeItem(item.id)} aria-label="Remove">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="cart-panel__coupon">
                  {couponCode ? (
                    <div className="cart-panel__coupon-applied">
                      <span>🎉 <strong>{couponCode}</strong> applied (−₹{discount})</span>
                      <button onClick={removeCoupon}>Remove</button>
                    </div>
                  ) : (
                    <>
                      <form
                        className="cart-panel__coupon-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const code = e.target.elements.coupon.value;
                          if (code) applyCoupon(code);
                        }}
                      >
                        <input name="coupon" placeholder="Coupon code" className="cart-panel__coupon-input" />
                        <button type="submit" className="cart-panel__coupon-btn">Apply</button>
                      </form>
                      {couponError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{couponError}</p>}
                    </>
                  )}
                </div>

                <div className="cart-panel__summary">
                  <div className="cart-panel__summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="cart-panel__summary-row cart-panel__summary-discount">
                      <span>Discount</span>
                      <span>−₹{discount}</span>
                    </div>
                  )}
                  <div className="cart-panel__summary-row cart-panel__summary-total">
                    <span>Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                  <Link to="/checkout" className="btn-primary cart-panel__checkout" onClick={onClose}>
                    Proceed to Checkout
                  </Link>
                  <button className="cart-panel__clear" onClick={clearCart}>Clear Cart</button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
