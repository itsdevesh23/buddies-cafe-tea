import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Quote } from 'lucide-react';
import './Testimonials.css';

const testimonials = [
  {
    quote: 'The white tea here changed my entire understanding of what tea can be. Absolutely ethereal.',
    author: 'Priya M.',
    location: 'Bangalore',
  },
  {
    quote: "Nirmal's passion for tea is infectious. The tasting experience was the highlight of our Ooty trip.",
    author: 'Rahul & Anita',
    location: 'Mumbai',
  },
  {
    quote: 'Best kombucha I\'ve had in India. Fresh, alive, and perfectly balanced.',
    author: 'Sarah L.',
    location: 'London',
  },
  {
    quote: 'A hidden gem in Ooty. The ambience, the tea, the warmth — everything is world-class.',
    author: 'Vikram S.',
    location: 'Chennai',
  },
  {
    quote: 'We drove 3 hours just for their Nilgiris Dewdrop green tea. Worth every kilometer.',
    author: 'Deepa K.',
    location: 'Coimbatore',
  },
  {
    quote: "South India's answer to the finest tea rooms in the world. Unmissable.",
    author: 'Travel + Leisure India',
    location: '',
  },
];

const quoteVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.35, ease: 'easeIn' } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const Testimonials = () => {
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const intervalRef = useRef(null);

  const startAutoRotate = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startAutoRotate();
    return () => clearInterval(intervalRef.current);
  }, [startAutoRotate]);

  const handleDotClick = (index) => {
    setActive(index);
    startAutoRotate();
  };

  const current = testimonials[active];

  return (
    <section className="testimonials" ref={sectionRef}>
      <div className="testimonials__glow" />

      <motion.div
        className="testimonials__header"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <motion.span className="testimonials__label" variants={fadeUp}>
          What They Say
        </motion.span>
        <motion.h2 className="testimonials__heading" variants={fadeUp}>
          Stories from Our Guests
        </motion.h2>
      </motion.div>

      <div className="testimonials__carousel">
        <div className="testimonials__quote-icon">
          <Quote size={36} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="testimonials__slide"
            variants={quoteVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className="testimonials__stars">
              {'★★★★★'}
            </div>

            <blockquote className="testimonials__quote">
              "{current.quote}"
            </blockquote>

            <div className="testimonials__author">
              <span className="testimonials__author-name">{current.author}</span>
              {current.location && (
                <span className="testimonials__author-location">, {current.location}</span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="testimonials__dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`testimonials__dot ${i === active ? 'testimonials__dot--active' : ''}`}
              onClick={() => handleDotClick(i)}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
