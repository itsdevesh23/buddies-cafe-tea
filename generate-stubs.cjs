const fs = require('fs');
const path = require('path');

const pages = [
  { name: 'Tasting', path: 'Tasting/Tasting' },
  { name: 'KombuchaPage', path: 'Kombucha/KombuchaPage' },
  { name: 'HeritagePage', path: 'HeritagePage/HeritagePage' },
  { name: 'FounderPage', path: 'FounderPage/FounderPage' },
  { name: 'CafePage', path: 'CafePage/CafePage' },
  { name: 'GalleryPage', path: 'Gallery/GalleryPage' },
  { name: 'JournalPage', path: 'Journal/JournalPage' },
  { name: 'ContactPage', path: 'Contact/ContactPage' },
  { name: 'FAQPage', path: 'FAQ/FAQPage' },
  { name: 'ShippingPage', path: 'Shipping/ShippingPage' },
  { name: 'AccountPage', path: 'Account/AccountPage' },
  { name: 'BookingPage', path: 'Booking/BookingPage' },
  { name: 'CheckoutPage', path: 'Checkout/CheckoutPage' }
];

const basePath = path.join(__dirname, 'src', 'pages');

pages.forEach(page => {
  const jsxContent = `import React from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../../components/PageTransition/PageTransition';
import './${path.basename(page.path)}.css';

export default function ${page.name}() {
  return (
    <PageTransition>
      <div className="page-stub">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ${page.name.replace('Page', '')}
        </motion.h1>
        <p>Premium content coming soon.</p>
      </div>
    </PageTransition>
  );
}
`;

  const cssContent = `.page-stub {
  padding: 10rem 2rem;
  text-align: center;
  color: var(--color-text-cream);
  min-height: 70vh;
}
.page-stub h1 {
  font-family: var(--font-heading);
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--color-accent-matcha);
}
`;

  const dir = path.join(basePath, path.dirname(page.path));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const jsxPath = path.join(basePath, `${page.path}.jsx`);
  const cssPath = path.join(basePath, `${page.path}.css`);

  fs.writeFileSync(jsxPath, jsxContent);
  fs.writeFileSync(cssPath, cssContent);
});

console.log('Stubs created successfully.');
