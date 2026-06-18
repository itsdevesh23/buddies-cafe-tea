import React from 'react';
import { motion } from 'framer-motion';
import { Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import PageTransition from '../../components/PageTransition/PageTransition';
import './ShippingPage.css';

const ShippingPage = () => {
  return (
    <PageTransition>
      <div className="shipping-page">
        <div className="editorial-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-header"
          >
            <h1>Shipping & Policies</h1>
            <p>Everything you need to know about delivery, returns, and our commitment to you.</p>
          </motion.div>

          <div className="policy-sections">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="policy-section glass-panel"
            >
              <div className="section-icon">
                <Truck size={32} />
              </div>
              <h2>Shipping Information</h2>
              <div className="policy-content">
                <p>We take pride in delivering our premium teas and kombucha with the utmost care, ensuring they reach you fresh and intact.</p>
                <ul>
                  <li><strong>South India:</strong> Delivery within 2-3 business days.</li>
                  <li><strong>Pan India:</strong> Delivery within 4-6 business days.</li>
                  <li><strong>Free Shipping:</strong> Available on all orders over ₹999.</li>
                  <li><strong>Kombucha Shipping:</strong> Packed with cold packs to maintain freshness. Must be refrigerated upon arrival.</li>
                </ul>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="policy-section glass-panel"
            >
              <div className="section-icon">
                <RefreshCw size={32} />
              </div>
              <h2>Return Policy</h2>
              <div className="policy-content">
                <p>We want you to love your Buddies Cafe experience. If you are not completely satisfied with your purchase, we're here to help.</p>
                <ul>
                  <li><strong>7 Days Return:</strong> We accept returns within 7 days of delivery for sealed, unopened teas.</li>
                  <li><strong>Kombucha Returns:</strong> Due to its perishable nature, kombucha cannot be returned. If damaged in transit, please contact us immediately with photos for a replacement.</li>
                  <li><strong>Refund Process:</strong> Refunds will be processed to the original method of payment within 5-7 business days of receiving the returned item.</li>
                </ul>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="policy-section glass-panel"
            >
              <div className="section-icon">
                <ShieldCheck size={32} />
              </div>
              <h2>Privacy Policy</h2>
              <div className="policy-content">
                <p>Your privacy is important to us. We are committed to protecting your personal information.</p>
                <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or subscribe to our newsletter. We use this information to fulfill your orders, communicate with you, and improve our services.</p>
                <p>We do not share your personal information with third parties except as necessary to process your orders (e.g., payment processors and shipping partners).</p>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ShippingPage;
