import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface SeoOptions {
  title: string;
  description: string;
  /** Full canonical URL. If not set, uses siteUrl + current path. */
  canonicalUrl?: string;
  /** OG image URL (1200x630 recommended). Defaults to siteUrl + /og-default.png if you add it. */
  image?: string;
  /** No index (e.g. login, signup). Default false. */
  noIndex?: boolean;
}

const DEFAULT_IMAGE = '/assets/og-default.png';
const SITE_NAME = 'freefreelancer';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  /**
   * Update head for the current page. Call from each page's ngOnInit.
   * Title: keep 50–60 chars. Description: 150–160 chars.
   */
  update(options: SeoOptions): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const siteUrl = environment.siteUrl.replace(/\/$/, '');
    const canonical = options.canonicalUrl ?? (siteUrl + this.getCurrentPath());
    const image = options.image?.startsWith('http') ? options.image : siteUrl + (options.image || DEFAULT_IMAGE);

    this.title.setTitle(this.truncate(options.title, 60));
    this.meta.updateTag({ name: 'description', content: this.truncate(options.description, 160) });
    this.meta.updateTag({
      name: 'robots',
      content: options.noIndex ? 'noindex, nofollow' : 'index, follow',
    });

    this.setCanonical(canonical);

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: options.title });
    this.meta.updateTag({ property: 'og:description', content: options.description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: options.title });
    this.meta.updateTag({ name: 'twitter:description', content: options.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  private getCurrentPath(): string {
    const path = this.doc.location?.pathname ?? '/';
    return path || '/';
  }

  private setCanonical(url: string): void {
    const head = this.doc.getElementsByTagName('head')[0];
    if (!head) return;
    let link = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private truncate(s: string, max: number): string {
    if (s.length <= max) return s;
    return s.slice(0, max - 3) + '...';
  }

  /**
   * Inject a JSON-LD script into the document head. Call from pages that need structured data.
   * Returns a function to remove the script (e.g. on destroy).
   */
  injectJsonLd(data: object): () => void {
    if (!isPlatformBrowser(this.platformId)) return () => {};
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    this.doc.head.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }
}
