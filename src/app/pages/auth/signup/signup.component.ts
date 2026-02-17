import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';

const SIGNUP_PENDING_ROLE_KEY = 'signup_pending_role';
const SIGNUP_PENDING_PHONE_KEY = 'signup_pending_phone';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container" style="padding-top: 2rem;">
      <div class="form-card">
        <h1>Sign up</h1>
        <p class="form-subtitle">Create your freefreelancer account with your phone number</p>
        @if (step === 1) {
          <form (ngSubmit)="sendCode()">
            <div class="form-group">
              <label for="signup-role">I am a</label>
              <select id="signup-role" [(ngModel)]="role" name="role">
                <option value="freelancer">Freelancer</option>
                <option value="client">Client</option>
              </select>
            </div>
            <div class="form-group">
              <label for="signup-phone">Phone number</label>
              <input id="signup-phone" type="tel" [(ngModel)]="phone" name="phone" placeholder="+1 234 567 8900" required />
              <span class="field-hint">Enter with country code (e.g. +1 for US)</span>
            </div>
            @if (error) { <p class="error-msg">{{ error }}</p> }
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="loading">Send verification code</button>
            </div>
          </form>
        } @else {
          <p class="code-sent-msg">We sent a 6-digit code to <strong>{{ phone }}</strong>. Enter it below.</p>
          <form (ngSubmit)="verify()">
            <div class="form-group">
              <label for="signup-otp">Verification code</label>
              <input id="signup-otp" type="text" [(ngModel)]="otp" name="otp" placeholder="000000" maxlength="6" pattern="[0-9]*" inputmode="numeric" />
            </div>
            @if (error) { <p class="error-msg">{{ error }}</p> }
            <div class="form-actions">
              <button type="button" class="btn btn-ghost" (click)="step = 1; error = ''">Change number</button>
              <button type="submit" class="btn btn-primary" [disabled]="loading || otp.length < 6">Verify & create account</button>
            </div>
          </form>
        }
        <p class="form-footer"><a routerLink="/login">Already have an account? Log in</a></p>
      </div>
    </div>
  `,
  styles: [`.field-hint { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem; display: block; } .code-sent-msg { margin-bottom: 1rem; font-size: 0.9375rem; }`],
})
export class SignupComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private seo = inject(SeoService);
  step: 1 | 2 = 1;
  role: 'freelancer' | 'client' = 'freelancer';
  phone = '';
  otp = '';
  error = '';
  loading = false;

  ngOnInit() {
    this.seo.update({
      title: 'Sign up | freefreelancer - Freelancers & Clients',
      description: 'Create your freefreelancer account. Join as a freelancer or client. US only, $1000+ projects, AI-verified skills.',
      noIndex: true,
    });
  }

  async sendCode() {
    this.error = '';
    this.loading = true;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SIGNUP_PENDING_ROLE_KEY, this.role);
        localStorage.setItem(SIGNUP_PENDING_PHONE_KEY, this.phone);
      }
      await this.auth.requestPhoneOtp(this.phone);
      this.step = 2;
      this.otp = '';
    } catch (e: unknown) {
      this.error = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Failed to send code. Check the number and try again.';
    } finally {
      this.loading = false;
    }
  }

  async verify() {
    this.error = '';
    this.loading = true;
    const phoneToUse = typeof localStorage !== 'undefined' ? localStorage.getItem(SIGNUP_PENDING_PHONE_KEY) || this.phone : this.phone;
    try {
      await this.auth.verifyPhoneOtp(phoneToUse || this.phone, this.otp);
      this.auth.redirectByRole();
    } catch (e: unknown) {
      this.error = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Invalid or expired code. Try again.';
    } finally {
      this.loading = false;
    }
  }
}
