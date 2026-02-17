import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container" style="padding-top: 2rem;">
      <div class="form-card">
        <h1>Forgot password</h1>
        <p class="form-subtitle">We’ll send you a link to reset your password</p>
        <form (ngSubmit)="submit()">
          <div class="form-group">
            <label for="forgot-email">Email</label>
            <input id="forgot-email" type="email" [(ngModel)]="email" name="email" placeholder="you@example.com" required />
          </div>
          @if (done) { <p class="success-msg">Check your email for the reset link.</p> }
          @if (error) { <p class="error-msg">{{ error }}</p> }
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="loading">Send reset link</button>
          </div>
        </form>
        <p class="form-footer"><a routerLink="/login">Back to login</a></p>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private supabase = inject(SupabaseService);
  email = '';
  error = '';
  done = false;
  loading = false;

  async submit() {
    this.error = '';
    this.loading = true;
    try {
      await this.supabase.resetPasswordForEmail(this.email);
      this.done = true;
    } catch (e: any) {
      this.error = e?.message || 'Failed';
    } finally {
      this.loading = false;
    }
  }
}
