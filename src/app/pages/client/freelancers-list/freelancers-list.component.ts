import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-freelancers-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container">
      <h1>Browse freelancers</h1>
      @if (loading) {
        <div class="loading">Loading freelancers…</div>
      } @else if (items.length === 0) {
        <div class="empty card">
          <p class="empty-title">No freelancers yet</p>
          <p class="empty-text">Freelancers will appear here once they sign up and complete their profiles.</p>
        </div>
      } @else {
        <div class="grid">
          @for (f of items; track f.id) {
            <div class="card freelancer-card">
              <div class="card-body">
                <h3 class="name">{{ f.full_name || 'Freelancer' }}</h3>
                <p class="title">{{ f.title || 'No title' }}</p>
                @if (f.skills?.length) {
                  <p class="skills">{{ f.skills.join(', ') }}</p>
                }
                @if (f.hourly_rate != null) {
                  <p class="rate">\${{ f.hourly_rate }}/hr</p>
                }
              </div>
              <div class="card-actions">
                <a [routerLink]="['/client/freelancers/view', f.username]" class="btn btn-outline">View profile</a>
                <button type="button" class="btn btn-primary" (click)="message(f)">Message</button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .loading { padding: 2rem; text-align: center; color: var(--text-muted); }
    .empty { text-align: center; padding: 2.5rem; }
    .empty-title { font-weight: 600; margin: 0 0 0.5rem 0; }
    .empty-text { color: var(--text-muted); margin: 0; font-size: 0.9375rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
    .freelancer-card { display: flex; flex-direction: column; }
    .card-body { flex: 1; }
    .name { margin: 0 0 0.25rem 0; font-size: 1.1rem; }
    .title { color: var(--text-muted); font-size: 0.9rem; margin: 0 0 0.5rem 0; }
    .skills { font-size: 0.85rem; margin: 0 0 0.25rem 0; }
    .rate { font-size: 0.875rem; font-weight: 500; margin: 0.5rem 0 0 0; }
    .card-actions { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }
    .card-actions .btn { flex: 1; min-width: 100px; text-align: center; text-decoration: none; }
  `],
})
export class FreelancersListComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  items: any[] = [];
  loading = true;

  ngOnInit() {
    this.loading = true;
    this.api.get<{ items: any[] }>('/profiles/freelancers').subscribe({
      next: (res) => { this.items = res.items ?? []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  message(freelancer: { id: string; username?: string; full_name?: string }) {
    this.router.navigate(['/client/messages/new', freelancer.id], {
      state: { freelancer: { id: freelancer.id, username: freelancer.username, full_name: freelancer.full_name } },
    });
  }
}
