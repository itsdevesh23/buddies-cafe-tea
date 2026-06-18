import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'syoc9xav',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-05-01',
});

client.fetch('*[_type == "product"]').then(res => {
  console.log('CDN Response length:', res.length);
}).catch(console.error);
