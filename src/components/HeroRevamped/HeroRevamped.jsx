import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import heroImg from '../../assets/hero_4k.png';
import './HeroRevamped.css';

const LEAVES = [
  { id: 1, x: '10%', y: '20%', size: 28, delay: 0, duration: 6 },
  { id: 2, x: '85%', y: '15%', size: 22, delay: 1.2, duration: 7 },
  { id: 3, x: '70%', y: '65%', size: 32, delay: 0.5, duration: 5 },
  { id: 4, x: '20%', y: '75%', size: 20, delay: 2, duration: 8 },
  { id: 5, x: '55%', y: '30%', size: 26, delay: 1.5, duration: 6.5 },
  { id: 6, x: '40%', y: '85%', size: 24, delay: 0.8, duration: 7.5 },
  { id: 7, x: '92%', y: '50%', size: 18, delay: 2.5, duration: 5.5 },
];

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  size: Math.random() * 4 + 2,
  delay: Math.random() * 4,
  duration: Math.random() * 4 + 4,
}));

export default function HeroRevamped() {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const isInView = useInView(contentRef, { once: true });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const subtitleY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.55, 0.85]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section className="hero-revamped" ref={containerRef} id="hero">
      {/* Background Image */}
      <motion.div className="hero-revamped__bg" style={{ scale: imageScale }}>
        <img src={heroImg} alt="Golden amber tea on mossy stone" />
      </motion.div>

      {/* Dark Overlay */}
      <motion.div
        className="hero-revamped__overlay"
        style={{ opacity: overlayOpacity }}
      />

      {/* Floating Tea Leaves */}
      {LEAVES.map((leaf) => (
        <motion.span
          key={leaf.id}
          className="hero-revamped__leaf"
          style={{ left: leaf.x, top: leaf.y, fontSize: leaf.size }}
          animate={{
            y: [0, -20, 0, 15, 0],
            x: [0, 10, -5, 8, 0],
            rotate: [0, 15, -10, 5, 0],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          🍃
        </motion.span>
      ))}

      {/* Particle Dots */}
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="hero-revamped__particle"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <div className="hero-revamped__content" ref={contentRef}>
        <motion.div
          className="hero-revamped__title-block"
          style={{ y: titleY }}
        >
          <motion.h1
            className="hero-revamped__title"
            initial={{ opacity: 0, y: 60 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <span className="hero-revamped__title-line">DANJO</span>
            <span className="hero-revamped__title-line hero-revamped__title-line--sub">
              TEAS
            </span>
          </motion.h1>
        </motion.div>

        <motion.div
          className="hero-revamped__text-block"
          style={{ y: subtitleY }}
        >
          <motion.p
            className="hero-revamped__subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            South India&rsquo;s First Specialty Tea Room &middot; Est. 2012
          </motion.p>

          <motion.p
            className="hero-revamped__tagline"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Rooted in Heritage. Brewed with Soul.
          </motion.p>

          <motion.div
            className="hero-revamped__cta-group"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <a href="#philosophy" className="btn-primary hero-revamped__cta">
              Explore Our World
            </a>
            <Link
              to="/shop"
              className="btn-primary hero-revamped__cta hero-revamped__cta--secondary"
            >
              Shop Teas
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="hero-revamped__scroll-indicator"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="hero-revamped__scroll-text">Scroll</span>
        <ChevronDown size={20} />
      </motion.div>
    </section>
  );
}
