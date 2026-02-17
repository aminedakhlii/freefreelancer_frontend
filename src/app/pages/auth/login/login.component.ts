import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container" style="padding-top: 2rem;">
      <div class="form-card">
        <h1>Log in</h1>
        <p class="form-subtitle">Welcome back. Enter your phone number to receive a code.</p>
        @if (step === 1) {
          <form (ngSubmit)="sendCode()">
            <div class="form-group">
              <label for="login-phone">Phone number</label>
              <input id="login-phone" type="tel" [(ngModel)]="phone" name="phone" placeholder="5551234567" maxlength="10" inputmode="numeric" pattern="[0-9]*" (input)="onPhoneInput($event)" required />
              <span class="field-hint">US only — 10 digits, no country code</span>
            </div>
            @if (error) { <p class="error-msg">{{ error }}</p> }
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="loading || phone.length < 10">Send code</button>
            </div>
          </form>
        } @else {
          <p class="code-sent-msg">We sent a 6-digit code to <strong>{{ formatPhoneDisplay(phone) }}</strong>.</p>
          <form (ngSubmit)="verify()">
            <div class="form-group">
              <label for="login-otp">Verification code</label>
              <input id="login-otp" type="text" [(ngModel)]="otp" name="otp" placeholder="000000" maxlength="6" pattern="[0-9]*" inputmode="numeric" />
            </div>
            @if (error) { <p class="error-msg">{{ error }}</p> }
            <div class="form-actions">
              <button type="button" class="btn btn-ghost" (click)="step = 1; error = ''">Use different number</button>
              <button type="submit" class="btn btn-primary" [disabled]="loading || otp.length < 6">Verify & log in</button>
            </div>
          </form>
        }
        <p class="form-footer">
          <a routerLink="/signup">Sign up</a>
        </p>
      </div>
    </div>
  `,
  styles: [`.field-hint { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem; display: block; } .code-sent-msg { margin-bottom: 1rem; font-size: 0.9375rem; }`],
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private seo = inject(SeoService);
  step: 1 | 2 = 1;
  phone = '';
  otp = '';
  error = '';
  loading = false;
  private readonly timeoutMs = 15000;

  ngOnInit() {
    this.seo.update({
      title: 'Log in | freefreelancer',
      description: 'Log in to your freefreelancer account.',
      noIndex: true,
    });
  }

  onPhoneInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '').slice(0, 10);
    this.phone = digits;
    input.value = digits;
  }

  formatPhoneDisplay(phone: string): string {
    const d = (phone || '').replace(/\D/g, '').slice(-10);
    if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    return phone || '';
  }

  async sendCode() {
    this.error = '';
    this.loading = true;
    try {
      await this.auth.requestPhoneOtp(this.phone);
      this.step = 2;
      this.otp = '';
    } catch (e: unknown) {
      this.error = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Failed to send code.';
    } finally {
      this.loading = false;
    }
  }

  async verify() {
    this.error = '';
    this.loading = true;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Verification timed out. Request a new code.')), this.timeoutMs)
    );
    try {
      await Promise.race([this.auth.verifyPhoneOtp(this.phone, this.otp), timeoutPromise]);
      const p = this.auth.profile();
      if (!p) this.router.navigate(['/complete-signup']);
      else this.auth.redirectByRole();
    } catch (e: unknown) {
      this.error = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Invalid or expired code.';
    } finally {
      this.loading = false;
    }
  }
}
