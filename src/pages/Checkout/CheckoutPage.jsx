import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, ChevronLeft, QrCode, Tag } from 'lucide-react';
import PageTransition from '../../components/PageTransition/PageTransition';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { urlFor } from '../../sanity';
import { supabase } from '../../supabase';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { 
    items, clearCart, 
    couponCode, couponDetails, discount, couponError, applyCoupon, removeCoupon 
  } = useCart() || { 
    items: [], clearCart: () => {},
    couponCode: '', couponDetails: null, discount: 0, couponError: '', applyCoupon: () => {}, removeCoupon: () => {}
  };
  const { settings } = useSettings() || { settings: null };
  const fallbackShipping = settings?.shipping_flat_rate || 150;

  const { user } = useAuth() || { user: null };
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateLoc, setStateLoc] = useState('');
  const [userLoaded, setUserLoaded] = useState(false);

  React.useEffect(() => {
    if (user && !userLoaded) {
      setEmail(user.email || '');
      setPhone(user.user_metadata?.phone || '');
      if (user.user_metadata?.full_name) {
        const parts = user.user_metadata.full_name.split(' ');
        setFirstName(parts[0] || '');
        if (parts.length > 1) setLastName(parts.slice(1).join(' '));
      }
      setUserLoaded(true);
    }
  }, [user, userLoaded]);

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const navigate = useNavigate();
  
  // Load Razorpay Script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  
  const displayCart = items || [];
  
  const subtotal = displayCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const calculatedDiscount = discount || 0;
  const isFreeShipping = couponDetails?.type === 'free_shipping';
  const effectiveShipping = isFreeShipping ? 0 : shippingCost;
  const total = subtotal - calculatedDiscount + effectiveShipping;

  const nextStep = async () => {
    if (step === 1) {
      if (!email.trim() || !phone.trim()) {
        toast.error('Please fill in all contact details.');
        return;
      }
    }
    if (step === 2) {
      if (!firstName.trim() || !lastName.trim() || !address.trim() || !city.trim() || !stateLoc.trim()) {
        toast.error('Please fill in all shipping details.');
        return;
      }
      if (!pinCode || pinCode.length !== 6) {
        toast.error('Please enter a valid 6-digit PIN Code.');
        return;
      }
      setIsCalculatingShipping(true);
      try {
        const totalWeight = displayCart.reduce((sum, item) => sum + (0.5 * item.quantity), 0); // Assuming 0.5kg per item for now
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/shipping-rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delivery_postcode: pinCode, weight: totalWeight })
        });
        const data = await res.json();
        setShippingCost(data.rate || data.fallback_rate || fallbackShipping);
      } catch (err) {
        console.error('Shipping calc error:', err);
        setShippingCost(fallbackShipping); // Fallback
      }
      setIsCalculatingShipping(false);
    }
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Gather Shipping Info from inputs
    const shippingInfo = {
      firstName,
      lastName,
      address,
      city,
      state: stateLoc,
      pinCode,
      phone,
      email
    };

    // Handle Cash on Delivery
    if (paymentMethod === 'cod') {
      try {
        // 1. Create the pending order
        const backendUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') + '/api/create-order';
        const { data: { session } } = await supabase.auth.getSession();
        
        const result = await fetch(backendUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {})
          },
          body: JSON.stringify({ 
            items: displayCart, 
            couponCode: couponCode || null, 
            shippingInfo, 
            userId: user ? user.id : null,
            paymentMethod: 'cod'
          })
        });

        const orderData = await result.json();

        if (!result.ok) {
          toast.error(orderData.error || 'Failed to create order');
          setIsProcessing(false);
          return;
        }

        // 2. Finalize COD Order
        const finalizeRes = await fetch((import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') + '/api/place-cod-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.id,
            couponCode: couponCode || null
          })
        });

        const finalizeData = await finalizeRes.json();
        
        if (finalizeData.success) {
          clearCart();
          setIsProcessing(false);
          navigate(`/order-confirmation/${orderData.id}`);
        } else {
          toast.error('Error saving COD order: ' + finalizeData.error);
          setIsProcessing(false);
        }
      } catch (err) {
        toast.error(`An error occurred: ${err.message || 'Network error'}`);
        setIsProcessing(false);
        console.error(err);
      }
      return;
    }

    // Handle Online Payment (Razorpay)
    try {
      // 1. Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      // Gather Shipping Info from inputs (already declared above)
      // 2. Fetch order ID from our secure backend
      const backendUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') + '/api/create-order';
      const { data: { session } } = await supabase.auth.getSession();
      
      const result = await fetch(backendUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ 
          items: displayCart, 
          couponCode: couponCode || null, 
          shippingInfo, 
          userId: user ? user.id : null,
          paymentMethod: 'online'
        })
      });

      if (!result.ok) {
        try {
          const errData = await result.json();
          toast.error(errData.error || 'Server error occurred.');
        } catch(e) {
          toast.error('Server error. Could not connect to backend.');
        }
        setIsProcessing(false);
        return;
      }
      
      const orderData = await result.json();

      // 3. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || settings?.razorpay_key_id, 
        amount: Math.round(orderData.amount * 100),
        currency: 'INR',
        name: 'Buddies Cafe',
        description: 'Premium Tea Order',
        image: "/assets/hero_4k.png",
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          // Success Callback
          try {
            // Call our new backend to verify payment and mark the Pending order as Paid
            const finalizeRes = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/place-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                couponCode: couponCode || null
              })
            });

            const finalizeData = await finalizeRes.json();
            
            if (finalizeData.success) {
              clearCart();
              setIsProcessing(false);
              navigate(`/order-confirmation/${orderData.id}`);
            } else {
              toast.error('Payment verified, but error saving order: ' + finalizeData.error);
              setIsProcessing(false);
            }
          } catch (err) {
            console.error(err);
            toast.error('Payment successful, but failed to connect to server for order creation.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: shippingInfo.firstName + ' ' + shippingInfo.lastName,
          email: shippingInfo.email,
          contact: shippingInfo.phone
        },
        notes: {
          address: shippingInfo.address
        },
        theme: {
          color: "#4ade80" // Your brand primary color
        }
      };

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on('payment.failed', function (response){
        toast.error("Payment Failed. Reason: " + response.error.description);
        setIsProcessing(false);
      });

      rzp1.open();
      
    } catch (err) {
      console.error(err);
      toast.error(`Error connecting to backend: ${err.message || 'Network error'}`);
      setIsProcessing(false);
    }
  };

  return (
    <PageTransition>
      <div className="checkout-page">
        <div className="checkout-layout">
          
          <div className="checkout-main">
            <div className="checkout-header">
              <h1>Checkout</h1>
              <div className="checkout-steps">
                <div className={`step ${step >= 1 ? 'active' : ''}`}>
                  <div className="step-icon"><MapPin size={16} /></div>
                  <span>Contact</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${step >= 2 ? 'active' : ''}`}>
                  <div className="step-icon"><Truck size={16} /></div>
                  <span>Shipping</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${step >= 3 ? 'active' : ''}`}>
                  <div className="step-icon"><CreditCard size={16} /></div>
                  <span>Payment</span>
                </div>
              </div>
            </div>

            <div className="checkout-form-container glass-panel">
              {step === 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="checkout-form-step"
                >
                  <h2>Contact Information</h2>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="Enter your mobile number" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div className="form-actions right">
                    <button className="btn-primary" onClick={nextStep}>Continue to Shipping</button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="checkout-form-step"
                >
                  <h2>Shipping Address</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input type="text" placeholder="Street Address, Apartment, Suite, etc." value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <select value={stateLoc} onChange={e => setStateLoc(e.target.value)}>
                        <option value="" disabled>Select State</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                        <optgroup label="Union Territories">
                          <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                          <option value="Chandigarh">Chandigarh</option>
                          <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                          <option value="Ladakh">Ladakh</option>
                          <option value="Lakshadweep">Lakshadweep</option>
                          <option value="Puducherry">Puducherry</option>
                        </optgroup>
                        <optgroup label="International">
                          <option value="International">International (Outside India)</option>
                        </optgroup>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>PIN Code</label>
                      <input 
                        type="text" 
                        placeholder="PIN Code" 
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        maxLength="6"
                      />
                    </div>
                  </div>
                  <div className="form-actions space-between">
                    <button className="btn-secondary" onClick={prevStep}>
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button 
                      className="btn-primary" 
                      onClick={nextStep}
                      disabled={isCalculatingShipping}
                    >
                      {isCalculatingShipping ? 'Calculating Shipping...' : 'Continue to Payment'}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="checkout-form-step"
                >
                  <h2>Payment Method</h2>
                  <div className="payment-methods">
                    <label className={`payment-method ${paymentMethod === 'online' ? 'selected' : ''}`}>
                      <input type="radio" name="payment" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                      <div className="method-content">
                        <CreditCard size={24} />
                        <div>
                          <strong>Pay Online</strong>
                          <p>UPI, Credit/Debit Cards, Netbanking via Razorpay</p>
                        </div>
                      </div>
                    </label>

                    <label className={`payment-method ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                      <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                      <div className="method-content">
                        <Truck size={24} />
                        <div>
                          <strong>Cash on Delivery</strong>
                          <p>Pay when you receive the order</p>
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="form-actions space-between">
                    <button className="btn-secondary" onClick={prevStep} disabled={isProcessing}>
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button 
                      className="btn-primary" 
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <aside className="checkout-sidebar glass-panel">
            <h2>Order Summary</h2>
            <div className="order-items">
              {displayCart.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    {item.image ? (
                      <img src={typeof item.image === 'string' ? item.image : urlFor(item.image).width(200).url()} alt={item.name} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : null}
                    <div className="image-placeholder" style={{ display: item.image ? 'none' : 'flex' }}></div>
                    <span className="item-quantity">{item.quantity}</span>
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>₹{item.price}</p>
                  </div>
                  <div className="item-total">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              
              {/* PROMO CODE SECTION */}
              <div className="promo-code-section" style={{ padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Discount code" 
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff' }}
                  />
                  <button 
                    className="admin-btn primary"
                    onClick={() => applyCoupon(inputCode)}
                    disabled={!inputCode}
                    style={{ padding: '0 1.5rem', borderRadius: '4px' }}
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{couponError}</p>}
                {couponCode && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Tag size={14} color="#4ade80" />
                      <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{couponCode}</span>
                    </div>
                    <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
                  </div>
                )}
              </div>

              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {calculatedDiscount > 0 && (
                <div className="total-row" style={{ color: '#4ade80' }}>
                  <span>Discount ({couponCode})</span>
                  <span>-₹{calculatedDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="total-row">
                <span>Shipping</span>
                <span>{isFreeShipping ? <span style={{color: '#4ade80'}}>FREE</span> : (shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'Calculated at next step')}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </PageTransition>
  );
};

export default CheckoutPage;
