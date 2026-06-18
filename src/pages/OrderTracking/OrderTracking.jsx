import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Clock, Truck, Home, CheckCircle } from 'lucide-react';
import PageTransition from '../../components/PageTransition/PageTransition';
import { supabase } from '../../lib/supabase';
import './OrderTracking.css';

const OrderTracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');

  const idFromUrl = searchParams.get('id');
  useEffect(() => {
    if (idFromUrl) {
      setOrderId(idFromUrl);
      handleSearch(idFromUrl);
    }
  }, [idFromUrl]);

  const handleSearch = async (idToSearch = orderId) => {
    if (!idToSearch.trim()) return;
    
    setIsSearching(true);
    setShowTimeline(false);
    setError('');
    
    if (searchParams.get('id') !== idToSearch) {
       setSearchParams({ id: idToSearch });
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/order/${idToSearch}`);
      const data = await response.json();

      if (!response.ok || !data) {
        setError(data?.error || 'Order not found. Please check your tracking ID.');
      } else {
        // Adapt data format for the UI
        const mappedData = {
          id: data.id,
          status: data.status,
          created_at: data.created_at,
          total: data.total_amount,
          items: data.items
        };
        setOrderData(mappedData);
        setShowTimeline(true);
      }
    } catch (err) {
      setError('Failed to fetch order. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getDynamicSteps = (order) => {
    if (!order) return [];

    const dateStr = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    let currentIdx = 0;
    if (order.status === 'Processing') currentIdx = 1;
    if (order.status === 'Shipped') currentIdx = 2;
    if (order.status === 'Out for Delivery') currentIdx = 3;
    if (order.status === 'Delivered') currentIdx = 4;
    
    return [
      { id: 1, title: 'Order Placed', icon: Clock, status: currentIdx >= 0 ? 'completed' : 'pending', time: dateStr },
      { id: 2, title: 'Processing', icon: Package, status: currentIdx > 1 ? 'completed' : (currentIdx === 1 ? 'active' : 'pending'), time: currentIdx >= 1 ? 'In Progress' : 'Pending' },
      { id: 3, title: 'Shipped', icon: Truck, status: currentIdx > 2 ? 'completed' : (currentIdx === 2 ? 'active' : 'pending'), time: currentIdx >= 2 ? 'In Transit' : 'Pending' },
      { id: 4, title: 'Out for Delivery', icon: Home, status: currentIdx > 3 ? 'completed' : (currentIdx === 3 ? 'active' : 'pending'), time: currentIdx >= 3 ? 'Arriving Soon' : 'Pending' },
      { id: 5, title: 'Delivered', icon: CheckCircle, status: currentIdx === 4 ? 'completed' : 'pending', time: currentIdx === 4 ? 'Delivered' : 'Pending' }
    ];
  };

  const dynamicSteps = getDynamicSteps(orderData);

  return (
    <PageTransition>
      <div className="order-tracking-page">
        <div className="tracking-hero">
          <motion.div 
            className="tracking-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="tracking-title">Track Your Ritual</h1>
            <p className="tracking-subtitle">Follow the journey of your premium tea from our estate to your cup.</p>
            
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Enter your Order ID (e.g., 550e8400...)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="search-input"
                />
                <button 
                  className="search-button"
                  onClick={() => handleSearch()}
                  disabled={isSearching || !orderId.trim()}
                >
                  {isSearching ? <div className="loader" /> : 'Track'}
                </button>
              </div>
              {error && <p className="error-message" style={{ color: '#ef4444', marginTop: '1rem', fontWeight: 'bold' }}>{error}</p>}
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showTimeline && orderData && (
            <motion.div 
              className="timeline-container"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div className="timeline-card glass-panel">
                <div className="timeline-header">
                  <h2>Order #{orderData.id.split('-')[0].toUpperCase()}...</h2>
                  <span className="estimated-delivery">Status: <strong>{orderData.status}</strong></span>
                </div>
                
                <div className="timeline-visual">
                  {dynamicSteps.map((step, index) => (
                    <div key={step.id} className={`timeline-step ${step.status}`}>
                      <div className="step-connector">
                         {index < dynamicSteps.length - 1 && (
                           <div className="connector-line">
                             <div 
                               className={`connector-progress ${showTimeline ? 'fill' : ''} ${step.status}`}
                               style={{ transitionDelay: `${0.5 + index * 0.2}s` }}
                             />
                           </div>
                         )}
                      </div>
                      
                      <motion.div 
                        className="step-icon-wrapper"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 260, 
                          damping: 20, 
                          delay: index * 0.15 
                        }}
                      >
                        <step.icon size={24} className="step-icon" />
                        {step.status === 'active' && (
                          <motion.div 
                            className="pulse-ring"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />
                        )}
                      </motion.div>
                      
                      <motion.div 
                        className="step-content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.15 }}
                      >
                        <h3 className="step-title">{step.title}</h3>
                        <p className={`step-time ${step.status === 'active' ? 'current' : ''} ${step.status === 'pending' ? 'pending' : ''}`}>
                          {step.time}
                        </p>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default OrderTracking;
