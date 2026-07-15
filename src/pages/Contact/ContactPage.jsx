import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import PageTransition from '../../components/PageTransition/PageTransition';
import './ContactPage.css';

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      subject: e.target.subject.value,
      message: e.target.message.value
    };

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/submit-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message');
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
      <div className="contact-page">
        <div className="contact__container">
          <motion.div
            className="contact__info"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="contact__title">Get in Touch</h1>
            <p className="contact__subtitle">
              Whether you have a question about our teas, want to collaborate, or just want to say hello, we'd love to hear from you.
            </p>

            <div className="contact__details">
              <div className="contact__detail-item">
                <MapPin className="contact__icon" />
                <div>
                  <h3>Visit Us</h3>
                  <a href="https://maps.app.goo.gl/MRVrPEtBnoNxGMJ39" target="_blank" rel="noreferrer" style={{color: 'inherit', display: 'block', marginBottom: '4px'}}>Buddies Cafe, Pudumund</a>
                  <a href="https://maps.app.goo.gl/asTAExdsJ7cWboBD7" target="_blank" rel="noreferrer" style={{color: 'inherit', display: 'block', marginBottom: '4px'}}>Commercial Road, Ooty</a>
                  <a href="https://maps.app.goo.gl/BG6HAjUA81hPz8SX7" target="_blank" rel="noreferrer" style={{color: 'inherit', display: 'block'}}>Coonoor Branch</a>
                </div>
              </div>

              <div className="contact__detail-item">
                <Phone className="contact__icon" />
                <div>
                  <h3>Call Us</h3>
                  <p>+91 6303690660</p>
                </div>
              </div>

              <div className="contact__detail-item">
                <Mail className="contact__icon" />
                <div>
                  <h3>Email Us</h3>
                  <p>hello@buddiescafe.in</p>
                </div>
              </div>

              <div className="contact__detail-item">
                <Clock className="contact__icon" />
                <div>
                  <h3>Opening Hours</h3>
                  <p>Open Daily<br/>8:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>

            <a href="https://wa.me/916303690660" target="_blank" rel="noreferrer" className="contact__whatsapp-btn btn-primary">
              <MessageCircle size={20} />
              Chat on WhatsApp
            </a>
          </motion.div>

          <motion.div
            className="contact__form-wrapper glass-panel"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {isSubmitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <h2 style={{ color: '#4ade80', marginBottom: '1rem' }}>Message Sent! ✅</h2>
                <p style={{ color: '#94a3b8' }}>Thank you for reaching out to Buddies Cafe. Our team has received your message and will get back to you shortly to the email address provided.</p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="btn-secondary"
                  style={{ marginTop: '2rem' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
            <form className="contact__form" onSubmit={handleSubmit}>
              <h2 className="contact__form-title">Send a Message</h2>

              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" placeholder="Your Name" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Your Email" required />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" placeholder="Subject" required />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows="5" placeholder="Your Message" required></textarea>
              </div>

              {error && (
                <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary contact__submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ContactPage;
