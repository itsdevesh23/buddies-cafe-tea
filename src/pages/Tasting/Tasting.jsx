import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Coffee, Utensils, Users, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../../components/PageTransition/PageTransition';
import './Tasting.css';

const Tasting = () => {
  return (
    <PageTransition>
      <div className="tasting-page">
        <section className="tasting-hero">
          <div className="tasting-hero__overlay"></div>
          <motion.div 
            className="tasting-hero__content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="tasting-hero__title">The Tea Tasting Ritual</h1>
            <p className="tasting-hero__subtitle">An intimate 2-3 hour sensory journey through the finest Nilgiris teas</p>
          </motion.div>
        </section>

        <section className="tasting-details">
          <div className="container">
            <div className="tasting-grid">
              <motion.div className="tasting-card glass-panel" whileHover={{ y: -5 }}>
                <Clock className="tasting-card__icon" />
                <h3>Duration</h3>
                <p>2-3 hours</p>
              </motion.div>
              <motion.div className="tasting-card glass-panel" whileHover={{ y: -5 }}>
                <Coffee className="tasting-card__icon" />
                <h3>Teas</h3>
                <p>4-6 premium varieties</p>
              </motion.div>
              <motion.div className="tasting-card glass-panel" whileHover={{ y: -5 }}>
                <Utensils className="tasting-card__icon" />
                <h3>Includes</h3>
                <p>Food & chocolate pairings</p>
              </motion.div>
              <motion.div className="tasting-card glass-panel" whileHover={{ y: -5 }}>
                <Users className="tasting-card__icon" />
                <h3>Price</h3>
                <p>₹3,500 for group of 4</p>
              </motion.div>
              <motion.div className="tasting-card glass-panel" whileHover={{ y: -5 }}>
                <User className="tasting-card__icon" />
                <h3>Host</h3>
                <p>Nirmal Raj</p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="tasting-journey">
          <div className="container">
            <h2 className="section-title">What to Expect</h2>
            <div className="journey-steps">
              {['Welcome Drink', 'Tea Education', 'Guided Tasting', 'Food Pairings'].map((step, index) => (
                <motion.div 
                  key={index} 
                  className="journey-step"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="journey-step__number">{index + 1}</div>
                  <h3 className="journey-step__title">{step}</h3>
                  {index < 3 && <ArrowRight className="journey-step__arrow" />}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="tasting-cta">
          <div className="container">
            <div className="cta-box glass-panel">
              <h2>Ready to experience the finest teas?</h2>
              <p>Reserve your tasting ritual today and embark on a journey of flavors.</p>
              <Link to="/booking" className="btn-primary">
                Book Your Experience
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Tasting;
