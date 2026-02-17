import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { ApiService } from './api.service';

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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService);
  private api = inject(ApiService);
  private router = inject(Router);

  private profileSignal = signal<Profile | null>(null);
  profile = this.profileSignal.asReadonly();
  isLoggedIn = computed(() => !!this.profileSignal());

  /** Resolves when the initial Supabase session has been applied (profile set or confirmed null). */
  private initialSessionDone: Promise<void> | null = null;

  /** Wait for initial session to be restored (for use in guards if they run before APP_INITIALIZER). */
  waitForInitialSession(): Promise<void> {
    return this.init();
  }

  /**
   * Call once at app startup. Sets up auth state listener and returns a promise that resolves
   * when the initial session has been restored (so guards can wait and then read profile).
   */
  init(): Promise<void> {
    if (this.initialSessionDone !== null) return this.initialSessionDone;
    this.initialSessionDone = new Promise<void>((resolve) => {
      const timeout = setTimeout(() => resolve(), 5000);
      this.supabase.onAuthStateChange(async (event, session: unknown) => {
        const s = session as { user?: unknown; access_token?: string } | null;
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (s?.user) await this.loadProfile(s?.access_token ?? undefined);
          else this.profileSignal.set(null);
          if (event === 'INITIAL_SESSION') {
            clearTimeout(timeout);
            resolve();
          }
        } else if (event === 'SIGNED_OUT') {
          this.profileSignal.set(null);
        }
      });
    });
    return this.initialSessionDone;
  }

  private static readonly SIGNUP_PENDING_ROLE_KEY = 'signup_pending_role';
  private static readonly TOKEN_TIMEOUT_MS = 5000;

  /** Get access token with timeout so we never hang forever on getSession(). */
  private async getAccessTokenWithTimeout(): Promise<string | null> {
    try {
      return await Promise.race([
        this.supabase.getAccessToken(),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('token_timeout')), AuthService.TOKEN_TIMEOUT_MS)
        ),
      ]);
    } catch {
      return null;
    }
  }

  /**
   * Load profile from backend. Pass accessToken when you already have it (e.g. right after login)
   * so the request is sent immediately. We never use the Observable-based api.get() here so we
   * avoid hanging on getAccessToken(); we resolve the token first (with timeout) then use getWithToken.
   */
  async loadProfile(accessToken?: string | null): Promise<Profile | null> {
    const token =
      accessToken !== undefined && accessToken !== null && accessToken !== ''
        ? accessToken
        : await this.getAccessTokenWithTimeout();
    if (!token) {
      this.profileSignal.set(null);
      return null;
    }

    try {
      const res = await firstValueFrom(this.api.getWithToken<Profile>('/auth/me', token));
      if (res) {
        this.profileSignal.set(res);
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

  async signUp(email: string, password: string, role: 'freelancer' | 'client'): Promise<{ needsEmailConfirmation: boolean }> {
    const { data, error } = await this.supabase.signUp(email, password);
    if (error) throw error;
    if (data.session?.user && data.session.access_token) {
      await firstValueFrom(this.api.postWithToken('/auth/profile', { role }, data.session.access_token));
      await this.loadProfile(data.session.access_token);
      return { needsEmailConfirmation: false };
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AuthService.SIGNUP_PENDING_ROLE_KEY, role);
    }
    return { needsEmailConfirmation: true };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.signIn(email, password);
    if (error) throw error;
    const token = data?.session?.access_token;
    if (!token) {
      throw new Error('No session returned. Please confirm your email or try again.');
    }
    await this.loadProfile(token);
    return data;
  }

  /** Request SMS OTP for phone sign-in/sign-up. Call verifyPhoneOtp after user enters code. */
  async requestPhoneOtp(phone: string): Promise<void> {
    const { error } = await this.supabase.signInWithOtpPhone(phone);
    if (error) throw error;
  }

  /**
   * Verify phone OTP and complete auth. If signup pending role is in localStorage, creates profile with that role.
   */
  async verifyPhoneOtp(phone: string, token: string): Promise<void> {
    const { data, error } = await this.supabase.verifyOtpPhone(phone, token);
    if (error) throw error;
    const accessToken = data?.session?.access_token;
    if (!accessToken) throw new Error('Verification succeeded but no session.');
    const pendingRole = typeof localStorage !== 'undefined' && localStorage.getItem(AuthService.SIGNUP_PENDING_ROLE_KEY);
    if (pendingRole === 'freelancer' || pendingRole === 'client') {
      await firstValueFrom(this.api.postWithToken('/auth/profile', { role: pendingRole }, accessToken));
      if (typeof localStorage !== 'undefined') localStorage.removeItem(AuthService.SIGNUP_PENDING_ROLE_KEY);
    }
    await this.loadProfile(accessToken);
  }

  signOut() {
    return this.supabase.signOut().then(() => {
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
