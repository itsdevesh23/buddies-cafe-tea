import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'placeholder-id',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2024-05-01', // use current date
})

const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}
