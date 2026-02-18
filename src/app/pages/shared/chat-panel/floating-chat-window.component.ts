import { Component, inject, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-floating-chat-window',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="floating-window">
      <header class="floating-header">
        <div class="floating-header-info">
          <span class="floating-name">{{ displayName }}</span>
          <span class="floating-project">{{ projectTitle || 'Conversation' }}</span>
        </div>
        <button type="button" class="floating-close" (click)="close.emit()" aria-label="Close">×</button>
      </header>
      <div class="floating-messages" #messagesEl>
        @if (loading) {
          <div class="floating-loading">Loading…</div>
        } @else if ((messages || []).length === 0) {
          <div class="floating-empty">No messages yet. Say hello!</div>
        } @else {
          @for (m of messages || []; track m.id) {
            <div class="floating-msg-row" [class.sent]="m.sender_id === myId">
              <div class="floating-msg-bubble">
                <span class="floating-msg-text">{{ m.body }}</span>
                <span class="floating-msg-time">{{ formatTime(m.created_at) }}</span>
              </div>
            </div>
          }
        }
      </div>
      <form class="floating-composer" (ngSubmit)="sendMessage()">
        <textarea [(ngModel)]="messageBody" name="body" placeholder="Type a message…" rows="1" (keydown.enter)="onEnter($event)"></textarea>
        <button type="submit" class="floating-send" [disabled]="sending || !messageBody.trim()">Send</button>
      </form>
    </div>
  `,
  styles: [`
    .floating-window {
      width: 320px; height: 400px; min-width: 280px; min-height: 320px;
      background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border, #e2e8f0);
    }
    .floating-header {
      display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem;
      border-bottom: 1px solid var(--border, #e2e8f0); background: #fff; flex-shrink: 0;
    }
    .floating-header-info { flex: 1; min-width: 0; }
    .floating-name { display: block; font-weight: 600; font-size: 0.9375rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .floating-project { display: block; font-size: 0.75rem; color: #64748b; }
    .floating-close {
      width: 32px; height: 32px; border: none; background: none; cursor: pointer; font-size: 1.25rem; line-height: 1;
      color: #64748b; border-radius: 6px; flex-shrink: 0;
    }
    .floating-close:hover { background: var(--primary, #2563eb); color: #fff; }
    .floating-messages {
      flex: 1; overflow-y: auto; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    }
    .floating-loading, .floating-empty { flex: 1; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 0.875rem; }
    .floating-msg-row { display: flex; justify-content: flex-start; }
    .floating-msg-row.sent { justify-content: flex-end; }
    .floating-msg-bubble {
      max-width: 85%; padding: 0.5rem 0.75rem; border-radius: 12px; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.06);
    }
    .floating-msg-row.sent .floating-msg-bubble { background: var(--primary, #2563eb); color: #fff; border-bottom-right-radius: 4px; }
    .floating-msg-row:not(.sent) .floating-msg-bubble { border-bottom-left-radius: 4px; }
    .floating-msg-text { display: block; font-size: 0.875rem; line-height: 1.4; white-space: pre-wrap; word-break: break-word; }
    .floating-msg-time { display: block; font-size: 0.65rem; opacity: 0.85; margin-top: 0.25rem; }
    .floating-composer {
      display: flex; align-items: flex-end; gap: 0.5rem; padding: 0.5rem 0.75rem; border-top: 1px solid var(--border, #e2e8f0);
      flex-shrink: 0; background: #fff;
    }
    .floating-composer textarea {
      flex: 1; border: 1px solid var(--border, #e2e8f0); border-radius: 20px; padding: 0.4rem 0.75rem; resize: none;
      min-height: 32px; max-height: 80px; font-size: 0.875rem; background: #f8fafc;
    }
    .floating-composer textarea:focus { outline: none; border-color: var(--primary, #2563eb); }
    .floating-send {
      flex-shrink: 0; padding: 0.4rem 0.75rem; border-radius: 20px; border: none; background: var(--primary, #2563eb); color: #fff;
      font-size: 0.8125rem; font-weight: 500; cursor: pointer;
    }
    .floating-send:hover:not(:disabled) { opacity: 0.95; }
    .floating-send:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class FloatingChatWindowComponent implements OnInit, AfterViewChecked {
  @Input() threadId!: string;
  @Input() threadFromList: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
  @ViewChild('messagesEl') messagesEl?: ElementRef<HTMLDivElement>;

  private api = inject(ApiService);
  private auth = inject(AuthService);

  displayName = '';
  projectTitle = '';
  messages: any[] = [];
  loading = true;
  messageBody = '';
  sending = false;
  myId = '';
  private scrollToBottom = false;

  ngOnInit() {
    this.myId = (this.auth.profile() as any)?.id || '';
    if (this.threadFromList?.other_participant) {
      const o = this.threadFromList.other_participant;
      this.displayName = o.full_name || (o.username ? '@' + o.username : '');
    }
    if (this.threadFromList?.projects?.title) this.projectTitle = this.threadFromList.projects.title;

    this.api.post<{ ok?: boolean }>(`/messages/thread/${this.threadId}/read`, {}).subscribe({
      next: () => this.opened.emit(),
      error: () => {},
    });
    this.api.get<any>(`/messages/thread/${this.threadId}`).subscribe({
      next: (data) => {
        this.messages = data.messages || [];
        this.displayName = data.other_participant?.full_name || (data.other_participant?.username ? '@' + data.other_participant.username : '') || this.displayName;
        this.projectTitle = data.project_title || this.projectTitle;
        this.loading = false;
        this.scrollToBottom = true;
        this.opened.emit();
      },
      error: () => { this.loading = false; this.opened.emit(); },
    });
  }

  ngAfterViewChecked() {
    if (this.scrollToBottom && this.messagesEl?.nativeElement) {
      this.messagesEl.nativeElement.scrollTop = this.messagesEl.nativeElement.scrollHeight;
      this.scrollToBottom = false;
    }
  }

  formatTime(iso: string | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  onEnter(e: Event) {
    const ke = e as KeyboardEvent;
    if (ke.key !== 'Enter' || ke.shiftKey) return;
    ke.preventDefault();
    this.sendMessage();
  }

  sendMessage() {
    const b = this.messageBody.trim();
    if (!b || this.sending || !this.threadId) return;
    this.sending = true;
    this.api.post<any>(`/messages/thread/${this.threadId}/messages`, { body: b }).subscribe({
      next: (msg) => {
        this.messageBody = '';
        this.sending = false;
        this.messages = [...(this.messages || []), msg];
        this.scrollToBottom = true;
      },
      error: () => { this.sending = false; },
    });
  }
}
