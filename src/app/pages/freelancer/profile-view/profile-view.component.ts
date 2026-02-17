import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

interface Profile {
  full_name?: string;
  title?: string;
  bio?: string;
  hourly_rate?: number | string | null;
  avatar_url?: string;
  skills?: string[];
}

interface PortfolioItem {
  id: string;
  title: string;
  description?: string | null;
  link?: string | null;
  image_urls?: string[];
  skills?: string[] | null;
  created_at?: string;
}

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="profile-page">
      @if (loading) {
        <div class="container"><p class="loading-msg">Loading your profile…</p></div>
      } @else if (profile) {
        <div class="container profile-layout">
          <!-- Profile card (view) -->
          <section class="card profile-card">
            <div class="profile-header">
              @if (profile.avatar_url) {
                <img [src]="profile.avatar_url" alt="" class="profile-avatar" />
              } @else {
                <div class="profile-avatar-placeholder">{{ initials }}</div>
              }
              <div class="profile-heading">
                <h1 class="profile-name">{{ profile.full_name || 'Your profile' }}</h1>
                @if (profile.title) {
                  <p class="profile-title">{{ profile.title }}</p>
                }
                @if (profile.hourly_rate != null && profile.hourly_rate !== '') {
                  <p class="profile-rate">\${{ profile.hourly_rate }}/hr</p>
                }
              </div>
            </div>
            @if (profile.bio) {
              <div class="profile-bio">
                <h2 class="section-label">About</h2>
                <p>{{ profile.bio }}</p>
              </div>
            }
            @if (profile.skills?.length) {
              <div class="profile-skills">
                <h2 class="section-label">Skills</h2>
                <div class="skills-tags">
                  @for (s of profile.skills; track s) {
                    <span class="skill-tag">{{ s }}</span>
                  }
                </div>
              </div>
            }
            <div class="profile-actions">
              <a routerLink="/freelancer/profile/edit" class="btn btn-primary">Edit profile</a>
              <a routerLink="/freelancer/profile/import" class="btn btn-outline">Import from link</a>
            </div>
          </section>

          <!-- Portfolio -->
          <section class="card portfolio-section">
            <h2 class="section-title">Portfolio</h2>
            <p class="section-desc">Projects and work samples you can show to clients.</p>

            @if (portfolio.length) {
              <ul class="portfolio-list">
                @for (item of portfolio; track item.id) {
                  <li class="portfolio-item">
                    @if (item.image_urls?.length) {
                      <img [src]="item.image_urls?.[0]" alt="" class="portfolio-item-img" />
                    } @else {
                      <div class="portfolio-item-placeholder">No image</div>
                    }
                    <div class="portfolio-item-body">
                      <h3 class="portfolio-item-title">{{ item.title }}</h3>
                      @if (item.description) {
                        <p class="portfolio-item-desc">{{ item.description }}</p>
                      }
                      @if (item.link) {
                        <a [href]="item.link" target="_blank" rel="noopener" class="portfolio-item-link">{{ item.link }}</a>
                      }
                    </div>
                    <div class="portfolio-item-actions">
                      <button type="button" class="btn btn-ghost btn-sm" (click)="startEdit(item)" [disabled]="savingId === item.id">Edit</button>
                      <button type="button" class="btn btn-ghost btn-sm btn-danger" (click)="deleteItem(item)" [disabled]="savingId === item.id">Delete</button>
                    </div>
                  </li>
                }
              </ul>
            }

            <!-- Edit one item (inline) -->
            @if (editingItem) {
              <div class="portfolio-edit-form form-card">
                <h3>Edit project</h3>
                <form (ngSubmit)="saveEdit()">
                  <div class="form-group">
                    <label>Title</label>
                    <input [(ngModel)]="editForm.title" name="title" placeholder="Project title" />
                  </div>
                  <div class="form-group">
                    <label>Description</label>
                    <textarea [(ngModel)]="editForm.description" name="description" rows="3" placeholder="Brief description"></textarea>
                  </div>
                  <div class="form-group">
                    <label>Link (optional)</label>
                    <input [(ngModel)]="editForm.link" name="link" type="url" placeholder="https://..." />
                  </div>
                  <div class="form-actions">
                    <button type="button" class="btn btn-ghost" (click)="cancelEdit()">Cancel</button>
                    <button type="submit" class="btn btn-primary" [disabled]="savingId">Save</button>
                  </div>
                </form>
              </div>
            }

            <!-- Add new -->
            @if (!showAddForm) {
              <button type="button" class="btn btn-outline add-portfolio-btn" (click)="showAddForm = true">+ Add portfolio item</button>
            } @else {
              <div class="portfolio-add-form form-card">
                <h3>Add portfolio item</h3>
                <form (ngSubmit)="addItem()">
                  <div class="form-group">
                    <label>Title</label>
                    <input [(ngModel)]="newTitle" name="newTitle" placeholder="Project title" required />
                  </div>
                  <div class="form-group">
                    <label>Description (optional)</label>
                    <textarea [(ngModel)]="newDescription" name="newDescription" rows="3" placeholder="Brief description"></textarea>
                  </div>
                  <div class="form-group">
                    <label>Link (optional)</label>
                    <input [(ngModel)]="newLink" name="newLink" type="url" placeholder="https://..." />
                  </div>
                  <div class="form-group">
                    <label>Image URL (optional)</label>
                    <input [(ngModel)]="newImageUrl" name="newImageUrl" type="url" placeholder="https://..." />
                  </div>
                  @if (addError) {
                    <p class="error-message">{{ addError }}</p>
                  }
                  <div class="form-actions">
                    <button type="button" class="btn btn-ghost" (click)="cancelAdd()">Cancel</button>
                    <button type="submit" class="btn btn-primary" [disabled]="adding || !newTitle.trim()">{{ adding ? 'Adding…' : 'Add' }}</button>
                  </div>
                </form>
              </div>
            }
          </section>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .profile-page { padding: 1.5rem 0 3rem; min-height: 60vh; }
      .loading-msg { padding: 2rem; color: var(--text-muted); }
      .profile-layout { display: grid; gap: 1.5rem; max-width: 900px; }
      .profile-card { padding: 1.75rem; }
      .profile-header { display: flex; align-items: flex-start; gap: 1.25rem; margin-bottom: 1.25rem; }
      .profile-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
      .profile-avatar-placeholder {
        width: 80px; height: 80px; border-radius: 50%; background: var(--border); color: var(--text-muted);
        display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 600;
      }
      .profile-heading { flex: 1; min-width: 0; }
      .profile-name { margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 600; }
      .profile-title { margin: 0; color: var(--text-muted); font-size: 1rem; }
      .profile-rate { margin: 0.25rem 0 0; font-size: 0.9375rem; font-weight: 500; color: var(--primary); }
      .profile-bio { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
      .profile-skills { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
      .section-label, .section-title { margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600; color: var(--text); }
      .section-desc { margin: 0 0 1rem 0; font-size: 0.9rem; color: var(--text-muted); }
      .profile-bio p, .profile-skills p { margin: 0; font-size: 0.9375rem; line-height: 1.5; color: var(--text); }
      .skills-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.35rem; }
      .skill-tag { background: var(--bg); color: var(--text); padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.85rem; }
      .profile-actions { margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border); display: flex; gap: 0.75rem; flex-wrap: wrap; }
      .portfolio-section { padding: 1.75rem; }
      .portfolio-list { list-style: none; padding: 0; margin: 0 0 1.5rem 0; }
      .portfolio-item {
        display: grid; grid-template-columns: 100px 1fr auto; gap: 1rem; align-items: start;
        padding: 1rem; background: var(--bg); border-radius: var(--radius-sm); margin-bottom: 0.75rem;
      }
      .portfolio-item-img { width: 100px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); }
      .portfolio-item-placeholder {
        width: 100px; height: 80px; background: var(--border); border-radius: var(--radius-sm);
        display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: var(--text-muted);
      }
      .portfolio-item-body { min-width: 0; }
      .portfolio-item-title { margin: 0 0 0.25rem 0; font-size: 1rem; font-weight: 600; }
      .portfolio-item-desc { margin: 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.4; }
      .portfolio-item-link { font-size: 0.85rem; word-break: break-all; color: var(--primary); }
      .portfolio-item-actions { display: flex; gap: 0.5rem; }
      .btn-sm { padding: 0.4rem 0.75rem; font-size: 0.875rem; }
      .btn-danger { color: var(--error); }
      .btn-danger:hover:not(:disabled) { background: var(--error-bg); color: var(--error); }
      .portfolio-edit-form, .portfolio-add-form { margin-top: 1rem; padding: 1.25rem; background: var(--bg); border-radius: var(--radius-sm); }
      .portfolio-edit-form h3, .portfolio-add-form h3 { margin: 0 0 1rem 0; font-size: 1.1rem; }
      .add-portfolio-btn { margin-top: 0.5rem; }
    `,
  ],
})
export class ProfileViewComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  profile: Profile | null = null;
  portfolio: PortfolioItem[] = [];
  loading = true;

  showAddForm = false;
  newTitle = '';
  newDescription = '';
  newLink = '';
  newImageUrl = '';
  adding = false;
  addError = '';

  editingItem: PortfolioItem | null = null;
  editForm: { title: string; description: string; link: string } = { title: '', description: '', link: '' };
  savingId: string | null = null;

  get initials(): string {
    if (!this.profile?.full_name) return '?';
    const name = String(this.profile.full_name).trim();
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.get<Profile>('/profiles/me').subscribe({
      next: (p) => {
        this.profile = p;
        this.loadPortfolio();
      },
      error: () => { this.loading = false; },
    });
  }

  loadPortfolio() {
    this.api.get<{ items: PortfolioItem[] }>('/profiles/me/portfolio').subscribe({
      next: (res) => {
        this.portfolio = res.items || [];
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  startEdit(item: PortfolioItem) {
    this.editingItem = item;
    this.editForm = {
      title: item.title || '',
      description: item.description || '',
      link: item.link || '',
    };
  }

  cancelEdit() {
    this.editingItem = null;
    this.savingId = null;
  }

  saveEdit() {
    if (!this.editingItem) return;
    this.savingId = this.editingItem.id;
    this.api.patch<any>(`/profiles/me/portfolio/${this.editingItem.id}`, this.editForm).subscribe({
      next: () => {
        this.editingItem = null;
        this.savingId = null;
        this.loadPortfolio();
      },
      error: () => { this.savingId = null; },
    });
  }

  deleteItem(item: PortfolioItem) {
    if (!confirm('Remove this portfolio item?')) return;
    this.savingId = item.id;
    this.api.delete(`/profiles/me/portfolio/${item.id}`).subscribe({
      next: () => {
        this.savingId = null;
        if (this.editingItem?.id === item.id) this.editingItem = null;
        this.loadPortfolio();
      },
      error: () => { this.savingId = null; },
    });
  }

  addItem() {
    if (!this.newTitle.trim()) return;
    this.addError = '';
    this.adding = true;
    this.api.post<any>('/profiles/me/portfolio', {
      title: this.newTitle.trim(),
      description: this.newDescription.trim() || undefined,
      link: this.newLink.trim() || undefined,
      image_urls: this.newImageUrl.trim() ? [this.newImageUrl.trim()] : [],
    }).subscribe({
      next: () => {
        this.adding = false;
        this.cancelAdd();
        this.loadPortfolio();
      },
      error: (err) => {
        this.adding = false;
        this.addError = err?.error?.error || 'Failed to add item.';
      },
    });
  }

  cancelAdd() {
    this.showAddForm = false;
    this.newTitle = '';
    this.newDescription = '';
    this.newLink = '';
    this.newImageUrl = '';
    this.addError = '';
  }
}
