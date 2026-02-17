import { inject, Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  get supabase(): SupabaseClient {
    return this.client;
  }

  get session() {
    return this.client.auth.getSession();
  }

  get user(): Promise<User | null> {
    return this.client.auth.getUser().then(({ data: { user } }) => user);
  }

  getAccessToken(): Promise<string | null> {
    return this.client.auth.getSession().then(({ data: { session } }) => session?.access_token ?? null);
  }

  signUp(email: string, password: string) {
    return this.client.auth.signUp({ email, password });
  }

  signIn(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password });
  }

  /** Normalize US phone to E.164: 10 digits -> +1XXXXXXXXXX. */
  static toUsE164(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return '+1' + digits;
    if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
    if (phone.startsWith('+')) return phone;
    return '+1' + digits.slice(-10);
  }

  /** Phone OTP: send 6-digit code via SMS. Pass US 10-digit number (no +1). */
  signInWithOtpPhone(phone: string) {
    const normalized = SupabaseService.toUsE164(phone);
    return this.client.auth.signInWithOtp({ phone: normalized });
  }

  /** Phone OTP: verify the 6-digit code and complete sign-in. */
  verifyOtpPhone(phone: string, token: string) {
    const normalized = SupabaseService.toUsE164(phone);
    return this.client.auth.verifyOtp({ phone: normalized, token, type: 'sms' });
  }

  signInWithOAuth(provider: 'google' | 'github' | 'linkedin_oidc') {
    return this.client.auth.signInWithOAuth({ provider });
  }

  signOut() {
    return this.client.auth.signOut();
  }

  resetPasswordForEmail(email: string) {
    return this.client.auth.resetPasswordForEmail(email);
  }

  onAuthStateChange(cb: (event: string, session: unknown) => void) {
    return this.client.auth.onAuthStateChange(cb);
  }
}
