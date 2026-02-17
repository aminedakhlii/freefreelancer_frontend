import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container" style="padding-top: 1rem;">
      <div class="form-card" style="max-width: 560px;">
        <h1>AI Interview</h1>
        <p class="form-subtitle">Answer a few questions to qualify for this project</p>
        @if (!started && !interview) {
          <div class="form-actions">
            <button type="button" class="btn btn-primary" (click)="start()" [disabled]="loading">Start interview</button>
          </div>
        }
        @if (interview && !completed) {
          <p class="progress">Question {{ currentIndex + 1 }} of {{ interview.questions?.length || 0 }}</p>
          <p class="question">{{ interview.questions?.[currentIndex] }}</p>
          <form (ngSubmit)="submitAnswer()">
            <div class="form-group">
              <label for="interview-answer">Your answer</label>
              <textarea id="interview-answer" [(ngModel)]="answer" name="answer" rows="4" placeholder="Type your answer here..."></textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="loading">Submit</button>
            </div>
          </form>
        }
        @if (completed) {
          <div class="result" [class.passed]="resultPassed">
            <p><strong>Score: {{ resultScore }}%</strong> — {{ resultPassed ? 'Passed' : 'Not passed' }}</p>
            @if (resultPassed) {
              <a [routerLink]="['/freelancer/proposals/create', projectId]" class="btn btn-primary">Continue to proposal</a>
            }
          </div>
        }
        @if (error) { <p class="error-msg">{{ error }}</p> }
      </div>
    </div>
  `,
  styles: [`.progress { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem; } .question { font-size: 1.05rem; margin-bottom: 1rem; } .result { margin-top: 1rem; } .result.passed .btn { display: inline-block; margin-top: 0.5rem; text-decoration: none; }`],
})
export class InterviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  projectId = '';
  interview: any = null;
  started = false;
  currentIndex = 0;
  answer = '';
  loading = false;
  error = '';
  completed = false;
  resultScore = 0;
  resultPassed = false;

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';
  }

  start() {
    this.loading = true;
    this.error = '';
    this.api.post<any>(`/interviews/start/${this.projectId}`, {}).subscribe({
      next: (inv) => { this.interview = inv; this.started = true; this.loading = false; },
      error: (e) => { this.error = e?.error?.error || 'Failed'; this.loading = false; },
    });
  }

  submitAnswer() {
    if (!this.interview?.id) return;
    this.loading = true;
    this.api.post<any>(`/interviews/${this.interview.id}/answer`, { answer: this.answer }).subscribe({
      next: (res: any) => {
        if (res.completed) {
          this.completed = true;
          this.resultScore = res.score ?? 0;
          this.resultPassed = res.passed ?? false;
        } else {
          this.currentIndex = res.next_index ?? this.currentIndex + 1;
          this.answer = '';
        }
        this.loading = false;
      },
      error: (e) => { this.error = e?.error?.error || 'Failed'; this.loading = false; },
    });
  }
}
