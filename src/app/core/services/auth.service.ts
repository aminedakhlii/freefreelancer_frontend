import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FirebaseAuthService } from './firebase-auth.service';
import { ApiService } from './api.service';
import { AuthTokenService } from './auth-token.service';

export interface Profile {
  id: string;
  role: 'freelancer' | 'client' | 'admin';
  username?: string;
  full_name?: string;
  title?: string;
  company_name?: string;
  bio?: string;
  skills?: string[];
  profile_complete?: boolean;
  [key: string]: unknown;
}

const RECAPTCHA_CONTAINER_ID = 'firebase-recaptcha-container';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private firebase = inject(FirebaseAuthService);
  private api = inject(ApiService);
  private router = inject(Router);
  private authToken = inject(AuthTokenService);

  constructor() {
    this.authToken.setProvider(() => this.getAccessToken());
  }

  private profileSignal = signal<Profile | null>(null);
  profile = this.profileSignal.asReadonly();
  isLoggedIn = computed(() => !!this.profileSignal());

  /** reCAPTCHA container id for phone auth (add a div with this id in signup/login template). */
  readonly recaptchaContainerId = RECAPTCHA_CONTAINER_ID;

  private initialSessionDone: Promise<void> | null = null;

  waitForInitialSession(): Promise<void> {
    return this.init();
  }

  init(): Promise<void> {
    if (this.initialSessionDone !== null) return this.initialSessionDone;
    let resolved = false;
    this.initialSessionDone = new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        if (!resolved) { resolved = true; resolve(); }
      }, 5000);
      this.firebase.onAuthStateChanged(async (user) => {
        if (user) {
          const token = await user.getIdToken().catch(() => null);
          if (token) await this.loadProfile(token);
          else this.profileSignal.set(null);
        } else {
          this.profileSignal.set(null);
        }
        if (!resolved) { resolved = true; clearTimeout(timeout); resolve(); }
      });
    });
    return this.initialSessionDone;
  }

  private static readonly SIGNUP_PENDING_ROLE_KEY = 'signup_pending_role';
  private static readonly TOKEN_TIMEOUT_MS = 5000;

  async getAccessToken(): Promise<string | null> {
    try {
      return await Promise.race([
        this.firebase.getAccessToken(),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('token_timeout')), AuthService.TOKEN_TIMEOUT_MS)
        ),
      ]);
    } catch {
      return null;
    }
  }

  async loadProfile(accessToken?: string | null): Promise<Profile | null> {
    const token =
      accessToken !== undefined && accessToken !== null && accessToken !== ''
        ? accessToken
        : await this.getAccessToken();
    if (!token) {
      this.profileSignal.set(null);
      return null;
    }

    try {
      const res = await firstValueFrom(this.api.getWithToken<Profile>('/auth/me', token));
      if (res) {
        this.profileSignal.set(res);
        if (typeof localStorage !== 'undefined') localStorage.removeItem(AuthService.SIGNUP_PENDING_ROLE_KEY);
        return res;
      }
    } catch {
      this.profileSignal.set(null);
      const pendingRole = typeof localStorage !== 'undefined' && localStorage.getItem(AuthService.SIGNUP_PENDING_ROLE_KEY);
      if (pendingRole === 'freelancer' || pendingRole === 'client') {
        try {
          await firstValueFrom(this.api.postWithToken('/auth/profile', { role: pendingRole }, token));
          if (typeof localStorage !== 'undefined') localStorage.removeItem(AuthService.SIGNUP_PENDING_ROLE_KEY);
          return this.loadProfile(token);
        } catch {
          // ignore
        }
      }
    }
    return null;
  }

  /** Request SMS OTP (Firebase phone auth). Pass recaptcha container id from template. */
  async requestPhoneOtp(phone: string, recaptchaContainerId: string = RECAPTCHA_CONTAINER_ID): Promise<void> {
    await this.firebase.requestPhoneOtp(phone, recaptchaContainerId);
  }

  /** Verify phone OTP and complete auth. If signup pending role in localStorage, creates profile. */
  async verifyPhoneOtp(code: string): Promise<void> {
    const idToken = await this.firebase.verifyPhoneOtp(code);
    const pendingRole = typeof localStorage !== 'undefined' && localStorage.getItem(AuthService.SIGNUP_PENDING_ROLE_KEY);
    if (pendingRole === 'freelancer' || pendingRole === 'client') {
      await firstValueFrom(this.api.postWithToken('/auth/profile', { role: pendingRole }, idToken));
      // Clear pending role only after profile is loaded so we don't lose it if loadProfile fails
    }
    await this.loadProfile(idToken);
  }

  signOut(): Promise<void> {
    return this.firebase.signOut().then(() => {
      this.profileSignal.set(null);
      this.router.navigate(['/login']);
    });
  }

  redirectByRole() {
    const p = this.profileSignal();
    if (!p) return this.router.navigate(['/complete-signup']);
    if (p.role === 'freelancer') return this.router.navigate(['/freelancer/dashboard']);
    if (p.role === 'client') return this.router.navigate(['/client/dashboard']);
    return this.router.navigate(['/']);
  }
}
