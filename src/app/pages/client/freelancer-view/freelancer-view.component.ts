import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

interface FreelancerProfile {
  id?: string;
  full_name?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  hourly_rate?: number | null;
  portfolio?: PortfolioItem[];
}

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  link?: string;
  image_urls?: string[];
}

@Component({
  selector: 'app-freelancer-view',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container freelancer-view-page">
      @if (loading) { <p class="loading">Loading…</p> }
      @else if (profile) {
        <div class="card profile-card">
          <h1>{{ profile.full_name || 'Freelancer' }}</h1>
          <p class="title">{{ profile.title }}</p>
          @if (profile.bio) { <p class="bio">{{ profile.bio }}</p> }
          @if (profile.skills?.length) { <p class="skills">Skills: {{ profile.skills?.join(', ') }}</p> }
          @if (profile.hourly_rate != null) { <p class="rate">\${{ profile.hourly_rate }}/hr</p> }
          <div class="actions">
            <button type="button" class="btn btn-primary" (click)="message()">Message</button>
            <a routerLink="/client/freelancers" class="btn btn-outline">Back to freelancers</a>
          </div>
        </div>

        @if (portfolio.length) {
          <section class="card portfolio-section">
            <h2 class="section-title">Portfolio</h2>
            <ul class="portfolio-list">
              @for (item of portfolio; track item.id) {
                <li class="portfolio-item">
                  @if (item.image_urls?.length && item.image_urls?.[0]) {
                    <img [src]="item.image_urls?.[0]" alt="" class="portfolio-item-img" />
                  } @else {
                    <div class="portfolio-item-placeholder">No image</div>
                  }
                  <div class="portfolio-item-body">
                    <h3 class="portfolio-item-title">{{ item.title }}</h3>
                    @if (item.description) {
                      <p class="portfolio-item-desc">{{ item.description }}</p>
                    }
                    @if (item.link) {
                      <a [href]="item.link" target="_blank" rel="noopener" class="portfolio-item-link">{{ item.link }}</a>
                    }
                  </div>
                </li>
              }
            </ul>
          </section>
        }
      }
    </div>
  `,
  styles: [
    `.loading { padding: 2rem; }
     .freelancer-view-page { padding: 1.5rem 0; display: flex; flex-direction: column; gap: 1.5rem; max-width: 720px; }
     .title { color: var(--text-muted); }
     .bio { margin: 1rem 0; }
     .actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
     .portfolio-section { padding: 1.75rem; }
     .section-title { margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600; }
     .portfolio-list { list-style: none; padding: 0; margin: 0; }
     .portfolio-item {
       display: grid; grid-template-columns: 100px 1fr; gap: 1rem; align-items: start;
       padding: 1rem; background: var(--bg); border-radius: var(--radius-sm); margin-bottom: 0.75rem;
     }
     .portfolio-item-img { width: 100px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); }
     .portfolio-item-placeholder {
       width: 100px; height: 80px; background: var(--border); border-radius: var(--radius-sm);
       display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: var(--text-muted);
     }
     .portfolio-item-title { margin: 0 0 0.25rem 0; font-size: 1rem; font-weight: 600; }
     .portfolio-item-desc { margin: 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.4; }
     .portfolio-item-link { font-size: 0.85rem; word-break: break-all; color: var(--primary); }`,
  ],
})
export class FreelancerViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  profile: FreelancerProfile | null = null;
  portfolio: PortfolioItem[] = [];
  loading = true;

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.api.get<FreelancerProfile>(`/profiles/freelancer/${username}`).subscribe({
        next: (p) => {
          this.profile = p;
          this.portfolio = Array.isArray(p?.portfolio) ? p.portfolio : [];
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
    } else {
      this.loading = false;
    }
  }

  message() {
    if (this.profile?.id) {
      this.router.navigate(['/client/messages/new', this.profile.id]);
    }
  }
}
