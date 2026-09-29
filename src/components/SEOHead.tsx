import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const SEOHead: React.FC = () => {
  const { 
    currentRoute, 
    activeCreatorSlug, 
    activeProductId, 
    activeDropId,
    creators, 
    products, 
    drops 
  } = useApp();

  useEffect(() => {
    let title = "DROPKULTURE — Kenya's Official Creator Merchandise & Drops";
    let description = "Premium African creator merchandise marketplace connecting fans with official drops from artists, comedians, athletes, and cultural icons.";
    let image = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=85&w=1200";
    let canonicalPath = "/";
    let schemaJson: Record<string, any> | null = null;

    if (currentRoute === 'creator' && activeCreatorSlug) {
      const creator = creators.find(c => c.slug === activeCreatorSlug);
      if (creator) {
        title = `${creator.name} Official Store & Drops — DROPKULTURE`;
        description = `Shop official ${creator.name} merchandise, hoodies, tees, and limited drops. 100% authentic, delivered across all 47 Kenyan counties with M-Pesa.`;
        image = creator.bannerUrl || creator.avatarUrl;
        canonicalPath = `/creator/${creator.slug}`;

        schemaJson = {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "mainEntity": {
            "@type": "Person",
            "name": creator.name,
            "description": creator.bio,
            "image": creator.avatarUrl,
            "jobTitle": `${creator.category} Creator`,
            "nationality": creator.country,
            "sameAs": Object.values(creator.socialLinks || {})
          }
        };
      }
    } else if (currentRoute === 'product' && activeProductId) {
      const product = products.find(p => p.id === activeProductId || p.slug === activeProductId);
      if (product) {
        title = `${product.name} — Official ${product.creatorName} Merch | DROPKULTURE`;
        description = `Buy the official ${product.name} by ${product.creatorName} for KES ${product.priceKES.toLocaleString()}. 450 GSM French Terry, Nairobi same-day dispatch, delivered countrywide.`;
        image = product.images?.[0] || image;
        canonicalPath = `/product/${product.id}`;

        schemaJson = {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "image": product.images,
          "description": product.description,
          "brand": {
            "@type": "Brand",
            "name": product.creatorName
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "KES",
            "price": product.priceKES,
            "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "DROPKULTURE"
            }
          }
        };
      }
    } else if (currentRoute === 'drops') {
      title = "Official Creator Drops & Limited Capsules — DROPKULTURE Kenya";
      description = "Explore high-heat limited creator drops and capsules from Nairobi's top cultural figures. Serialized pieces, instant M-Pesa checkout, countrywide delivery.";
      canonicalPath = "/drops";
    } else if (currentRoute === 'explore') {
      title = "Discover African Creators & Exclusive Streetwear — DROPKULTURE";
      description = "Browse official merchandise from musicians, comedians, athletes, and cultural storytellers across Kenya and Africa.";
      canonicalPath = "/explore";
    } else if (currentRoute === 'become-a-creator') {
      title = "Launch Your Official Creator Brand & Merch — DROPKULTURE";
      description = "Apply to launch your official merchandise line. Zero upfront cost, 450 GSM French Terry manufacturing, Nairobi hub fulfillment, and 30% net royalties via M-Pesa.";
      canonicalPath = "/become-a-creator";
    } else if (currentRoute === 'about') {
      title = "About DROPKULTURE — Building Africa's Creator Commerce Infrastructure";
      description = "Learn how DROPKULTURE empowers African creators with physical manufacturing, Nairobi central logistics, and direct fan monetization.";
      canonicalPath = "/about";
    } else if (currentRoute === 'terms') {
      title = "Terms & Commercial Policies — DROPKULTURE Kenya";
      description = "Official commercial terms, creator royalties, domestic 47 counties fulfillment, and return policies.";
      canonicalPath = "/terms";
    }

    // 1. Update Document Title
    document.title = title;

    // 2. Helper to set or create meta tag
    const setMeta = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Update Standard Meta
    setMeta('name', 'description', description);

    // 4. Update OpenGraph Tags
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', `https://dropkulture.com${canonicalPath}`);

    // 5. Update Twitter Cards
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    // 6. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://dropkulture.com${canonicalPath}`);

    // 7. Inject Dynamic Schema.org JSON-LD
    const SCRIPT_ID = 'dynamic-seo-ld-json';
    let scriptTag = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (schemaJson) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = SCRIPT_ID;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(schemaJson);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [currentRoute, activeCreatorSlug, activeProductId, activeDropId, creators, products, drops]);

  return null;
};
