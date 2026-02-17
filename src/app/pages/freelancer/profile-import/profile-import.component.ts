import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

interface PortfolioItem {
  title: string;
  description: string;
  link?: string | null;
  image?: string | null;
}

@Component({
  selector: 'app-profile-import',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container" style="padding-top: 1rem;">
      <div class="form-card" style="max-width: 640px;">
        <h1>Import profile from link</h1>
        <p class="form-subtitle">Paste a link to your profile on Upwork, Fiverr, LinkedIn, GitHub, or similar. We'll extract your bio and portfolio.</p>

        @if (!result) {
          <form (ngSubmit)="import()">
            <div class="form-group">
              <label for="import-url">Profile URL</label>
              <input
                id="import-url"
                type="url"
                [(ngModel)]="url"
                name="url"
                placeholder="https://www.upwork.com/freelancers/..."
              />
            </div>
            @if (error) {
              <p class="error-message">{{ error }}</p>
            }
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="loading || !url.trim()">
                {{ loading ? 'Importing…' : 'Import' }}
              </button>
            </div>
          </form>
        } @else {
          <div class="import-result">
            <div class="form-group">
              <label>Bio</label>
              <textarea [(ngModel)]="editableBio" rows="4" placeholder="Professional summary..."></textarea>
            </div>
            @if (portfolio.length) {
              <h2 style="margin-top: 1.5rem;">Portfolio ({{ portfolio.length }})</h2>
              <ul class="portfolio-preview">
                @for (item of portfolio; track item.title + $index) {
                  <li class="portfolio-item">
                    @if (item.image) {
                      <img [src]="item.image" alt="" class="portfolio-thumb" />
                    }
                    <div>
                      <strong>{{ item.title }}</strong>
                      @if (item.description) {
                        <p>{{ item.description }}</p>
                      }
                      @if (item.link) {
                        <a [href]="item.link" target="_blank" rel="noopener">{{ item.link }}</a>
                      }
                    </div>
                  </li>
                }
              </ul>
            }
            @if (error) {
              <p class="error-message">{{ error }}</p>
            }
            @if (success) {
              <p class="success-message">Profile and portfolio updated.</p>
            }
            <div class="form-actions" style="margin-top: 1rem;">
              <button type="button" class="btn btn-ghost" (click)="reset()">Import another</button>
              <button type="button" class="btn btn-primary" [disabled]="applying" (click)="applyToProfile()">
                {{ applying ? 'Saving…' : 'Save to my profile' }}
              </button>
            </div>
          </div>
        }

        <p style="margin-top: 1rem;">
          <a routerLink="/freelancer/profile/edit">← Back to edit profile</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .portfolio-preview { list-style: none; padding: 0; margin: 0; }
      .portfolio-item { display: flex; gap: 1rem; margin-bottom: 1rem; padding: 0.75rem; background: var(--surface, #f5f5f5); border-radius: 8px; }
      .portfolio-thumb { width: 80px; height: 80px; object-fit: cover; border-radius: 6px; }
      .portfolio-item p { margin: 0.25rem 0 0; font-size: 0.9rem; color: var(--text-muted, #666); }
      .portfolio-item a { font-size: 0.85rem; word-break: break-all; }
    `,
  ],
})
export class ProfileImportComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  url = '';
  editableBio = '';

  private _loading = false;
  private _error = '';
  private _success = false;
  private _applying = false;
  private _result: { bio: string; portfolio: PortfolioItem[] } | null = null;

  get loading(): boolean {
    return this._loading;
  }
  get error(): string {
    return this._error;
  }
  get success(): boolean {
    return this._success;
  }
  get applying(): boolean {
    return this._applying;
  }
  get result(): { bio: string; portfolio: PortfolioItem[] } | null {
    return this._result;
  }
  get portfolio(): PortfolioItem[] {
    return this._result?.portfolio ?? [];
  }

  import() {
    this._error = '';
    this._loading = true;
    this.api.post<{ bio: string; portfolio: PortfolioItem[] }>('/profiles/import-from-link', { url: this.url.trim() }).subscribe({
      next: (res) => {
        this._loading = false;
        this._result = { bio: res.bio ?? '', portfolio: res.portfolio ?? [] };
        this.editableBio = this._result.bio;
      },
      error: (err) => {
        this._loading = false;
        this._error = err?.error?.error || err?.error?.detail || 'Import failed. Try another URL.';
      },
    });
  }

  reset() {
    this._result = null;
    this._error = '';
    this._success = false;
    this.url = '';
    this.editableBio = '';
  }

  applyToProfile() {
    this._error = '';
    this._success = false;
    this._applying = true;
    const bio = this.editableBio.trim();
    const items = this._result?.portfolio ?? [];

    this.api.patch<any>('/profiles/me', { bio }).subscribe({
      next: () => {
        if (items.length === 0) {
          this._applying = false;
          this._success = true;
          this.auth.loadProfile();
          return;
        }
        let done = 0;
        items.forEach((item) => {
          this.api
            .post<any>('/profiles/me/portfolio', {
              title: item.title || 'Untitled',
              description: item.description || '',
              link: item.link || undefined,
              image_urls: item.image ? [item.image] : [],
            })
            .subscribe({
              next: () => {
                done++;
                if (done === items.length) {
                  this._applying = false;
                  this._success = true;
                  this.auth.loadProfile();
                }
              },
              error: () => {
                this._error = 'Failed to save some portfolio items.';
                this._applying = false;
              },
            });
        });
      },
      error: () => {
        this._applying = false;
        this._error = 'Failed to update profile.';
      },
    });
  }
}
