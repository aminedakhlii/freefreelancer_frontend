import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="hero">
      <h1>US-Focused Freelancing, Quality-First</h1>
      <p class="lead">Minimum $1,000 projects. AI-validated skills. No platform fees (MVP).</p>
      <div class="cta">
        <button type="button" class="btn btn-primary" (click)="router.navigate(['/signup'])">Get started</button>
        <a routerLink="/how-it-works" class="btn btn-outline">How it works</a>
      </div>
    </div>
    <section class="features container">
      <h2>Why freefreelancer</h2>
      <div class="grid">
        <div class="card"><h3>Quality bar</h3><p>AI skill interviews for every bid so clients see verified competence.</p></div>
        <div class="card"><h3>Serious budgets</h3><p>Projects start at $1,000 so freelancers work on meaningful work.</p></div>
        <div class="card"><h3>Your data</h3><p>Import portfolio from Upwork, Fiverr, Freelancer.com, GitHub.</p></div>
      </div>
    </section>
  `,
  styles: [`
    .hero { text-align: center; padding: 4rem 2rem; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    .lead { font-size: 1.25rem; color: var(--text-muted); margin-bottom: 2rem; }
    .cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .cta .btn { cursor: pointer; font-size: 1rem; padding: 0.5rem 1.25rem; border-radius: 6px; }
    .cta .btn-primary { background: var(--primary); color: #fff; border: none; }
    .btn-outline { background: transparent; border: 2px solid var(--primary); color: var(--primary); text-decoration: none; padding: 0.5rem 1rem; border-radius: 6px; }
    .features { padding: 3rem 0; }
    .features h2 { margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }
    .grid .card h3 { margin-top: 0; }
  `],
})
export class HomeComponent implements OnInit, OnDestroy {
  router = inject(Router);
  private seo = inject(SeoService);
  private removeJsonLd: (() => void)[] = [];

  ngOnInit() {
    this.seo.update({
      title: 'freefreelancer - US Freelance Jobs $1000+ | AI-Verified Skills',
      description: 'Premium US-only freelancing platform. $1000+ projects, AI skill validation, zero fees. Connect with verified US freelancers or find high-paying clients today.',
    });
    const siteUrl = environment.siteUrl.replace(/\/$/, '');
    this.removeJsonLd.push(this.seo.injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'freefreelancer',
      url: siteUrl,
      description: 'US-only freelancing platform with AI skill validation',
    }));
    this.removeJsonLd.push(this.seo.injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'freefreelancer',
      url: siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: siteUrl + '/freelancer/projects?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    }));
  }

  ngOnDestroy() {
    this.removeJsonLd.forEach((fn) => fn());
  }
}
