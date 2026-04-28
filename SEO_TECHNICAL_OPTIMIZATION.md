# SEO & Technical Optimization Documentation

## Overview
This document outlines SEO best practices, technical optimization standards, and performance guidelines for the Web-Bolt project (A & C Mushroom Farm). Following these guidelines ensures optimal search engine visibility, fast page loads, and excellent user experience.

---

## 1. On-Page SEO Rules

### Title Tags
- **Format:** `Primary Keyword | Secondary Keyword | Brand Name`
- **Character Limit:** 50-60 characters
- **Examples:**
  - Homepage: `A & C Mushroom Farm | Mushroom Spawn Supplier in Nepal`
  - Product Page: `Shiitake Mushroom Spawn | Buy Fresh Spawn in Nepal | A & C Farm`
  - Category Page: `Oyster Mushroom Spawn | Premium Quality | Nepal Supplier`

### Meta Descriptions
- **Character Limit:** 150-160 characters
- **Structure:** Include primary keyword, value proposition, and call-to-action
- **Examples:**
  - `Premium Shiitake mushroom spawn from A & C Farm, Nepal. High yield, disease-free spawn for commercial and home cultivation. Buy now with free delivery.`
  - `Based in Pokhara, Nepal. We specialize in high-quality mushroom spawn production including Shiitake, Oyster, and Reishi mushroom spawn.`

### Keywords Strategy
- **Primary Keywords:** mushroom spawn, shiitake mushroom, oyster mushroom
- **Secondary Keywords:** mushroom cultivation, Nepal, Pokhara, buy mushroom spawn
- **Long-tail Keywords:** organic mushroom spawn delivery Nepal, commercial mushroom farming supplies

### Heading Structure (H1-H6)
- **H1:** One per page, includes primary keyword
- **H2:** Section headings, include secondary keywords
- **H3-H6:** Subsection headings for content organization
- **Example Structure:**
  ```html
  <h1>Shiitake Mushroom Spawn | Premium Quality</h1>
  <h2>Why Choose Our Shiitake Spawn?</h2>
  <h3>High Yield Guarantee</h3>
  <h3>Disease-Free Production</h3>
  ```

### URL Structure
- **Format:** `/category/product-name` (kebab-case)
- **Examples:** `/spawn/shiitake-mushroom`, `/kits/home-cultivation-kit`
- **Avoid:** Parameters, session IDs, unnecessary words

---

## 2. Image Optimization Standards

### File Formats
1. **WebP (Primary):** Use for all modern browsers
2. **JPEG (Fallback):** Provide for older browsers
3. **SVG:** For logos, icons, and simple graphics

### Compression Requirements
- **WebP:** 70-85% quality (balance size vs quality)
- **JPEG:** 60-75% quality
- **Maximum Dimensions:** 1920px width for hero images, 800px for product images
- **File Size Targets:**
  - Hero images: < 300KB
  - Product images: < 150KB
  - Thumbnails: < 50KB

### Implementation Example
```jsx
// Current implementation in Hero.tsx (good example)
<picture>
  <source
    media="(min-width: 1280px)"
    srcSet="/assets/images/product-bg.webp"
  />
  <source
    media="(min-width: 768px)"
    srcSet="/assets/images/product-bg.webp"
  />
  <img loading="lazy"
    src="/assets/images/product-bg.webp"
    alt="A lush green valley with a river running through it"
    className="absolute inset-0 w-full h-full object-cover"
  />
</picture>
```

### Alt Text Guidelines
- **Product Images:** `{product name} mushroom spawn - {key feature}`
- **Hero Images:** Descriptive context about the scene
- **Decorative Images:** Empty alt text (`alt=""`) or `role="presentation"`
- **Examples:**
  - `Shiitake mushroom spawn packet - premium quality for commercial farming`
  - `Fresh oyster mushrooms growing in controlled environment`

### Lazy Loading
```jsx
// Always include for images below the fold
<img
  src={product.image}
  alt={product.name}
  loading="lazy"  // Critical for performance
  decoding="async" // Helps with rendering performance
  className="..."
/>
```

---

## 3. File Structure Rules for Assets

### Directory Organization
```
assets/
├── images/
│   ├── products/          # Product images
│   │   ├── webp/         # WebP versions
│   │   ├── jpeg/         # JPEG fallbacks
│   │   └── originals/    # Original high-res (not deployed)
│   ├── hero/             # Hero/banner images
│   ├── icons/            # SVG icons
│   └── logos/            # Brand logos
├── fonts/                # Custom fonts
└── documents/            # PDFs, brochures
```

### Naming Conventions
- **Format:** `kebab-case-descriptive-name.webp`
- **Examples:**
  - `shiitake-mushroom-spawn-packet.webp`
  - `hero-banner-farm-landscape.webp`
  - `product-thumbnail-oyster.webp`

### Version Control
- Keep original high-resolution images in `originals/` directory
- Deploy only optimized versions
- Use Git LFS for large binary files

---

## 4. Performance Guidelines

### Page Speed Targets
- **Lighthouse Scores:** >90 for Performance, Accessibility, Best Practices, SEO
- **Core Web Vitals:**
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

### Caching Strategy
```nginx
# Example nginx configuration
location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(html)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

### Code Splitting (Vite/React)
```jsx
// Lazy load non-critical components
const ProductDetail = React.lazy(() => import('./features/products/components/ProductDetail'));
const ReviewSection = React.lazy(() => import('./features/reviews/components/ReviewSection'));

// Use in routes
<Suspense fallback={<LoadingSpinner />}>
  <ProductDetail {...props} />
</Suspense>
```

### Bundle Optimization
1. **Analyze Bundle:** `npm run build -- --report`
2. **Split Vendor Chunks:** Configure in `vite.config.ts`
3. **Tree Shaking:** Ensure dead code elimination
4. **Minify:** Enable in production build

### Critical CSS
- Extract above-the-fold CSS
- Inline critical CSS in `<head>`
- Load non-critical CSS asynchronously

---

## 5. React Component Best Practices for SEO

### ProductCard Component
**Current Implementation Review:**
```jsx
// Good practices already implemented:
<img
  src={product.image}
  alt={product.name}  // ✓ Uses product name
  loading="lazy"      // ✓ Lazy loading
  decoding="async"    // ✓ Async decoding
/>

<h3 className="...">{product.name}</h3>  // ✓ Semantic heading
```

**Improvements Needed:**
```jsx
// Add structured data for products
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.image,
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": "NPR",
    "availability": product.stockquantity > 0 
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock"
  }
}}
</script>
```

### ProductDetail Component
**SEO Enhancements:**
```jsx
// Current SEO component usage (good)
<SEO 
  title="Shiitake Mushroom Spawn | Buy Fresh Spawn in Nepal"
  description="Premium Shiitake mushroom spawn from A & C Farm, Nepal..."
/>

// Add breadcrumb structured data
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.aandcmushroomfarm.com.np"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Shop",
      "item": "https://www.aandcmushroomfarm.com.np/shop"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": product.name,
      "item": window.location.href
    }
  ]
}}
</script>
```

### Hero Component
**Optimization Checklist:**
- [x] Uses `<picture>` element with WebP sources
- [x] Includes `loading="lazy"` attribute
- [x] Has descriptive alt text
- [ ] Consider adding `fetchpriority="high"` for above-the-fold hero images
- [ ] Implement `srcset` for responsive images with different resolutions

**Recommended Update:**
```jsx
<picture>
  <source
    media="(min-width: 1280px)"
    srcSet="/assets/images/hero-bg-large.webp 1920w,
            /assets/images/hero-bg-medium.webp 1280w"
    sizes="100vw"
  />
  <source
    media="(min-width: 768px)"
    srcSet="/assets/images/hero-bg-medium.webp 1280w,
            /assets/images/hero-bg-small.webp 768w"
    sizes="100vw"
  />
  <img
    loading="eager"  // Hero is above the fold
    fetchpriority="high"
    src="/assets/images/hero-bg-small.webp"
    alt="A lush green valley with a river running through it - A & C Mushroom Farm in Pokhara, Nepal"
    className="absolute inset-0 w-full h-full object-cover"
  />
</picture>
```

### General Component Rules
1. **Semantic HTML:** Use appropriate tags (`<article>`, `<section>`, `<nav>`)
2. **ARIA Labels:** Add for interactive elements
3. **Focus Management:** Ensure keyboard navigation works
4. **Error Boundaries:** Wrap components to prevent React tree crashes
5. **Memoization:** Use `React.memo()` for expensive re-renders (already done in ProductCard)

---

## 6. Google Indexing Requirements

### Sitemap Implementation
**Current sitemap.xml (good foundation):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.aandcmushroomfarm.com.np/</loc>
    <lastmod>2026-04-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Additional URLs -->
</urlset>
```

**Recommended Additions:**
1. **Product URLs:** Add individual product pages
2. **Category URLs:** Add category listing pages
3. **Dynamic Lastmod:** Update automatically when content changes
4. **Image Sitemap:** Consider adding for product images

### robots.txt
**Current (good):**
```
User-agent: *
Allow: /
Sitemap: https://www.aandcmushroomfarm.com.np/sitemap.xml
```

**Additional Considerations:**
- Block sensitive directories: `Disallow: /admin/`
- Allow crawlers for public APIs if needed
- Specify crawl delay if server resources are limited

### Google Search Console Setup
1. **Verification:** Add domain property (recommended over URL prefix)
2. **Coverage Report:** Monitor indexed pages
3. **Performance Report:** Track queries, clicks, impressions
4. **Mobile Usability:** Ensure mobile-friendly
5. **Core Web Vitals:** Monitor performance metrics

### Indexing Best Practices
1. **Canonical URLs:** Always specify (already implemented in SEO component)
2. **hreflang:** Add if multilingual (`en_NP`, `ne_NP`)
3. **Noindex Rules:** Apply to:
   - Admin pages
   - Search result pages
   - Pagination beyond page 1 (optional)
4. **XML Sitemap Submission:** Submit via Search Console

---

## 7. Maintenance Checklist

### Before Every Deployment
- [ ] Run Lighthouse audit (`npm run build` then audit)
- [ ] Validate HTML (W3C Validator)
- [ ] Check mobile responsiveness
- [ ] Verify all images have alt text
- [ ] Test keyboard navigation
- [ ] Validate structured data (Google Rich Results Test)

### Weekly/Monthly
- [ ] Review Search Console reports
- [ ] Check for 404 errors in logs
- [ ] Update sitemap with new content
- [ ] Review page speed metrics
- [ ] Backup database and assets

### Quarterly
- [ ] Conduct full SEO audit
- [ ] Update keyword research
- [ ] Review competitor analysis
- [ ] Test core web vitals
- [ ] Update meta descriptions if needed

### When Adding New Features
- [ ] Add appropriate structured data
- [ ] Update sitemap.xml
- [ ] Test with screen readers
- [ ] Verify Google can crawl JavaScript content
- [ ] Check performance impact

---

## 8. Tools & Resources

### Development Tools
- **Lighthouse:** Built into Chrome DevTools
- **WebPageTest:** Advanced performance testing
- **GTmetrix:** Alternative performance tool
- **Screaming Frog:** SEO crawler
- **Ahrefs/SEMrush:** Keyword research (commercial)

### Build Process Integration
```json
// package.json scripts addition
"scripts": {
  "seo:audit": "lighthouse https://www.aandcmushroomfarm.com.np --output=json --output-path=./reports/lighthouse.json",
  "seo:check": "npm run build && npx serve -s dist & sleep 5 && npm run seo:audit",
  "images:optimize": "node scripts/optimize-images.js"
}
```

### Monitoring
1. **Google Analytics 4:** Track user behavior
2. **Google Search Console:** SEO performance
3. **Sentry/Bugsnag:** Error tracking
4. **New Relic/Datadog:** Performance monitoring

---

## 9. Common Issues & Solutions

### Problem: Images Not Optimized
**Solution:** Implement build-time optimization script
```javascript
// scripts/optimize-images.js
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');

(async () => {
  await imagemin(['assets/images/originals/*.{jpg,png}'], {
    destination: 'assets/images/webp',
    plugins: [imageminWebp({ quality: 75 })]
  });
})();
```

### Problem: Slow Page Loads
**Solution Checklist:**
1. Enable compression (gzip/brotli)
2. Implement CDN for static assets
3. Use HTTP/2 or HTTP/3
4. Preload critical resources
5. Defer non-critical JavaScript

### Problem: Poor Mobile Scores
**Solution:**
1. Implement responsive images
2. Reduce JavaScript execution time
3. Minimize main thread work
4. Use `will-change` sparingly
5. Implement virtualized lists for long content

---

## 10. Emergency Procedures

### If Google Drops Rankings
1. Check Search Console for manual actions
2. Review recent code changes
3. Test crawlability with Google URL Inspection
4. Check for duplicate content issues
5. Verify server response times

### If Site Goes Down
1. Check CDN status
2. Verify DNS configuration
3. Review server logs
4. Check for DDoS attacks
5. Implement maintenance page with `503` status

### If Performance Degrades
1. Run Lighthouse comparison
2. Check bundle size changes
3. Review new dependencies
4. Analyze network requests
5. Check database query performance

---

**Last Updated:** 2026-04-28  
**Maintainer:** Development Team  
**Review Schedule:** Quarterly
