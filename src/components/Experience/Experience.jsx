import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Clock, MapPin, Utensils, CalendarCheck, Phone } from 'lucide-react';
import kombuchaImg from '../../assets/kombucha_product.png';
import './Experience.css';

const MENU_HIGHLIGHTS = [
  { name: 'Matcha Ceremony Bowl', price: '₹299', category: 'Signature' },
  { name: 'Nilgiris Cold Brew', price: '₹249', category: 'Iced' },
  { name: 'Lavender Earl Grey Cake', price: '₹199', category: 'Patisserie' },
  { name: 'Ginger Turmeric Latte', price: '₹279', category: 'Wellness' },
  { name: 'Wild Berry Kombucha', price: '₹349', category: 'Fermented' },
  { name: 'Avocado Toast & Tea Pairing', price: '₹449', category: 'Food Pairing' },
];

export default function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="experience" id="experience" ref={ref}>
      <div className="experience__bg-texture" />

      <div className="experience__container">
        {/* Left: Cafe Info */}
        <motion.div
          className="experience__info"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="experience__label">The Experience</span>
          <h2 className="experience__heading">
            Step Into<br />
            <span className="experience__heading--accent">Buddies Cafe</span>
          </h2>
          <p className="experience__body">
            More than a café — a tea sanctuary in the heart of Ooty. Cozy interiors,
            mountain views, and the aroma of freshly brewed Nilgiris tea define
            every visit.
          </p>

          <div className="experience__details">
            <div className="experience__detail">
              <MapPin size={18} className="experience__detail-icon" />
              <span>Commercial Street, Ooty, Tamil Nadu</span>
            </div>
            <div className="experience__detail">
              <Clock size={18} className="experience__detail-icon" />
              <span>Open Daily · 8:00 AM – 9:00 PM</span>
            </div>
            <div className="experience__detail">
              <Phone size={18} className="experience__detail-icon" />
              <span>+91 6303690660</span>
            </div>
          </div>

          <div className="experience__actions">
            <motion.a
              href="#"
              className="btn-primary"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <CalendarCheck size={16} style={{ marginRight: '0.5rem' }} />
              Reserve a Table
            </motion.a>
            <motion.a
              href="https://wa.me/916303690660"
              className="experience__whatsapp-btn"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Us
            </motion.a>
          </div>
        </motion.div>

        {/* Right: Menu Highlights */}
        <motion.div
          className="experience__menu"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="experience__menu-header">
            <Utensils size={18} />
            <h3>Menu Highlights</h3>
          </div>
          <div className="experience__menu-list">
            {MENU_HIGHLIGHTS.map((item, i) => (
              <motion.div
                key={item.name}
                className="menu-item"
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
              >
                <div className="menu-item__info">
                  <span className="menu-item__category">{item.category}</span>
                  <span className="menu-item__name">{item.name}</span>
                </div>
                <span className="menu-item__price">{item.price}</span>
              </motion.div>
            ))}
          </div>

          <div className="experience__menu-image">
            <img src={kombuchaImg} alt="Artisanal kombucha from Buddies Cafe" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
