export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogUrl?: string;
  twitterHandle?: string;
  canonical?: string;
  robots?: string;
  author?: string;
}

class SEOManager {
  private defaultConfig: SEOConfig = {
    title: 'All-In-One AI - Universal AI Platform',
    description: 'Access GPT-4, Claude, Gemini in one place. Chat, create agents, build workflows.',
    keywords: ['ai', 'chatbot', 'gpt', 'claude', 'gemini', 'automation', 'agents'],
    ogImage: '/og-image.png',
    twitterHandle: '@allinoneai',
    robots: 'index, follow',
    author: 'All-In-One AI',
  };

  generateMetaTags(config: Partial<SEOConfig> = {}): Record<string, string> {
    const merged = { ...this.defaultConfig, ...config };

    return {
      'og:title': merged.title,
      'og:description': merged.description,
      'og:image': merged.ogImage || '',
      'og:url': merged.ogUrl || 'https://allinone.ai',
      'og:type': 'website',
      'twitter:card': 'summary_large_image',
      'twitter:title': merged.title,
      'twitter:description': merged.description,
      'twitter:image': merged.ogImage || '',
      'twitter:creator': merged.twitterHandle || '',
      'description': merged.description,
      'keywords': merged.keywords.join(', '),
      'author': merged.author || '',
      'robots': merged.robots || '',
      'canonical': merged.canonical || 'https://allinone.ai',
    };
  }

  generateStructuredData(pageType: 'product' | 'article' | 'organization' = 'product') {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': pageType === 'product' ? 'SoftwareApplication' : pageType === 'article' ? 'BlogPosting' : 'Organization',
      name: 'All-In-One AI',
      url: 'https://allinone.ai',
      description: this.defaultConfig.description,
      image: this.defaultConfig.ogImage,
    };

    if (pageType === 'product') {
      return {
        ...baseData,
        '@type': 'SoftwareApplication',
        applicationCategory: 'DeveloperApplication',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: 'free',
          url: 'https://allinone.ai',
        },
      };
    }

    return baseData;
  }

  generateSitemap(routes: string[]): string {
    const entries = routes.map((route) => ({
      loc: `https://allinone.ai${route}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: route === '/' ? '1.0' : '0.8',
    }));

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  }

  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /.next/
Disallow: /*.json$

User-agent: Googlebot
Allow: /

Crawl-delay: 1
Request-rate: 1/10s

Sitemap: https://allinone.ai/sitemap.xml

# Pages to prioritize
Allow: /chat
Allow: /agents
Allow: /workflows
Allow: /login
Allow: /register`;
  }

  generateOpenGraphTags(config: Partial<SEOConfig> = {}): string {
    const tags = this.generateMetaTags(config);
    return Object.entries(tags)
      .filter(([key]) => key.startsWith('og:'))
      .map(([key, value]) => `<meta property="${key}" content="${value}" />`)
      .join('\n');
  }

  generateTwitterTags(config: Partial<SEOConfig> = {}): string {
    const tags = this.generateMetaTags(config);
    return Object.entries(tags)
      .filter(([key]) => key.startsWith('twitter:'))
      .map(([key, value]) => `<meta name="${key}" content="${value}" />`)
      .join('\n');
  }

  // Optimize meta description length
  optimizeDescription(description: string, maxLength: number = 160): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength - 3) + '...';
  }

  // Check SEO health
  checkSEOHealth(config: Partial<SEOConfig> = {}): {
    score: number;
    issues: string[];
  } {
    const merged = { ...this.defaultConfig, ...config };
    const issues: string[] = [];
    let score = 100;

    if (!merged.title || merged.title.length < 10) {
      issues.push('Title too short (min 10 chars)');
      score -= 20;
    }
    if (merged.title.length > 60) {
      issues.push('Title too long (max 60 chars)');
      score -= 10;
    }

    if (!merged.description || merged.description.length < 50) {
      issues.push('Description too short (min 50 chars)');
      score -= 20;
    }
    if (merged.description.length > 160) {
      issues.push('Description too long (max 160 chars)');
      score -= 10;
    }

    if (!merged.keywords || merged.keywords.length < 3) {
      issues.push('Add at least 3 keywords');
      score -= 15;
    }

    if (!merged.ogImage) {
      issues.push('Missing OG image');
      score -= 15;
    }

    return { score: Math.max(0, score), issues };
  }
}

export const seoManager = new SEOManager();
