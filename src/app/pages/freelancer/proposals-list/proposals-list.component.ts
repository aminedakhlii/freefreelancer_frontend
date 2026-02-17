import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-proposals-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page proposals-page">
      <div class="page-header">
        <h1>My proposals</h1>
        <p class="page-subtitle">Track your submitted proposals and interview scores</p>
      </div>
      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Loading…</span>
        </div>
      } @else if (items.length === 0) {
        <div class="empty-state card">
          <div class="empty-icon">📝</div>
          <h2>No proposals yet</h2>
          <p>Browse projects and submit proposals to win work.</p>
          <a routerLink="/freelancer/projects" class="btn btn-primary">Browse projects</a>
        </div>
      } @else {
        <div class="proposal-grid">
          @for (p of items; track p.id) {
            <a [routerLink]="['/freelancer/proposals', p.id]" class="proposal-card card">
              <div class="card-top">
                <h3 class="proposal-title">{{ p.projects?.title ?? 'Project' }}</h3>
                <span class="status-pill" [class]="'status-' + (p.status || 'pending')">{{ p.status || 'Pending' }}</span>
              </div>
              <div class="proposal-meta">
                <span class="meta-item">\${{ p.proposed_budget?.toLocaleString?.() ?? p.proposed_budget }}</span>
                @if (p.interviews?.score != null) {
                  <span class="score-badge">Score: {{ p.interviews.score }}</span>
                } @else {
                  <span class="meta-muted">—</span>
                }
              </div>
              <span class="card-arrow">View →</span>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .proposals-page { padding: 1.5rem 0 3rem; max-width: 960px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 700; }
    .page-subtitle { margin: 0; font-size: 0.9375rem; color: var(--text-muted); }
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem; color: var(--text-muted); }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 2.5rem; max-width: 400px; margin: 0 auto; }
    .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    .empty-state h2 { margin: 0 0 0.5rem 0; font-size: 1.25rem; }
    .empty-state p { margin: 0 0 1.25rem 0; color: var(--text-muted); font-size: 0.9375rem; }
    .proposal-grid { display: grid; gap: 1rem; }
    .proposal-card { display: block; text-decoration: none; color: inherit; padding: 1.25rem; transition: box-shadow 0.2s, transform 0.1s; }
    .proposal-card:hover { box-shadow: var(--shadow-hover); transform: translateY(-2px); }
    .card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.5rem; }
    .proposal-title { margin: 0; font-size: 1.1rem; font-weight: 600; line-height: 1.3; flex: 1; min-width: 0; }
    .status-pill { font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.6rem; border-radius: 999px; text-transform: capitalize; flex-shrink: 0; }
    .status-pending, .status-submitted { background: #fef3c7; color: #b45309; }
    .status-accepted { background: #d1fae5; color: #047857; }
    .status-rejected { background: var(--border); color: var(--text-muted); }
    .proposal-meta { display: flex; gap: 1rem; align-items: center; font-size: 0.875rem; }
    .meta-item { font-weight: 600; color: var(--primary); }
    .meta-muted { color: var(--text-muted); }
    .score-badge { font-size: 0.8rem; background: var(--bg); padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-weight: 500; }
    .card-arrow { font-size: 0.875rem; color: var(--primary); font-weight: 500; margin-top: 0.5rem; display: inline-block; }
  `],
})
export class ProposalsListComponent implements OnInit {
  private api = inject(ApiService);
  items: any[] = [];
  loading = false;

  ngOnInit() {
    this.api.get<{ items: any[] }>('/proposals/my').subscribe({
      next: (res) => { this.items = res.items || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
