import React from 'react';
import { motion } from 'framer-motion';
import { Award, Heart, Leaf } from 'lucide-react';
import PageTransition from '../../components/PageTransition/PageTransition';
import './FounderPage.css';

const FounderPage = () => {
  return (
    <PageTransition>
      <div className="founder-page">
        <section className="founder-hero">
          <div className="founder-hero__overlay"></div>
          <motion.div 
            className="founder-hero__content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="founder-hero__title">Our Founder</h1>
            <p className="founder-hero__subtitle">The vision and legacy behind Buddies Cafe</p>
          </motion.div>
        </section>

        <section className="founder-story">
          <div className="container">
            <div className="story-content glass-panel">
              <h2 className="section-title">Nirmal Raj & Daniel Dhanaseelan</h2>
              <div className="story-text">
                <p>
                  Buddies Cafe is more than a tea room; it is a heartfelt tribute. Founded by Nirmal Raj, the cafe stands as a living memory to his late friend and co-visionary, Daniel Dhanaseelan. Together, they dreamt of creating a space where the rich heritage of Nilgiris tea could be shared with the world, a place where strangers become friends over a perfectly brewed cup.
                </p>
                <p>
                  Nirmal's journey is deeply rooted in the misty mountains of Ooty. Growing up surrounded by emerald tea gardens, his life has been inextricably linked to the rhythm of the harvest. Today, he channels that lifelong passion into curating an unparalleled tea experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="founder-quote">
          <div className="container">
            <motion.blockquote 
              className="quote-block glass-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              "Every cup of tea is a conversation waiting to happen. We pour our hearts into these brews so that you can pour your heart out to a friend."
              <cite>- Nirmal Raj</cite>
            </motion.blockquote>
          </div>
        </section>

        <section className="founder-timeline">
          <div className="container">
            <h2 className="section-title text-center">A Life in Tea</h2>
            <div className="timeline-grid">
              <div className="timeline-card glass-panel">
                <Leaf className="timeline-icon" />
                <h3>The Early Years</h3>
                <p>Childhood spent exploring the tea factories of the Nilgiris, learning the scent of fresh withering leaves.</p>
              </div>
              <div className="timeline-card glass-panel">
                <Award className="timeline-icon" />
                <h3>Learning the Craft</h3>
                <p>Years dedicated to mastering the delicate art of tea tasting, blending, and understanding terroir.</p>
              </div>
              <div className="timeline-card glass-panel">
                <Heart className="timeline-icon" />
                <h3>Est. 2012</h3>
                <p>Buddies Cafe opens its doors in Ooty, bringing a dream to life and honoring a cherished friendship.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default FounderPage;
