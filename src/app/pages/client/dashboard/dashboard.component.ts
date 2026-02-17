import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container dashboard">
      <h1>Dashboard</h1>
      <div class="cards">
        <a routerLink="/client/projects/new" class="card squircle">
          <span class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </span>
          <span class="card-label">Post a project</span>
        </a>
        <a routerLink="/client/projects" class="card squircle">
          <span class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="11" x2="12" y2="17"/>
              <line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
          </span>
          <span class="card-label">My projects</span>
        </a>
        <a routerLink="/client/freelancers" class="card squircle">
          <span class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
          <span class="card-label">Browse freelancers</span>
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
export class ClientDashboardComponent {}
