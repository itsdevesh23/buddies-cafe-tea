import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Leaf, MapPin, Sprout } from 'lucide-react';
import './Philosophy.css';

const CARDS = [
  {
    icon: Leaf,
    title: 'Handcrafted',
    description:
      'Every blend is hand-finished by our master tea maker, honoring orthodox techniques passed down through generations.',
  },
  {
    icon: MapPin,
    title: 'Single-Origin',
    description:
      'Sourced exclusively from Nilgiris micro-lots, each tea carries the unmistakable terroir of the Blue Mountains.',
  },
  {
    icon: Sprout,
    title: 'Biodynamic',
    description:
      'Our partner gardens follow biodynamic practices, cultivating tea in harmony with the mountain ecosystem.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

export default function Philosophy() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section className="philosophy" id="philosophy" ref={sectionRef}>
      {/* Glow backdrop */}
      <div className="philosophy__glow" />

      <motion.div
        className="philosophy__container"
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        <motion.span className="philosophy__label" variants={itemVariants}>
          Our Philosophy
        </motion.span>

        <motion.h2 className="philosophy__heading" variants={itemVariants}>
          More Than Tea. A Ritual.
        </motion.h2>

        <motion.div className="philosophy__body" variants={itemVariants}>
          <p>
            Every cup at Buddies Cafe is a meditation on flavor — crafted from
            leaves that have absorbed the morning mist of the Nilgiris, kissed
            by altitude and nurtured by soil that has told a thousand stories.
            We don&rsquo;t rush. We listen to the leaf, and the leaf speaks
            through the brew.
          </p>
          <p>
            Our commitment is to authentic, unblended, single-origin teas that
            honor the terroir of these ancient mountains. From the moment a leaf
            is hand-plucked to the second it unfurls in your cup, every step is
            guided by reverence — for the craft, for the land, and for the
            people who make it possible.
          </p>
        </motion.div>

        <motion.div
          className="philosophy__cards"
          variants={containerVariants}
        >
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                className="philosophy__card glass-panel"
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
              >
                <div className="philosophy__card-icon">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="philosophy__card-title">{card.title}</h3>
                <p className="philosophy__card-desc">{card.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
