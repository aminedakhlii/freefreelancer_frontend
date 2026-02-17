import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-freelancer-profile-edit',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container" style="padding-top: 1rem;">
      <div class="form-card" style="max-width: 560px;">
        <h1>Edit profile</h1>
        <p class="form-subtitle">Update your name, title, bio, and rate. <a routerLink="/freelancer/profile">Back to profile</a> · <a routerLink="/freelancer/profile/import">Import from link</a></p>
        <form (ngSubmit)="save()">
          <div class="form-group">
            <label for="fe-name">Full name</label>
            <input id="fe-name" [(ngModel)]="fullName" name="fullName" placeholder="Your name" />
          </div>
          <div class="form-group">
            <label for="fe-title">Professional title</label>
            <input id="fe-title" [(ngModel)]="title" name="title" placeholder="e.g. Senior React Developer" />
          </div>
          <div class="form-group">
            <label for="fe-bio">Bio (200–1000 characters)</label>
            <textarea id="fe-bio" [(ngModel)]="bio" name="bio" rows="4" placeholder="Describe your experience and what you offer..."></textarea>
          </div>
          <div class="form-group">
            <label for="fe-rate">Hourly rate (\$)</label>
            <input id="fe-rate" type="number" [(ngModel)]="hourlyRate" name="hourlyRate" placeholder="0" min="0" />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="loading">Save</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProfileEditComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  fullName = '';
  title = '';
  bio = '';
  hourlyRate: number | null = null;
  loading = false;

  ngOnInit() {
    const p = this.auth.profile();
    if (p) {
      this.fullName = p.full_name ?? '';
      this.title = p.title ?? '';
      this.bio = p.bio ?? '';
      const rate = (p as Record<string, unknown>)['hourly_rate'];
      this.hourlyRate = typeof rate === 'number' ? rate : null;
    }
  }

  save() {
    this.loading = true;
    this.api.patch<any>('/profiles/me', {
      full_name: this.fullName,
      title: this.title,
      bio: this.bio,
      hourly_rate: this.hourlyRate,
    }).subscribe({
      next: () => { this.loading = false; this.auth.loadProfile(); },
      error: () => { this.loading = false; },
    });
  }
}
