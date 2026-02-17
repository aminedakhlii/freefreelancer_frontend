import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-proposal-view',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page proposal-page">
      @if (loading) {
        <div class="loading-state"><div class="spinner"></div><span>Loading proposal…</span></div>
      } @else if (proposal) {
        <a [routerLink]="['/client/projects', proposal.project_id]" class="back-link">← Back to project</a>

        <div class="proposal-layout">
          <!-- Freelancer card -->
          <aside class="card freelancer-card">
            <div class="freelancer-header">
              @if (proposal.profiles?.avatar_url) {
                <img [src]="proposal.profiles.avatar_url" alt="" class="avatar" />
              } @else {
                <div class="avatar-placeholder">{{ initials(proposal.profiles?.full_name) }}</div>
              }
              <div class="freelancer-info">
                <h2 class="freelancer-name">{{ proposal.profiles?.full_name ?? 'Freelancer' }}</h2>
                @if (proposal.profiles?.title) {
                  <p class="freelancer-title">{{ proposal.profiles.title }}</p>
                }
              </div>
            </div>
            @if (proposal.profiles?.skills?.length) {
              <div class="skills-row">
                @for (s of proposal.profiles.skills; track s) {
                  <span class="skill-tag">{{ s }}</span>
                }
              </div>
            }
            @if (proposal.profiles?.username) {
              <a [routerLink]="['/client/freelancers/view', proposal.profiles.username]" class="btn btn-outline btn-block">View profile</a>
            }
          </aside>

          <!-- Main content -->
          <div class="main-content">
            <div class="card project-context">
              <span class="context-label">Project</span>
              <h1 class="project-title">{{ proposal.projects?.title }}</h1>
            </div>

            <div class="card cover-letter-card">
              <h2 class="section-title">Cover letter</h2>
              <p class="cover-letter">{{ proposal.cover_letter }}</p>
            </div>

            <div class="card offer-card">
              <h2 class="section-title">Offer</h2>
              <div class="offer-row">
                <span class="offer-label">Proposed budget</span>
                <span class="offer-value">\${{ proposal.proposed_budget?.toLocaleString?.() ?? proposal.proposed_budget }}</span>
              </div>
              @if (proposal.timeline) {
                <div class="offer-row">
                  <span class="offer-label">Timeline</span>
                  <span class="offer-value">{{ proposal.timeline }}</span>
                </div>
              }
              @if (proposal.interviews?.score != null) {
                <div class="offer-row">
                  <span class="offer-label">AI interview score</span>
                  <span class="score-badge">{{ proposal.interviews.score }}</span>
                </div>
              }
            </div>

            @if (proposal.status === 'active') {
              <div class="actions-card card">
                <p class="actions-hint">Accept to hire this freelancer and move the project to in progress.</p>
                <div class="actions-buttons">
                  <button type="button" class="btn btn-ghost" (click)="decline()" [disabled]="actionLoading">Decline</button>
                  <button type="button" class="btn btn-primary" (click)="accept()" [disabled]="actionLoading">{{ actionLoading ? '…' : 'Accept proposal' }}</button>
                </div>
              </div>
            } @else {
              <div class="status-card card">
                <span class="status-pill" [class]="'status-' + (proposal.status || 'active')">{{ proposal.status === 'accepted' ? 'Accepted' : proposal.status === 'declined' ? 'Declined' : proposal.status }}</span>
                @if (proposal.status === 'accepted') {
                  <p class="status-note">You accepted this proposal. The project is in progress.</p>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .proposal-page { padding: 1.5rem 0 3rem; max-width: 1000px; margin: 0 auto; }
    .back-link { display: inline-block; margin-bottom: 1rem; font-size: 0.9375rem; color: var(--primary); text-decoration: none; font-weight: 500; }
    .back-link:hover { text-decoration: underline; }
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem; color: var(--text-muted); }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .proposal-layout { display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; align-items: start; }
    @media (max-width: 720px) { .proposal-layout { grid-template-columns: 1fr; } }
    .freelancer-card { padding: 1.25rem; position: sticky; top: 1rem; }
    .freelancer-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; }
    .avatar-placeholder { width: 56px; height: 56px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1.1rem; }
    .freelancer-name { margin: 0 0 0.15rem 0; font-size: 1.1rem; font-weight: 600; }
    .freelancer-title { margin: 0; font-size: 0.875rem; color: var(--text-muted); }
    .skills-row { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem; }
    .skill-tag { font-size: 0.75rem; background: var(--bg); color: var(--text-muted); padding: 0.25rem 0.5rem; border-radius: 999px; }
    .btn-block { width: 100%; text-align: center; margin-top: 0.25rem; }
    .main-content { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
    .project-context { padding: 1rem 1.25rem; }
    .context-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
    .project-title { margin: 0.25rem 0 0 0; font-size: 1.125rem; font-weight: 600; }
    .section-title { margin: 0 0 0.75rem 0; font-size: 1rem; font-weight: 600; }
    .cover-letter-card { padding: 1.25rem; }
    .cover-letter { margin: 0; font-size: 0.9375rem; line-height: 1.6; color: var(--text); white-space: pre-wrap; }
    .offer-card { padding: 1.25rem; }
    .offer-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
    .offer-row:last-child { border-bottom: none; }
    .offer-label { font-size: 0.9rem; color: var(--text-muted); }
    .offer-value { font-weight: 600; color: var(--text); }
    .score-badge { font-weight: 700; color: var(--primary); font-size: 1rem; }
    .actions-card { padding: 1.25rem; }
    .actions-hint { margin: 0 0 1rem 0; font-size: 0.9rem; color: var(--text-muted); }
    .actions-buttons { display: flex; gap: 0.75rem; justify-content: flex-end; }
    .status-card { padding: 1.25rem; }
    .status-pill { font-size: 0.8rem; font-weight: 600; padding: 0.35rem 0.75rem; border-radius: 999px; text-transform: capitalize; }
    .status-active { background: #dbeafe; color: #1d4ed8; }
    .status-accepted { background: #d1fae5; color: #047857; }
    .status-declined { background: var(--border); color: var(--text-muted); }
    .status-note { margin: 0.5rem 0 0 0; font-size: 0.9rem; color: var(--text-muted); }
  `],
})
export class ProposalViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  proposal: any = null;
  loading = true;
  actionLoading = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<any>(`/proposals/${id}`).subscribe({
        next: (p) => { this.proposal = p; this.loading = false; },
        error: () => { this.loading = false; },
      });
    }
  }

  initials(name: string | undefined): string {
    if (!name?.trim()) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  accept() {
    if (!this.proposal?.id) return;
    this.actionLoading = true;
    this.api.post(`/proposals/${this.proposal.id}/accept`, {}).subscribe({
      next: () => { this.proposal.status = 'accepted'; this.actionLoading = false; },
      error: () => { this.actionLoading = false; },
    });
  }

  decline() {
    if (!this.proposal?.id) return;
    this.actionLoading = true;
    this.api.post(`/proposals/${this.proposal.id}/decline`, {}).subscribe({
      next: () => { this.proposal.status = 'declined'; this.actionLoading = false; },
      error: () => { this.actionLoading = false; },
    });
  }
}
