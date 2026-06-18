import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import teaCeremonyImg from '../../assets/tea_ceremony.png';
import './Story.css';

export default function Story() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="story" id="heritage" ref={ref}>
      <div className="story__glow" />

      <div className="story__container">
        {/* Image column */}
        <motion.div
          className="story__image-col"
          initial={{ opacity: 0, x: -60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="story__image-wrapper">
            <img src={teaCeremonyImg} alt="Traditional Nilgiris tea pouring ritual" />
            <div className="story__image-overlay" />
            <div className="story__image-frame" />
          </div>
          <div className="story__image-badge glass-panel">
            <span className="story__badge-number">3rd</span>
            <span className="story__badge-text">Generation<br/>Tea Family</span>
          </div>
        </motion.div>

        {/* Text column */}
        <motion.div
          className="story__text-col"
          initial={{ opacity: 0, x: 60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="story__label">Our Heritage</span>
          <h2 className="story__heading">
            Born from the<br />
            <span className="story__heading--accent">Nilgiris Mist</span>
          </h2>
          <div className="story__divider" />
          <p className="story__body">
            Nestled in the blue mountains of Ooty, our family has been intertwined
            with the art of tea for three generations. What began as a quiet devotion
            to the Nilgiris tea estates has blossomed into Buddies Cafe — a sanctuary
            where every cup tells the story of these ancient hills.
          </p>
          <p className="story__body">
            Our founder grew up walking the misty tea gardens, learning the subtle
            differences between orthodox and handcrafted leaves, understanding the
            terroir that gives Nilgiris tea its distinctive muscatel character.
            This lifelong immersion is infused into every blend we serve.
          </p>
          <div className="story__stats">
            <div className="story__stat">
              <span className="story__stat-value">25+</span>
              <span className="story__stat-label">Years of Tea Craft</span>
            </div>
            <div className="story__stat">
              <span className="story__stat-value">6,500ft</span>
              <span className="story__stat-label">Elevation Sourcing</span>
            </div>
            <div className="story__stat">
              <span className="story__stat-value">100%</span>
              <span className="story__stat-label">Single-Origin</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
