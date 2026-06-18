import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'syoc9xav',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: false, // Disabled CDN for instant updates
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2024-05-01',
});

const builder = imageUrlBuilder(client);

export function urlFor(source) {
  return builder.image(source);
}
