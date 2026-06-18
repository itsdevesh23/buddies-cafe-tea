import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Flower2, Sun, Factory, Coffee } from 'lucide-react';
import './Heritage.css';

const STEPS = [
  {
    num: '01',
    icon: Flower2,
    title: 'The Gardens',
    description:
      'Tea sourced directly from farmers at 6,500ft elevation in the Nilgiris Blue Mountains.',
  },
  {
    num: '02',
    icon: Sun,
    title: 'The Harvest',
    description:
      'Hand-plucked leaves selected at peak freshness, biodynamic and fairtrade practices.',
  },
  {
    num: '03',
    icon: Factory,
    title: 'The Craft',
    description:
      'Orthodox processing by master tea makers preserving the muscatel character.',
  },
  {
    num: '04',
    icon: Coffee,
    title: 'The Cup',
    description:
      'Freshly brewed by our world-class tea master, served with reverence.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function Heritage() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section className="heritage" id="heritage" ref={sectionRef}>
      {/* Mountain gradient backdrop */}
      <div className="heritage__backdrop" />

      <motion.div
        className="heritage__container"
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        <motion.span className="heritage__label" variants={headingVariants}>
          Nilgiris Heritage
        </motion.span>

        <motion.h2 className="heritage__heading" variants={headingVariants}>
          From Mountain to Cup
        </motion.h2>

        {/* Timeline */}
        <div className="heritage__timeline">
          {/* Connecting Line */}
          <div className="heritage__line" />

          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                className="heritage__step"
                variants={stepVariants}
              >
                <div className="heritage__step-num">{step.num}</div>
                <div className="heritage__step-icon">
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="heritage__step-title">{step.title}</h3>
                <p className="heritage__step-desc">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
