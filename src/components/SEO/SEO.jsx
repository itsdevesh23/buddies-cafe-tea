import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, image, url }) => {
  const defaultTitle = "Danjo Teas | Premium Nilgiris Tea Experience";
  const defaultDescription = "Immerse yourself in the authentic Nilgiris tea heritage. Experience handcrafted teas, specialty kombucha, and our exclusive Buddies Cafe experience.";
  const defaultImage = "https://danjoteas.com/assets/default-preview.jpg"; // Fallback image if needed
  
  const seoTitle = title || defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;
  const seoUrl = url ? `https://danjoteas.com${url}` : "https://danjoteas.com";

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{seoTitle}</title>
      <meta name='description' content={seoDescription} />
      
      {/* OpenGraph tags */}
      <meta property="og:type" content={type || 'website'} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content={name || "Danjo Teas"} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name || "Danjo Teas"} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
    </Helmet>
  );
};

export default SEO;
