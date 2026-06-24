import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Thermometer, Clock, Beaker, Droplet } from 'lucide-react';
import './BrewingGuide.css';

const brewingData = [
  { name: 'White Tea', temp: '75°C', amount: '2 GMS', time: '2-3 MIN', color: '#fef08a' },
  { name: 'Green Tea', temp: '80°C', amount: '2 GMS', time: '2-3 MIN', color: '#86efac' },
  { name: 'Oolong Tea', temp: '80°C', amount: '2 GMS', time: '2-3 MIN', color: '#fdba74' },
  { name: 'Black Tea', temp: '100°C', amount: '2 GMS', time: '2-3 MIN', color: '#d97706' },
  { name: 'Flavoured Tea', temp: '100°C', amount: '2 GMS', time: '2-3 MIN', color: '#f472b6' },
  { name: 'Herbal Tea', temp: '100°C', amount: '2 GMS', time: '5-7 MIN', color: '#5eead4' },
  { name: 'Milk Tea', temp: '100°C', amount: '5 GMS', time: '2 MIN', color: '#f87171', extra: '60% Water, 40% Milk' }
];

const BrewingGuide = () => {
  return (
    <section className="brewing-guide-container">
      <div className="brewing-guide-header">
        <h2>Perfect Brew Guide</h2>
        <p>Unlock the full potential of your tea with our precise brewing parameters.</p>
      </div>

      <div className="brewing-grid">
        {brewingData.map((tea, idx) => (
          <motion.div 
            key={tea.name}
            className="brewing-card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            style={{ '--theme-color': tea.color }}
          >
            <div className="brewing-card__header">
              <Leaf size={24} color={tea.color} className="brewing-card__icon" />
              <h3 style={{ color: tea.color }}>{tea.name}</h3>
            </div>
            
            <div className="brewing-card__stats">
              <div className="stat-row">
                <Thermometer size={16} />
                <span>{tea.temp}</span>
              </div>
              <div className="stat-row">
                <Beaker size={16} />
                <span>{tea.amount}</span>
              </div>
              <div className="stat-row">
                <Clock size={16} />
                <span>{tea.time}</span>
              </div>
              {tea.extra && (
                <div className="stat-row stat-row--extra">
                  <Droplet size={16} />
                  <span>{tea.extra}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default BrewingGuide;
