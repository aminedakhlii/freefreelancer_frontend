import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container">
      <h1>Messages</h1>
      @if (loading) { <p class="loading">Loading…</p> }
      @else if (threads.length === 0) {
        <div class="empty card">
          <p class="empty-title">No conversations yet</p>
          @if (isClient) {
            <p class="empty-text">Start a conversation from a freelancer’s profile or the Freelancers page.</p>
            <a routerLink="/client/freelancers" class="btn btn-primary">Browse freelancers</a>
          } @else {
            <p class="empty-text">When clients message you about a project, conversations will appear here.</p>
          }
        </div>
      }
      @else {
        <div class="list">
          @for (t of threads; track t.id) {
            <a [routerLink]="threadLink(t.id)" class="card thread-card">
              <span class="thread-title">{{ threadDisplayName(t) }}</span>
              <span class="thread-subtitle">{{ t.projects?.title || 'Conversation' }}</span>
              <span class="thread-open">Open →</span>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .loading { padding: 1rem 0; }
    .empty { text-align: center; padding: 2.5rem; }
    .empty .empty-title { font-weight: 600; margin: 0 0 0.5rem 0; }
    .empty .empty-text { color: var(--text-muted); font-size: 0.9375rem; margin: 0 0 1rem 0; }
    .empty .btn { margin-top: 0.25rem; text-decoration: none; display: inline-block; }
    .list { display: flex; flex-direction: column; gap: 0.75rem; max-width: 640px; }
    .thread-card { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem; text-decoration: none; color: inherit; padding: 1.25rem; transition: box-shadow 0.2s; }
    .thread-card:hover { box-shadow: var(--shadow-hover); }
    .thread-card .thread-title { font-weight: 600; font-size: 1rem; width: 100%; }
    .thread-subtitle { font-size: 0.875rem; color: var(--text-muted); width: 100%; }
    .thread-open { font-size: 0.875rem; color: var(--primary); font-weight: 500; }
  `],
})
export class MessagesComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  threads: any[] = [];
  loading = true;
  isClient = false;

  ngOnInit() {
    this.isClient = this.auth.profile()?.role === 'client';
    this.api.get<{ items: any[] }>('/messages/threads').subscribe({
      next: (res) => { this.threads = res.items || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  threadLink(threadId: string): string[] {
    return this.isClient ? ['/client/messages/thread', threadId] : ['/freelancer/messages/thread', threadId];
  }

  threadDisplayName(t: { other_participant?: { full_name?: string; username?: string }; projects?: { title?: string } }): string {
    const o = t.other_participant;
    if (o?.full_name) return o.full_name;
    if (o?.username) return '@' + o.username;
    return t.projects?.title || 'Conversation';
  }
}
