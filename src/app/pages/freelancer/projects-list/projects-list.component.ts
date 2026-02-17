import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-freelancer-projects-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page browse-page">
      <div class="page-header">
        <h1>Browse projects</h1>
        <p class="page-subtitle">Find projects that match your skills</p>
      </div>
      <div class="search-bar card">
        <form (ngSubmit)="load()" class="search-form">
          <input
            type="text"
            placeholder="Search by title or description…"
            [(ngModel)]="q"
            name="q"
            (keyup.enter)="load()"
            class="search-input"
          />
          <button type="submit" class="btn btn-primary search-btn" [disabled]="loading">Search</button>
        </form>
      </div>
      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Searching…</span>
        </div>
      } @else if (items.length === 0) {
        <div class="empty-state card">
          <p>No projects found. Try a different search or check back later.</p>
        </div>
      } @else {
        <div class="project-grid">
          @for (p of items; track p.id) {
            <a [routerLink]="['/freelancer/projects', p.id]" class="project-card card">
              <h3 class="project-title">{{ p.title }}</h3>
              <p class="project-desc">{{ (p.description || '').slice(0, 120) }}{{ (p.description || '').length > 120 ? '…' : '' }}</p>
              <div class="project-meta">
                <span class="meta-budget">\${{ p.budget?.toLocaleString?.() ?? p.budget }}</span>
                <span class="meta-skills">{{ p.skills?.length ?? 0 }} skills</span>
              </div>
              @if (p.skills?.length) {
                <div class="skills-preview">
                  @for (s of p.skills.slice(0, 3); track s) { <span class="skill-dot">{{ s }}</span> }
                  @if (p.skills.length > 3) { <span class="skill-more">+{{ p.skills.length - 3 }}</span> }
                </div>
              }
              <span class="card-arrow">View & apply →</span>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .browse-page { padding: 1.5rem 0 3rem; max-width: 960px; margin: 0 auto; }
    .page-header { margin-bottom: 1.25rem; }
    .page-header h1 { margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 700; }
    .page-subtitle { margin: 0; font-size: 0.9375rem; color: var(--text-muted); }
    .search-bar { padding: 0.75rem 1rem; margin-bottom: 1.5rem; }
    .search-form { display: flex; gap: 0.75rem; align-items: center; }
    .search-input { flex: 1; min-width: 0; margin: 0; }
    .search-btn { flex-shrink: 0; }
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem; color: var(--text-muted); }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { padding: 2rem; text-align: center; color: var(--text-muted); }
    .project-grid { display: grid; gap: 1rem; }
    .project-card { display: block; text-decoration: none; color: inherit; padding: 1.25rem; transition: box-shadow 0.2s, transform 0.1s; }
    .project-card:hover { box-shadow: var(--shadow-hover); transform: translateY(-2px); }
    .project-title { margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 600; line-height: 1.3; }
    .project-desc { margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .project-meta { display: flex; gap: 1rem; font-size: 0.875rem; margin-bottom: 0.5rem; }
    .meta-budget { font-weight: 700; color: var(--primary); }
    .meta-skills { color: var(--text-muted); }
    .skills-preview { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.5rem; }
    .skill-dot { font-size: 0.75rem; background: var(--bg); color: var(--text-muted); padding: 0.2rem 0.5rem; border-radius: 999px; }
    .skill-more { font-size: 0.75rem; color: var(--text-muted); }
    .card-arrow { font-size: 0.875rem; color: var(--primary); font-weight: 500; display: inline-block; }
  `],
})
export class FreelancerProjectsListComponent implements OnInit {
  private api = inject(ApiService);
  private seo = inject(SeoService);
  items: any[] = [];
  loading = false;
  q = '';

  ngOnInit() {
    this.seo.update({
      title: 'Browse Projects | $1000+ Freelance Jobs | freefreelancer',
      description: 'Find US freelance projects $1000+. Browse open projects, filter by skill, and submit proposals after AI skill verification.',
    });
    this.load();
  }
  load() {
    this.loading = true;
    this.api.get<{ items: any[] }>(`/projects?q=${encodeURIComponent(this.q)}`).subscribe({
      next: (res) => { this.items = res.items || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
