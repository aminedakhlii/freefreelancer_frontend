import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/** Notify chat panel to open and optionally select a thread (e.g. after starting a new conversation). */
@Injectable({ providedIn: 'root' })
export class ChatPanelService {
  /** Emits thread id when the panel should open and select that thread. */
  readonly openWithThreadId = new Subject<string>();

  /** Call after starting a new conversation so the floating chat opens with that thread. */
  openWithThread(threadId: string): void {
    this.openWithThreadId.next(threadId);
  }
}
