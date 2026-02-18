import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container" style="padding-top: 2rem;">
      <div class="form-card">
        <h1>Complete your profile</h1>
        <p class="form-subtitle">Add a few details so others can recognize you</p>
        <form (ngSubmit)="submit()">
          <div class="form-group">
            <label for="full_name">Full name</label>
            <input id="full_name" type="text" [(ngModel)]="fullName" name="full_name" placeholder="Your name" required />
          </div>
          @if (isFreelancer) {
            <div class="form-group">
              <label for="title">Title / headline</label>
              <input id="title" type="text" [(ngModel)]="title" name="title" placeholder="e.g. Full-stack developer" />
            </div>
          }
          @if (isClient) {
            <div class="form-group">
              <label for="company_name">Company name</label>
              <input id="company_name" type="text" [(ngModel)]="companyName" name="company_name" placeholder="Your company (optional)" />
            </div>
          }
          @if (error) { <p class="error-msg">{{ error }}</p> }
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="loading || !fullName.trim()">Continue</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CompleteProfileComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  fullName = '';
  title = '';
  companyName = '';
  loading = false;
  error = '';
  isFreelancer = false;
  isClient = false;

  ngOnInit() {
    const p = this.auth.profile();
    if (!p) {
      this.router.navigate(['/login']);
      return;
    }
    this.isFreelancer = p.role === 'freelancer';
    this.isClient = p.role === 'client';
    this.fullName = (p.full_name as string) || '';
    this.title = (p.title as string) || '';
    this.companyName = (p.company_name as string) || '';
  }

  async submit() {
    this.error = '';
    this.loading = true;
    try {
      const payload: Record<string, string | boolean> = { full_name: this.fullName.trim(), profile_complete: true };
      if (this.isFreelancer && this.title.trim()) payload['title'] = this.title.trim();
      if (this.isClient && this.companyName.trim()) payload['company_name'] = this.companyName.trim();
      await firstValueFrom(this.api.patch('/profiles/me', payload));
      await this.auth.loadProfile();
      this.auth.redirectByRole();
    } catch (e: unknown) {
      const err = e as { error?: { error?: string }; message?: string };
      this.error = err?.error?.error || err?.message || 'Failed to save';
    } finally {
      this.loading = false;
    }
  }
}
