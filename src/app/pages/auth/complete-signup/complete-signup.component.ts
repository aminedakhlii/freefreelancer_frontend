import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-complete-signup',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container" style="padding-top: 2rem;">
      <div class="form-card">
        <h1>Complete your signup</h1>
        <p class="form-subtitle">Choose your account type to continue</p>
        <form (ngSubmit)="submit()">
          <div class="form-group">
            <label for="complete-role">I am a</label>
            <select id="complete-role" [(ngModel)]="role" name="role">
              <option value="freelancer">Freelancer</option>
              <option value="client">Client</option>
            </select>
          </div>
          @if (error) { <p class="error-msg">{{ error }}</p> }
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="loading">Continue</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CompleteSignupComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  role: 'freelancer' | 'client' = 'freelancer';
  loading = false;
  error = '';

  async ngOnInit() {
    const token = await this.auth.getAccessToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    const p = this.auth.profile();
    if (p) {
      this.auth.redirectByRole();
      return;
    }
  }

  async submit() {
    this.error = '';
    this.loading = true;
    try {
      const token = await this.auth.getAccessToken();
      if (!token) {
        this.error = 'Session expired. Please log in again.';
        return;
      }
      await firstValueFrom(this.api.postWithToken('/auth/profile', { role: this.role }, token));
      await this.auth.loadProfile(token);
      this.auth.redirectByRole();
    } catch (e: unknown) {
      const err = e as { error?: { error?: string }; message?: string };
      this.error = err?.error?.error || err?.message || 'Failed';
    } finally {
      this.loading = false;
    }
  }
}
