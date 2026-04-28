import { HelmetProvider, Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
}

const DEFAULT_TITLE = 'A & C Mushroom Farm | Mushroom Spawn Supplier in Nepal';
const DEFAULT_DESCRIPTION = 'Based in Pokhara, Nepal. We specialize in high-quality mushroom spawn production including Shiitake, Oyster, and Reishi mushroom spawn for farmers and enthusiasts across Nepal.';
const DEFAULT_KEYWORDS = 'mushroom spawn, shiitake mushroom, oyster mushroom, reishi mushroom, mushroom cultivation, Nepal, Pokhara, buy mushroom spawn, organic mushroom spawn';
const DEFAULT_CANONICAL = 'https://www.aandcmushroomfarm.com.np';
const DEFAULT_OG_IMAGE = 'https://www.aandcmushroomfarm.com.np/og-image.jpg';

export function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical = DEFAULT_CANONICAL,
  ogTitle = DEFAULT_TITLE,
  ogDescription = DEFAULT_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  twitterCard = 'summary_large_image',
}: SEOProps) {
  return (
    <Helmet>
      {/* General Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="A & C Mushroom Farm" />
      <meta property="og:locale" content="en_NP" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      <link rel="apple-touch-icon" href="/vite.svg" />
    </Helmet>
  );
}

export { HelmetProvider };
