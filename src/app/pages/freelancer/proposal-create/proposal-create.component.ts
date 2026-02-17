import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-proposal-create',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container" style="padding-top: 1rem;">
      <div class="form-card" style="max-width: 560px;">
        <h1>Submit proposal</h1>
        <p class="form-subtitle">Cover letter 200–1000 characters, proposed budget and timeline</p>
        <form (ngSubmit)="submit()">
          <div class="form-group">
            <label for="prop-cover">Cover letter (200–1000 characters)</label>
            <textarea id="prop-cover" [(ngModel)]="coverLetter" name="coverLetter" rows="6" placeholder="Introduce yourself and explain why you're a good fit..." minlength="200" maxlength="1000"></textarea>
          </div>
          <div class="form-group">
            <label for="prop-budget">Proposed budget (\$)</label>
            <input id="prop-budget" type="number" [(ngModel)]="proposedBudget" name="proposedBudget" min="0" placeholder="0" />
          </div>
          <div class="form-group">
            <label for="prop-timeline">Timeline</label>
            <input id="prop-timeline" type="text" [(ngModel)]="timeline" name="timeline" placeholder="e.g. 2 weeks" />
          </div>
          @if (error) { <p class="error-msg">{{ error }}</p> }
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="loading">Submit proposal</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProposalCreateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  projectId = '';
  coverLetter = '';
  proposedBudget: number | null = null;
  timeline = '';
  loading = false;
  error = '';

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';
  }

  submit() {
    if (this.coverLetter.length < 200 || this.coverLetter.length > 1000 || this.proposedBudget == null) {
      this.error = 'Cover letter 200-1000 chars and budget required';
      return;
    }
    this.loading = true;
    this.error = '';
    this.api.post<any>('/proposals', {
      project_id: this.projectId,
      cover_letter: this.coverLetter,
      proposed_budget: this.proposedBudget,
      timeline: this.timeline,
      portfolio_item_ids: [],
    }).subscribe({
      next: () => this.router.navigate(['/freelancer/proposals']),
      error: (e) => { this.error = e?.error?.error || 'Failed'; this.loading = false; },
    });
  }
}
