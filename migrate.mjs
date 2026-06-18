import { createClient } from '@sanity/client';
import { PRODUCTS as products } from './src/data/products.js';

const client = createClient({
  projectId: 'syoc9xav',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-05-01',
  token: 'skYYwNWZT28VCS39OqeDUNa5EFsIpUPHAuiZcTMda24icX2nSVaFeWtDSW0VVTgNNTYvq670nHXXfeIR7fkzDRcL5qfH9gxC0xSTqVbFC1Udk2vcrzNfypkzJt1ZDgDFYzWN9Fb0fUCwrOFIPV5vp7uOq9hrHwH7vaNbN3QBG8L1Iu2OiWyr',
});

async function migrate() {
  console.log(`Starting migration of ${products.length} products to Sanity...`);
  
  for (const product of products) {
    const doc = {
      _type: 'product',
      name: product.name,
      slug: {
        _type: 'slug',
        current: product.slug,
      },
      price: product.price,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      tastingNotes: product.tastingNotes,
      aroma: product.aroma,
      origin: product.origin,
      brewTemp: product.brewTemp,
      steepTime: product.steepTime,
      servings: product.servings,
      benefits: product.benefits,
      pairings: product.pairings,
      tags: product.tags,
      stock: 100,
      inStock: true,
      accentColor: product.accentColor,
    };

    try {
      const res = await client.create(doc);
      console.log(`Successfully migrated: ${res.name}`);
    } catch (err) {
      console.error(`Error migrating ${product.name}:`, err.message);
    }
  }
  
  console.log('Migration complete!');
}

migrate();
