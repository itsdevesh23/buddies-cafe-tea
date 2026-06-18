import React from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../../components/PageTransition/PageTransition';
import './GalleryPage.css';

const galleryItems = [
  { id: 1, title: 'Morning Brew', className: 'gallery__item--large' },
  { id: 2, title: 'Tea Gardens', className: 'gallery__item--wide' },
  { id: 3, title: 'The Ritual', className: 'gallery__item--tall' },
  { id: 4, title: 'Our Space', className: 'gallery__item--square' },
  { id: 5, title: 'Kombucha Lab', className: 'gallery__item--tall' },
  { id: 6, title: 'Matcha Magic', className: 'gallery__item--wide' },
  { id: 7, title: 'Ooty Evenings', className: 'gallery__item--square' },
];

const GalleryPage = () => {
  return (
    <PageTransition>
      <div className="gallery-page">
        <header className="gallery__header">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="gallery__title"
          >
            Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="gallery__subtitle"
          >
            A visual journey through Buddies Cafe
          </motion.p>
        </header>

        <motion.div
          className="gallery__grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              className={`gallery__item ${item.className}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="gallery__placeholder-bg"></div>
              <div className="gallery__overlay">
                <h3 className="gallery__overlay-title">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default GalleryPage;
