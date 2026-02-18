import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatPanelService } from '../../../core/services/chat-panel.service';
import { Subscription } from 'rxjs';
import { FloatingChatWindowComponent } from './floating-chat-window.component';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [FloatingChatWindowComponent],
  template: `
    <div class="chat-widget" [class.open]="open">
      <button type="button" class="chat-toggle" (click)="setOpen(!open)" [attr.aria-label]="open ? 'Close chat' : 'Open chat'">
        @if (open) {
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        } @else {
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          @if (totalUnread > 0) {
            <span class="chat-badge">{{ totalUnread > 99 ? '99+' : totalUnread }}</span>
          }
        }
      </button>

      @if (open) {
        <div class="chat-panel chat-panel-list-only">
          <div class="chat-list">
            <div class="chat-list-header">
              <h2 class="chat-list-title">Messages</h2>
            </div>
            @if (loadingThreads) {
              <div class="chat-list-loading">Loading…</div>
            } @else if (threads.length === 0) {
              <div class="chat-list-empty">No conversations yet.</div>
            } @else {
              <div class="chat-list-items">
                @for (t of threads; track t.id) {
                  <button type="button" class="chat-list-item" (click)="openFloating(t)">
                    <span class="chat-item-avatar" [class.unread]="(t.unread_count || 0) > 0">{{ threadInitial(t) }}</span>
                    <span class="chat-item-main">
                      <span class="chat-item-name">{{ threadDisplayName(t) }}</span>
                      <span class="chat-item-sub">{{ t.projects?.title || 'Conversation' }}</span>
                    </span>
                    <span class="chat-item-date">{{ formatDate(t.updated_at) }}</span>
                  </button>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>

    <div class="floating-windows" [style.right]="open ? 'calc(1.5rem + 56px + 0.75rem + 380px)' : 'calc(1.5rem + 56px + 0.75rem)'">
      @for (id of openWindowIds; track id) {
        @if (getThread(id); as t) {
          <app-floating-chat-window
            [threadId]="id"
            [threadFromList]="t"
            (close)="closeWindow(id)"
            (opened)="onFloatingOpened()"
          />
        }
      }
    </div>
  `,
  styles: [`
    .chat-widget { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 1000; }
    .chat-toggle {
      position: relative; width: 56px; height: 56px; border-radius: 50%; border: none; background: var(--primary); color: #fff;
      cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .chat-toggle:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45); }
    .chat-badge {
      position: absolute; top: -4px; right: -4px; min-width: 20px; height: 20px; padding: 0 6px;
      background: #dc2626; color: #fff; font-size: 0.7rem; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center;
    }
    .chat-panel {
      position: absolute; bottom: calc(100% + 12px); right: 0;
      width: 380px; max-width: calc(100vw - 2rem); height: 520px;
      background: #fff; border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.15);
      display: flex; overflow: hidden; flex-direction: row; border: 1px solid var(--border);
    }
    .chat-panel-list-only .chat-list { width: 100%; }
    .chat-list {
      display: flex; flex-direction: column; background: #fff; height: 100%;
    }
    .chat-list-header { padding: 1rem; border-bottom: 1px solid var(--border); flex-shrink: 0; background: #fff; }
    .chat-list-title { margin: 0; font-size: 1rem; font-weight: 600; color: #0f172a; }
    .chat-list-loading, .chat-list-empty { padding: 1.5rem; color: #64748b; font-size: 0.9375rem; }
    .chat-list-items { flex: 1; overflow-y: auto; }
    .chat-list-item {
      display: flex; align-items: center; gap: 0.75rem; width: 100%; text-align: left; padding: 0.75rem 1rem; border: none; background: #fff; cursor: pointer;
      border-bottom: 1px solid var(--border); transition: background 0.15s, color 0.15s; color: #0f172a;
    }
    .chat-list-item:hover {
      background: var(--primary); color: #fff;
    }
    .chat-list-item:hover .chat-item-avatar,
    .chat-list-item:hover .chat-item-name,
    .chat-list-item:hover .chat-item-sub,
    .chat-list-item:hover .chat-item-date { color: #fff; }
    .chat-list-item:hover .chat-item-avatar { background: rgba(255,255,255,0.3); }
    .chat-item-avatar {
      width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0; color: #475569; font-weight: 600; font-size: 0.9375rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; transition: background 0.15s, color 0.15s;
    }
    .chat-item-avatar.unread::after {
      content: ''; position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; background: #2563eb; border-radius: 50%; border: 2px solid #fff;
    }
    .chat-item-main { flex: 1; min-width: 0; }
    .chat-item-name { display: block; font-weight: 600; font-size: 0.9375rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.15s; }
    .chat-item-sub { display: block; font-size: 0.75rem; color: #64748b; margin-top: 0.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.15s; }
    .chat-item-date { font-size: 0.7rem; color: #94a3b8; flex-shrink: 0; transition: color 0.15s; }
    .floating-windows {
      /* When main panel is closed: left of toggle. When open: left of toggle + panel width (380px) so no overlap */
      position: fixed; bottom: 1.5rem; z-index: 999;
      display: flex; flex-direction: row; gap: 0.75rem; justify-content: flex-end; align-items: flex-end;
      max-width: calc(100vw - 2rem); transition: right 0.2s ease;
    }
  `],
})
export class ChatPanelComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private chatPanelService = inject(ChatPanelService);
  private sub?: Subscription;

  open = false;
  threads: any[] = [];
  loadingThreads = true;
  openWindowIds: string[] = [];

  get totalUnread(): number {
    return this.threads.reduce((sum, t) => sum + (t.unread_count || 0), 0);
  }

  ngOnInit() {
    this.loadThreads();
    this.sub = this.chatPanelService.openWithThreadId.subscribe((threadId: string) => {
      this.open = true;
      this.loadThreadsThenOpenFloating(threadId);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private loadThreadsThenOpenFloating(threadId: string) {
    this.loadingThreads = true;
    this.api.get<{ items: any[] }>('/messages/threads').subscribe({
      next: (res) => {
        this.threads = res.items || [];
        this.loadingThreads = false;
        if (!this.openWindowIds.includes(threadId)) {
          this.openWindowIds = [...this.openWindowIds, threadId];
        }
      },
      error: () => { this.loadingThreads = false; },
    });
  }

  setOpen(value: boolean) {
    this.open = value;
    if (value) this.loadThreads();
  }

  loadThreads() {
    this.loadingThreads = true;
    this.api.get<{ items: any[] }>('/messages/threads').subscribe({
      next: (res) => { this.threads = res.items || []; this.loadingThreads = false; },
      error: () => { this.loadingThreads = false; },
    });
  }

  threadDisplayName(t: any): string {
    const o = t.other_participant;
    if (o?.full_name) return o.full_name;
    if (o?.username) return '@' + o.username;
    return t.projects?.title || 'Conversation';
  }

  threadInitial(t: any): string {
    const o = t.other_participant;
    if (o?.full_name) return (o.full_name as string).charAt(0).toUpperCase();
    if (o?.username) return (o.username as string).charAt(0).toUpperCase();
    return '?';
  }

  formatDate(iso: string | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  getThread(threadId: string): any {
    return this.threads.find((t: any) => t.id === threadId) || null;
  }

  openFloating(t: any) {
    if (!this.openWindowIds.includes(t.id)) {
      this.openWindowIds = [...this.openWindowIds, t.id];
    }
  }

  closeWindow(threadId: string) {
    this.openWindowIds = this.openWindowIds.filter((id) => id !== threadId);
  }

  onFloatingOpened() {
    this.loadThreads();
  }
}
