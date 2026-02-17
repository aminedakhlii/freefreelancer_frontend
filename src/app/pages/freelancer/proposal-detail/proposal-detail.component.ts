import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-proposal-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page proposal-page">
      @if (loading) {
        <div class="loading-state"><div class="spinner"></div><span>Loading…</span></div>
      } @else if (proposal) {
        <a routerLink="/freelancer/proposals" class="back-link">← My proposals</a>

        <div class="proposal-layout">
          <!-- Status & project -->
          <div class="card header-card">
            <div class="header-top">
              <h1 class="project-title">{{ proposal.projects?.title ?? 'Project' }}</h1>
              <span class="status-pill" [class]="'status-' + (proposal.status || 'active')">{{ statusLabel(proposal.status) }}</span>
            </div>
            @if (proposal.projects?.budget) {
              <p class="project-budget">Project budget: \${{ proposal.projects.budget?.toLocaleString?.() ?? proposal.projects.budget }}</p>
            }
          </div>

          <div class="card cover-letter-card">
            <h2 class="section-title">Your cover letter</h2>
            <p class="cover-letter">{{ proposal.cover_letter }}</p>
          </div>

          <div class="card offer-card">
            <h2 class="section-title">Your offer</h2>
            <div class="offer-grid">
              <div class="offer-item">
                <span class="offer-label">Proposed budget</span>
                <span class="offer-value">\${{ proposal.proposed_budget?.toLocaleString?.() ?? proposal.proposed_budget }}</span>
              </div>
              @if (proposal.timeline) {
                <div class="offer-item">
                  <span class="offer-label">Timeline</span>
                  <span class="offer-value">{{ proposal.timeline }}</span>
                </div>
              }
              @if (proposal.interviews?.score != null) {
                <div class="offer-item">
                  <span class="offer-label">AI interview score</span>
                  <span class="score-badge">{{ proposal.interviews.score }}</span>
                </div>
              }
            </div>
          </div>

          @if (proposal.status === 'active') {
            <div class="card note-card">
              <p class="note-text">Waiting for the client to accept or decline. You can message them from Chat.</p>
              <a [routerLink]="['/freelancer/projects', proposal.project_id]" class="btn btn-outline">View project</a>
            </div>
          } @else if (proposal.status === 'accepted') {
            <div class="card success-card">
              <span class="success-badge">Accepted</span>
              <p class="success-text">The client accepted your proposal. The project is in progress.</p>
              <a [routerLink]="['/freelancer/messages']" class="btn btn-primary">Open messages</a>
            </div>
          } @else if (proposal.status === 'declined') {
            <div class="card declined-card">
              <p class="declined-text">This proposal was declined. Keep applying to other projects.</p>
              <a routerLink="/freelancer/projects" class="btn btn-primary">Browse projects</a>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .proposal-page { padding: 1.5rem 0 3rem; max-width: 640px; margin: 0 auto; }
    .back-link { display: inline-block; margin-bottom: 1rem; font-size: 0.9375rem; color: var(--primary); text-decoration: none; font-weight: 500; }
    .back-link:hover { text-decoration: underline; }
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem; color: var(--text-muted); }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .proposal-layout { display: flex; flex-direction: column; gap: 1rem; }
    .header-card { padding: 1.25rem; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.5rem; }
    .project-title { margin: 0; font-size: 1.25rem; font-weight: 700; line-height: 1.3; }
    .status-pill { font-size: 0.8rem; font-weight: 600; padding: 0.3rem 0.65rem; border-radius: 999px; text-transform: capitalize; flex-shrink: 0; }
    .status-active { background: #fef3c7; color: #b45309; }
    .status-accepted { background: #d1fae5; color: #047857; }
    .status-declined { background: var(--border); color: var(--text-muted); }
    .project-budget { margin: 0; font-size: 0.9rem; color: var(--text-muted); }
    .section-title { margin: 0 0 0.75rem 0; font-size: 1rem; font-weight: 600; }
    .cover-letter-card { padding: 1.25rem; }
    .cover-letter { margin: 0; font-size: 0.9375rem; line-height: 1.6; color: var(--text); white-space: pre-wrap; }
    .offer-card { padding: 1.25rem; }
    .offer-grid { display: grid; gap: 1rem; }
    .offer-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
    .offer-item:last-child { border-bottom: none; }
    .offer-label { font-size: 0.9rem; color: var(--text-muted); }
    .offer-value { font-weight: 600; }
    .score-badge { font-weight: 700; color: var(--primary); font-size: 1rem; }
    .note-card, .success-card, .declined-card { padding: 1.25rem; }
    .note-text { margin: 0 0 1rem 0; font-size: 0.9rem; color: var(--text-muted); }
    .success-badge { display: inline-block; font-size: 0.8rem; font-weight: 600; padding: 0.3rem 0.65rem; border-radius: 999px; background: #d1fae5; color: #047857; margin-bottom: 0.5rem; }
    .success-text { margin: 0 0 1rem 0; font-size: 0.9375rem; }
    .declined-text { margin: 0 0 1rem 0; font-size: 0.9375rem; color: var(--text-muted); }
  `],
})
export class ProposalDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  proposal: any = null;
  loading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<any>(`/proposals/${id}`).subscribe({
        next: (p) => { this.proposal = p; this.loading = false; },
        error: () => { this.loading = false; },
      });
    }
  }

  statusLabel(status: string | undefined): string {
    if (status === 'accepted') return 'Accepted';
    if (status === 'declined') return 'Declined';
    if (status === 'active') return 'Pending';
    return status ?? 'Pending';
  }
}
