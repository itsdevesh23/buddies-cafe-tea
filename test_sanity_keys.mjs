import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: 'syoc9xav',
  dataset: 'production',
  apiVersion: '2024-05-01',
  useCdn: false
});

async function run() {
  const products = await sanityClient.fetch('*[_type == "product"]');
  console.log(JSON.stringify(products[1], null, 2));
}

run();
