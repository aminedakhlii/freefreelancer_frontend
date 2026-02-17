import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-client-projects-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page projects-page">
      <div class="page-header">
        <h1>My projects</h1>
        <p class="page-subtitle">Track and manage your posted projects</p>
      </div>
      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Loading projects…</span>
        </div>
      } @else if (items.length === 0) {
        <div class="empty-state card">
          <div class="empty-icon">📋</div>
          <h2>No projects yet</h2>
          <p>Post your first project to get proposals from freelancers.</p>
          <a routerLink="/client/projects/new" class="btn btn-primary">Post a project</a>
        </div>
      } @else {
        <div class="project-grid">
          @for (p of items; track p.id) {
            <a [routerLink]="['/client/projects', p.id]" class="project-card card">
              <div class="card-top">
                <h3 class="project-title">{{ p.title }}</h3>
                <span class="status-pill" [class]="'status-' + (p.status || 'open')">{{ p.status || 'Open' }}</span>
              </div>
              <p class="project-desc">{{ (p.description || '').slice(0, 140) }}{{ (p.description || '').length > 140 ? '…' : '' }}</p>
              <div class="project-meta">
                <span class="meta-item">\${{ p.budget?.toLocaleString?.() ?? p.budget }}</span>
                @if (p.skills?.length) {
                  <span class="meta-item">{{ p.skills.length }} skills</span>
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
    .projects-page { padding: 1.5rem 0 3rem; max-width: 960px; margin: 0 auto; }
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
    .project-grid { display: grid; gap: 1rem; }
    .project-card { display: block; text-decoration: none; color: inherit; padding: 1.25rem; transition: box-shadow 0.2s, transform 0.1s; }
    .project-card:hover { box-shadow: var(--shadow-hover); transform: translateY(-2px); }
    .card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.5rem; }
    .project-title { margin: 0; font-size: 1.1rem; font-weight: 600; line-height: 1.3; flex: 1; min-width: 0; }
    .status-pill { font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.6rem; border-radius: 999px; text-transform: capitalize; flex-shrink: 0; }
    .status-open { background: #dbeafe; color: #1d4ed8; }
    .status-closed { background: var(--border); color: var(--text-muted); }
    .project-desc { margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .project-meta { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.875rem; color: var(--text-muted); }
    .meta-item { font-weight: 500; color: var(--primary); }
    .card-arrow { font-size: 0.875rem; color: var(--primary); font-weight: 500; margin-top: 0.5rem; display: inline-block; }
  `],
})
export class ClientProjectsListComponent implements OnInit {
  private api = inject(ApiService);
  items: any[] = [];
  loading = false;

  ngOnInit() {
    this.api.get<{ items: any[] }>('/projects/my').subscribe({
      next: (res) => { this.items = res.items || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
