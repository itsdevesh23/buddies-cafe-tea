import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import PageTransition from '../../components/PageTransition/PageTransition';
import './BookingPage.css';

const BookingPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = {
      experience_type: e.target.experienceType.value,
      guests: e.target.guests.value,
      date: e.target.date.value,
      time: e.target.time.value,
      full_name: e.target.name.value,
      phone: e.target.phone.value,
      email: e.target.email.value,
      special_requests: e.target.requests.value
    };

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/submit-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="booking-page">
        <div className="booking__container">
          <header className="booking__header">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="booking__title"
            >
              Reserve an Experience
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="booking__subtitle"
            >
              Book a table at our Ooty cafe or reserve a private tea tasting session.
            </motion.p>
          </header>

          <motion.div
            className="booking__form-wrapper glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="booking-form"
                  className="booking__form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="experienceType">Experience Type</label>
                      <select id="experienceType" required>
                        <option value="">Select an experience...</option>
                        <option value="cafe">Cafe Table</option>
                        <option value="tasting">Private Tasting (₹3500)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="guests">Number of Guests</label>
                      <input type="number" id="guests" min="1" max="10" placeholder="e.g. 2" required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="date">Date</label>
                      <input type="date" id="date" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="time">Time</label>
                      <input type="time" id="time" required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input type="text" id="name" placeholder="John Doe" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input type="tel" id="phone" placeholder="+91 XXXXX XXXXX" required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" placeholder="john@example.com" required />
                  </div>

                  <div className="form-group">
                    <label htmlFor="requests">Special Requests</label>
                    <textarea id="requests" rows="3" placeholder="Any dietary requirements or special occasions?"></textarea>
                  </div>

                  {error && (
                    <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="btn-primary booking__submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting Request...' : 'Request Reservation'}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success-message"
                  className="booking__success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle className="booking__success-icon" size={64} />
                  <h2>Request Received</h2>
                  <p>
                    Thank you for your reservation request. Our team will review it and send a confirmation to your email shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="btn-secondary"
                    style={{ marginTop: '2rem' }}
                  >
                    Make Another Booking
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default BookingPage;
