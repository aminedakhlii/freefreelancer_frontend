import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-client-project-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page project-detail-page">
      @if (loading) {
        <div class="loading-state"><div class="spinner"></div><span>Loading…</span></div>
      } @else if (project) {
        <div class="detail-header card">
          <div class="header-top">
            <h1>{{ project.title }}</h1>
            <span class="status-pill" [class]="'status-' + (project.status || 'open')">{{ project.status || 'Open' }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-item">Budget: \${{ project.budget?.toLocaleString?.() ?? project.budget }}</span>
            @if (project.timeline) { <span class="meta-item">Timeline: {{ project.timeline }}</span> }
          </div>
          @if (project.skills?.length) {
            <div class="skills-row">
              @for (s of project.skills; track s) { <span class="skill-tag">{{ s }}</span> }
            </div>
          }
          <div class="description">
            <h2 class="section-label">Description</h2>
            <p>{{ project.description }}</p>
          </div>
        </div>

        <section class="proposals-section">
          <h2 class="section-title">Proposals</h2>
          @if (proposals.length === 0) {
            <div class="empty-proposals card">
              <p>No proposals yet. Share your project to get bids from freelancers.</p>
            </div>
          } @else {
            <div class="proposal-list">
              @for (prop of proposals; track prop.id) {
                <div class="proposal-card card">
                  <div class="proposal-header">
                    <div class="proposal-avatar">{{ initials(prop.profiles?.full_name) }}</div>
                    <div class="proposal-info">
                      <strong class="proposal-name">{{ prop.profiles?.full_name ?? 'Freelancer' }}</strong>
                      <span class="proposal-budget">\${{ prop.proposed_budget?.toLocaleString?.() ?? prop.proposed_budget }}</span>
                    </div>
                    @if (prop.interviews?.score != null) {
                      <span class="score-badge">Score: {{ prop.interviews.score }}</span>
                    }
                  </div>
                  @if (prop.cover_letter) {
                    <p class="proposal-cover">{{ (prop.cover_letter || '').slice(0, 200) }}{{ (prop.cover_letter || '').length > 200 ? '…' : '' }}</p>
                  }
                  <a [routerLink]="['/client/proposals', prop.id]" class="btn btn-primary btn-sm">View proposal</a>
                </div>
              }
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .project-detail-page { padding: 1.5rem 0 3rem; max-width: 720px; margin: 0 auto; }
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem; color: var(--text-muted); }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .detail-header { padding: 1.5rem; margin-bottom: 1.5rem; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.75rem; }
    .detail-header h1 { margin: 0; font-size: 1.375rem; font-weight: 700; line-height: 1.3; }
    .status-pill { font-size: 0.75rem; font-weight: 600; padding: 0.3rem 0.65rem; border-radius: 999px; text-transform: capitalize; }
    .status-open { background: #dbeafe; color: #1d4ed8; }
    .status-closed { background: var(--border); color: var(--text-muted); }
    .meta-row { display: flex; gap: 1.25rem; flex-wrap: wrap; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.75rem; }
    .meta-item { font-weight: 500; color: var(--primary); }
    .skills-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .skill-tag { background: var(--bg); color: var(--text); padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.8rem; }
    .section-label { margin: 0 0 0.5rem 0; font-size: 0.875rem; font-weight: 600; color: var(--text-muted); }
    .description p { margin: 0; font-size: 0.9375rem; line-height: 1.6; color: var(--text); }
    .proposals-section { margin-top: 1.5rem; }
    .section-title { margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600; }
    .empty-proposals { padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9375rem; }
    .proposal-list { display: flex; flex-direction: column; gap: 1rem; }
    .proposal-card { padding: 1.25rem; }
    .proposal-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
    .proposal-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem; flex-shrink: 0; }
    .proposal-info { flex: 1; min-width: 0; }
    .proposal-name { display: block; font-size: 1rem; }
    .proposal-budget { font-size: 0.9rem; color: var(--primary); font-weight: 600; }
    .score-badge { font-size: 0.8rem; background: var(--bg); padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-weight: 500; }
    .proposal-cover { margin: 0 0 1rem 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.45; }
    .btn-sm { padding: 0.5rem 1rem; font-size: 0.875rem; }
  `],
})
export class ClientProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  project: any = null;
  proposals: any[] = [];
  loading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<any>(`/projects/${id}`).subscribe({
        next: (p) => { this.project = p; this.loading = false; },
        error: () => { this.loading = false; },
      });
      this.api.get<{ items: any[] }>(`/proposals/project/${id}`).subscribe({
        next: (res) => (this.proposals = res.items || []),
      });
    }
  }

  initials(name: string | undefined): string {
    if (!name?.trim()) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
}
