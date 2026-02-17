import { Component, inject, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-thread-view',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="chat-layout">
      <!-- Header -->
      <header class="chat-header">
        <a [routerLink]="backLink" class="back-btn" aria-label="Back to messages">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </a>
        <div class="header-info">
          <h1 class="header-title">{{ otherName }}</h1>
          <p class="header-subtitle">{{ thread?.project_title || 'Conversation' }}</p>
        </div>
      </header>

      @if (loading) {
        <div class="chat-loading">
          <div class="spinner"></div>
          <span>Loading conversation…</span>
        </div>
      } @else if (thread) {
        <!-- Messages -->
        <div class="messages-wrap" #messagesEl>
          @if ((thread.messages || []).length === 0) {
            <div class="empty-chat">
              <p>No messages yet. Say hello!</p>
            </div>
          } @else {
            @for (m of thread.messages || []; track m.id) {
              <div class="message-row" [class.sent]="m.sender_id === myId">
                <div class="message-bubble">
                  <span class="message-text">{{ m.body }}</span>
                  <span class="message-time">{{ formatTime(m.created_at) }}</span>
                </div>
              </div>
            }
          }
        </div>

        <!-- Composer -->
        <div class="composer-wrap">
          <form class="composer" (ngSubmit)="send()">
            <textarea
              [(ngModel)]="body"
              name="body"
              placeholder="Type a message…"
              rows="1"
              (keydown.enter)="onEnter($event)"
            ></textarea>
            <button type="submit" class="send-btn" [disabled]="sending || !body.trim()" aria-label="Send">
              ➤
            </button>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .chat-layout {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 60px);
      max-width: 720px;
      margin: 0 auto;
      background: var(--bg-card);
      border-radius: var(--radius);
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      overflow: hidden;
    }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      color: var(--text);
      text-decoration: none;
      transition: background 0.2s;
    }
    .back-btn:hover { background: var(--border); }
    .header-info { flex: 1; min-width: 0; }
    .header-title { margin: 0; font-size: 1.1rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .header-subtitle { margin: 0.15rem 0 0 0; font-size: 0.8125rem; color: var(--text-muted); }

    .chat-loading {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      color: var(--text-muted);
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .messages-wrap {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 1.25rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    }
    .empty-chat {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      font-size: 0.9375rem;
    }
    .message-row {
      display: flex;
      justify-content: flex-start;
      align-items: flex-end;
    }
    .message-row.sent {
      justify-content: flex-end;
    }
    .message-bubble {
      max-width: 78%;
      padding: 0.65rem 1rem;
      border-radius: 16px;
      background: var(--bg-card);
      box-shadow: 0 1px 2px rgba(0,0,0,0.06);
      position: relative;
    }
    .message-row.sent .message-bubble {
      background: var(--primary);
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .message-row:not(.sent) .message-bubble {
      border-bottom-left-radius: 4px;
    }
    .message-text { display: block; font-size: 0.9375rem; line-height: 1.45; white-space: pre-wrap; word-break: break-word; }
    .message-time {
      display: block;
      font-size: 0.7rem;
      opacity: 0.8;
      margin-top: 0.35rem;
    }
    .message-row.sent .message-time { opacity: 0.9; }

    .composer-wrap {
      flex-shrink: 0;
      padding: 0.75rem 1.25rem 1.25rem;
      background: var(--bg-card);
      border-top: 1px solid var(--border);
    }
    .composer {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 0.5rem 0.5rem 0.5rem 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .composer:focus-within {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }
    .composer textarea {
      flex: 1;
      border: none;
      background: transparent;
      resize: none;
      min-height: 24px;
      max-height: 120px;
      padding: 0.35rem 0;
      font-size: 0.9375rem;
      line-height: 1.4;
    }
    .composer textarea:focus { outline: none; }
    .send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: var(--primary);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s, transform 0.1s;
    }
    .send-btn:hover:not(:disabled) { background: var(--primary-hover); transform: scale(1.02); }
    .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class ThreadViewComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesEl') messagesEl!: ElementRef<HTMLDivElement>;

  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  threadId = '';
  thread: any = null;
  loading = true;
  body = '';
  sending = false;
  myId = '';
  private scrollToBottom = false;

  get backLink(): string {
    const p = this.auth.profile();
    return p?.role === 'client' ? '/client/messages' : '/freelancer/messages';
  }

  get otherName(): string {
    const o = this.thread?.other_participant;
    if (o?.full_name) return o.full_name;
    if (o?.username) return '@' + o.username;
    return 'Other participant';
  }

  ngOnInit() {
    this.threadId = this.route.snapshot.paramMap.get('threadId') || '';
    this.myId = (this.auth.profile() as any)?.id || '';
    this.load();
  }

  ngAfterViewChecked() {
    if (this.scrollToBottom && this.messagesEl?.nativeElement) {
      this.messagesEl.nativeElement.scrollTop = this.messagesEl.nativeElement.scrollHeight;
      this.scrollToBottom = false;
    }
  }

  load() {
    this.api.get<any>(`/messages/thread/${this.threadId}`).subscribe({
      next: (t) => {
        this.thread = t;
        this.loading = false;
        this.scrollToBottom = true;
      },
      error: () => { this.loading = false; },
    });
  }

  formatTime(iso: string | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  onEnter(e: Event) {
    const ke = e as KeyboardEvent;
    if (ke.key !== 'Enter' || ke.shiftKey) return;
    ke.preventDefault();
    this.send();
  }

  send() {
    const b = this.body.trim();
    if (!b || this.sending) return;
    this.sending = true;
    this.api.post<any>(`/messages/thread/${this.threadId}/messages`, { body: b }).subscribe({
      next: (msg) => {
        this.body = '';
        this.sending = false;
        if (this.thread?.messages) this.thread.messages.push(msg);
        else this.thread = { ...this.thread, messages: [msg] };
        this.scrollToBottom = true;
      },
      error: () => { this.sending = false; },
    });
  }
}
