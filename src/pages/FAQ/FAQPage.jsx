import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import PageTransition from '../../components/PageTransition/PageTransition';
import './FAQPage.css';

const faqs = [
  {
    question: "How should I store my tea?",
    answer: "For optimal freshness, keep your tea in an airtight container away from direct sunlight, moisture, and strong odors. Our premium tins are designed specifically for this purpose."
  },
  {
    question: "Does Kombucha need to be refrigerated?",
    answer: "Yes, always keep Buddies Kombucha chilled. Refrigeration pauses the fermentation process, maintaining the perfect flavor profile and preventing the build-up of excess carbonation."
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we ship across India only. We are working on expanding our logistics to share the Nilgiri experience globally in the near future."
  },
  {
    question: "How long does 100g of tea last?",
    answer: "Approximately 40-50 cups, depending on how strong you like your brew. For most of our teas, we recommend 2-2.5g per 200ml cup."
  },
  {
    question: "Are your teas organic?",
    answer: "We source exclusively from biodynamic and pesticide-free estates in the Nilgiris. While not all partner estates carry formal organic certification, their farming practices prioritize ecological harmony."
  },
  {
    question: "Can I visit the tea room in Ooty?",
    answer: "Yes! We would love to host you. We are open daily from 8 AM to 9 PM at Garden Road, Pudumund, Ooty. Come experience our tea ceremonies and kombucha flights in person."
  }
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <PageTransition>
      <div className="faq-page">
        <div className="faq-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="faq-header"
          >
            <h1>Frequently Asked Questions</h1>
            <p>Find answers to common questions about our teas, kombucha, and services.</p>
          </motion.div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`faq-item glass-panel ${openIndex === index ? 'active' : ''}`}
              >
                <button 
                  className="faq-question" 
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openIndex === index}
                >
                  <h3>{faq.question}</h3>
                  <div className="faq-icon">
                    {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="faq-answer-wrapper"
                    >
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="faq-contact glass-panel"
          >
            <h3>Still have questions?</h3>
            <p>We're here to help. Contact our tea sommeliers directly.</p>
            <a href="mailto:hello@buddiescafe.com" className="btn-primary" style={{ textDecoration: 'none' }}>Contact Us</a>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default FAQPage;
