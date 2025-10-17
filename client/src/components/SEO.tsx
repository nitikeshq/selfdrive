import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  canonical?: string;
}

export function SEO({ 
  title, 
  description, 
  keywords, 
  ogImage = "https://driveease.in/og-image.jpg",
  ogType = "website",
  canonical 
}: SEOProps) {
  useEffect(() => {
    // Set page title
    document.title = `${title} | DriveEase`;

    // Set or update meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.content = content;
    };

    // Basic meta tags
    setMeta('description', description);
    if (keywords) {
      setMeta('keywords', keywords);
    }

    // Open Graph tags
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', ogType, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:site_name', 'DriveEase', true);

    // Twitter Card tags
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // Canonical URL
    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.rel = 'canonical';
        document.head.appendChild(linkElement);
      }
      linkElement.href = canonical;
    }
  }, [title, description, keywords, ogImage, ogType, canonical]);

  return null; // This component doesn't render anything
}
