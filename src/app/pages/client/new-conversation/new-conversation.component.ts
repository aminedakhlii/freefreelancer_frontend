import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-new-conversation',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container" style="padding-top: 1rem;">
      <div class="form-card">
        <h1>Start a conversation</h1>
        <p class="form-subtitle">Choose a project to discuss with this freelancer</p>
        <form (ngSubmit)="start()">
          <div class="form-group">
            <label for="conv-project">Project</label>
            <select id="conv-project" [(ngModel)]="projectId" name="projectId" required>
              <option value="">Select a project</option>
              @for (p of projects; track p.id) {
                <option [value]="p.id">{{ p.title }}</option>
              }
            </select>
          </div>
          @if (projects.length === 0 && !loading) {
            <p class="error-msg">You need at least one open or in-progress project to start a conversation.</p>
          }
          @if (error) { <p class="error-msg">{{ error }}</p> }
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="loading || !projectId">Start conversation</button>
          </div>
        </form>
        <p class="form-footer"><a routerLink="/client/freelancers">Back to freelancers</a></p>
      </div>
    </div>
  `,
})
export class NewConversationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  freelancerId = '';
  projects: any[] = [];
  projectId = '';
  loading = false;
  error = '';

  ngOnInit() {
    this.freelancerId = this.route.snapshot.paramMap.get('freelancerId') || '';
    this.api.get<{ items: any[] }>('/projects/my').subscribe({
      next: (res) => (this.projects = (res.items || []).filter((p: any) => p.status === 'open' || p.status === 'in_progress')),
    });
  }

  start() {
    if (!this.projectId) return;
    this.error = '';
    this.loading = true;
    this.api.post<{ id: string }>('/messages/thread', { project_id: this.projectId, freelancer_id: this.freelancerId }).subscribe({
      next: (thread) => {
        this.loading = false;
        this.router.navigate(['/client/messages/thread', thread.id]);
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.error || e?.message || 'Failed to start conversation';
      },
    });
  }
}
