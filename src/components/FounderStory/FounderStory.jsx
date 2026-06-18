import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import teaCeremonyImg from '../../assets/tea_ceremony.png';
import './FounderStory.css';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export default function FounderStory() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section className="founder" id="founder" ref={sectionRef}>
      <motion.div
        className="founder__grid"
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        {/* Left — Image */}
        <motion.div className="founder__image-col" variants={fadeLeft}>
          <div className="founder__image-frame">
            <img
              src={teaCeremonyImg}
              alt="Hands pouring tea in traditional ceremony"
              className="founder__image"
            />
            <div className="founder__image-border" />
          </div>
        </motion.div>

        {/* Right — Text */}
        <div className="founder__text-col">
          <motion.span className="founder__label" variants={fadeUp}>
            The Founder
          </motion.span>

          <motion.h2 className="founder__heading" variants={fadeUp}>
            <span className="founder__heading-name">Nirmal Raj</span>
          </motion.h2>

          <motion.h3 className="founder__subheading" variants={fadeUp}>
            In Memory of Mr. Daniel Dhanaseelan
          </motion.h3>

          <motion.div className="founder__body" variants={fadeUp}>
            <p>
              The story of Buddies Cafe begins not in a boardroom, but inside
              the weathered walls of a tea factory in the Nilgiris. Nirmal
              Raj&rsquo;s father, Daniel Dhanaseelan, was a renowned tea maker
              and tea taster who dedicated decades of his life to the craft —
              walking the misty estates at dawn, reading the flush of each leaf,
              and perfecting the art of orthodox tea processing.
            </p>
            <p>
              Growing up immersed in the rhythm of tea factories, Nirmal
              absorbed the knowledge organically: the scent of withering leaves,
              the precise timing of oxidation, the gentle roll that preserves a
              tea&rsquo;s muscatel soul. This lifelong immersion became the
              foundation upon which Buddies Cafe was established in 2012.
            </p>
            <p>
              What started as a humble tea room with 15 carefully curated
              varieties has blossomed into a destination offering over 100
              single-origin teas, each one a testament to the family&rsquo;s
              unbroken legacy of craftsmanship and devotion.
            </p>
          </motion.div>

          <motion.blockquote className="founder__quote" variants={fadeUp}>
            <p>
              &ldquo;Every leaf carries a memory of these mountains, and every
              cup is a tribute to my father&rsquo;s lifelong devotion to
              tea.&rdquo;
            </p>
          </motion.blockquote>

          <motion.p className="founder__signature" variants={fadeUp}>
            — Nirmal Raj, Founder &amp; CEO
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}
