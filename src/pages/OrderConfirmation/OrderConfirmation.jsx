import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '../../components/PageTransition/PageTransition';
import { supabase } from '../../lib/supabase';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/order/${orderId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {})
          }
        });
        const data = await response.json();

        if (response.ok && data) {
          setOrderData({
            id: data.id,
            total: data.total_amount,
            date: new Date(data.created_at).toLocaleDateString(),
            items: data.items,
          });
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <PageTransition>
        <div className="order-confirmation-page">
          <div className="confirmation-container glass-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <div className="loader"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!orderData) {
    return (
      <PageTransition>
        <div className="order-confirmation-page">
          <div className="confirmation-container glass-panel">
            <h1 className="cinematic-title" style={{ fontSize: '2rem', color: '#ef4444' }}>Order Not Found</h1>
            <p className="confirmation-subtitle">We couldn't locate your order. Please check your tracking ID.</p>
            <div className="confirmation-actions">
              <button className="btn-secondary" onClick={() => navigate('/')}>Return Home</button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="order-confirmation-page">
        <div className="confirmation-container glass-panel">
          <div className="success-icon-wrapper">
            <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="cinematic-title">Thank You.</h1>
          <p className="confirmation-subtitle">Your order has been received and is being prepared with care.</p>
          
          <div className="order-summary-card">
            <div className="order-summary-header">
              <h2>Order Summary</h2>
              <span className="order-number">#{orderData.id.split('-')[0].toUpperCase()}...</span>
            </div>
            
            <div className="order-items-list">
              {orderData.items.map((item, index) => (
                <div key={index} className="summary-item">
                  <span className="item-name">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="order-total-row">
              <span>Total</span>
              <span className="total-price">₹{Number(orderData.total).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="confirmation-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate(`/track-order?id=${orderData.id}`)}
            >
              Track Order
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default OrderConfirmation;
