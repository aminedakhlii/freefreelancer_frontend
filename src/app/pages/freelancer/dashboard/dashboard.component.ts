import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-freelancer-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container dashboard">
      <h1>Dashboard</h1>
      <div class="cards">
        <a routerLink="/freelancer/projects" class="card squircle">
          <span class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </span>
          <span class="card-label">Browse projects</span>
        </a>
        <a routerLink="/freelancer/proposals" class="card squircle">
          <span class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M12 18v-6"/>
              <path d="M9 15l3 3 3-3"/>
            </svg>
          </span>
          <span class="card-label">My proposals</span>
        </a>
        <a routerLink="/freelancer/profile" class="card squircle">
          <span class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <span class="card-label">Profile</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 1.5rem 0; }
    .cards { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .cards .card { text-decoration: none; color: inherit; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; padding: 1.25rem; min-width: 110px; min-height: 110px; transition: transform 0.15s ease, box-shadow 0.2s ease; }
    .cards .card:hover { transform: scale(1.04); box-shadow: var(--shadow-hover); }
    .card.squircle { border-radius: 24px; background: var(--bg-card); box-shadow: var(--shadow); }
    .card-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; color: var(--primary); }
    .card-icon svg { width: 100%; height: 100%; }
    .card-label { font-size: 0.875rem; font-weight: 500; text-align: center; line-height: 1.2; color: var(--text); }
  `],
})
export class FreelancerDashboardComponent implements OnInit {
  private api = inject(ApiService);
  ngOnInit() {}
}
