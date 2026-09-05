/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Dynamic SEO & OpenGraph Head Manager
 */
import React, { useEffect } from 'react';

export interface SeoProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any>;
}

export const SeoHead: React.FC<SeoProps> = ({
  title = 'AudioFACTORY | Turn words into finished audio.',
  description = 'AI-powered scripts, voices, dialogue and sound — in one production studio. Create multi-speaker scenes, high-fidelity speech, instant voice cloning, and algorithmic BGM.',
  canonicalPath = '/',
  ogType = 'website',
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Page Title
    document.title = title.includes('AudioFACTORY') ? title : `${title} | AudioFACTORY`;

    // 2. Helper to set or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Standard Meta
    setMeta('description', description);
    setMeta('robots', 'index, follow');

    // OpenGraph
    const fullUrl = `https://audiofactory.app${canonicalPath}`;
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', ogType, true);
    setMeta('og:url', fullUrl, true);
    setMeta('og:site_name', 'AudioFACTORY', true);
    setMeta('og:image', 'https://audiofactory.app/og-image.png', true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:site', '@audiofactoryapp');
    setMeta('twitter:image', 'https://audiofactory.app/og-image.png');

    // Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullUrl);

    // JSON-LD Structured Data
    const defaultJsonLd = jsonLd || {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'AudioFACTORY',
      'operatingSystem': 'Web, Android',
      'applicationCategory': 'MultimediaApplication',
      'offers': {
        '@type': 'Offer',
        'price': '0.00',
        'priceCurrency': 'USD',
      },
      'description': description,
      'url': fullUrl,
    };

    let scriptTag = document.querySelector('#audiofactory-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'audiofactory-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(defaultJsonLd);
  }, [title, description, canonicalPath, ogType, jsonLd]);

  return null;
};
