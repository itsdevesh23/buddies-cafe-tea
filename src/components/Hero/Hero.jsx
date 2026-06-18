import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import heroImg from '../../assets/matcha_hero.png';
import './Hero.css';

function FloatingLeaf({ style, delay }) {
  return (
    <motion.div
      className="hero__leaf"
      style={style}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 15, -10, 0],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 6 + Math.random() * 4,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      🍃
    </motion.div>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.3, 0.8]);

  const leaves = [
    { top: '15%', left: '10%', fontSize: '2rem' },
    { top: '25%', right: '12%', fontSize: '1.5rem' },
    { top: '60%', left: '5%', fontSize: '1.8rem' },
    { top: '70%', right: '8%', fontSize: '2.2rem' },
    { top: '40%', left: '85%', fontSize: '1.6rem' },
    { top: '50%', left: '15%', fontSize: '1.3rem' },
  ];

  return (
    <section className="hero" ref={ref} id="home">
      {/* Background image with parallax */}
      <motion.div className="hero__bg" style={{ y: imageY }}>
        <img src={heroImg} alt="Buddies Cafe premium matcha experience" />
        <motion.div className="hero__overlay" style={{ opacity: overlayOpacity }} />
      </motion.div>

      {/* Atmospheric glow */}
      <div className="hero__glow hero__glow--top" />
      <div className="hero__glow hero__glow--bottom" />

      {/* Floating tea leaves */}
      {leaves.map((s, i) => (
        <FloatingLeaf key={i} style={s} delay={i * 0.8} />
      ))}

      {/* Content */}
      <div className="hero__content">
        <motion.p
          className="hero__tagline"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Rooted in the Nilgiris
        </motion.p>

        <motion.h1 className="hero__title" style={{ y: titleY }}>
          <motion.span
            className="hero__title-line"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            BUDDIES
          </motion.span>
          <motion.span
            className="hero__title-line hero__title-line--accent"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            CAFE TEA
          </motion.span>
        </motion.h1>

        <motion.p
          className="hero__subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          The Vibrant Awakening
        </motion.p>

        <motion.a
          href="#blends"
          className="hero__cta glass-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(124,154,94,0.3)' }}
          whileTap={{ scale: 0.97 }}
        >
          Explore the Ritual
        </motion.a>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="hero__scroll-indicator"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="hero__scroll-line" />
      </motion.div>
    </section>
  );
}
