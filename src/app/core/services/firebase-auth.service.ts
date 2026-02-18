import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  onAuthStateChanged,
  User,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { environment } from '../../../environments/environment';

/** Normalize US phone to E.164: 10 digits -> +1XXXXXXXXXX. */
export function toUsE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  if (phone.startsWith('+')) return phone;
  return '+1' + digits.slice(-10);
}

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  private ensureApp(): Auth | null {
    if (this.auth) return this.auth;
    const cfg = (environment as Record<string, unknown>)['firebase'];
    if (!cfg || typeof cfg !== 'object') return null;
    const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } = cfg as Record<string, string>;
    if (!apiKey || !projectId) return null;
    this.app = initializeApp({
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    });
    this.auth = getAuth(this.app);
    return this.auth;
  }

  /** Get current Firebase ID token for API calls. */
  async getAccessToken(): Promise<string | null> {
    const auth = this.ensureApp();
    if (!auth) return null;
    const user = auth.currentUser;
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  }

  /** Subscribe to auth state changes (user signed in / out). */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    const auth = this.ensureApp();
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  }

  /** Send SMS OTP to US phone. recaptchaContainerId = id of a DOM element for reCAPTCHA (invisible). */
  async requestPhoneOtp(phone: string, recaptchaContainerId: string): Promise<void> {
    const auth = this.ensureApp();
    if (!auth) throw new Error('Firebase config missing in environment');
    const container = document.getElementById(recaptchaContainerId);
    if (!container) throw new Error('reCAPTCHA container not found. Use id="' + recaptchaContainerId + '".');
    if (this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier.clear();
      } catch {
        // ignore
      }
      this.recaptchaVerifier = null;
    }
    this.recaptchaVerifier = new RecaptchaVerifier(auth, container, {
      size: 'invisible',
      callback: () => {},
    });
    const phoneNumber = toUsE164(phone);
    const result = await signInWithPhoneNumber(auth, phoneNumber, this.recaptchaVerifier);
    this.confirmationResult = result;
  }

  /** Verify the 6-digit code and complete sign-in. Returns the ID token. */
  async verifyPhoneOtp(code: string): Promise<string> {
    if (!this.confirmationResult) throw new Error('No verification in progress. Request a new code.');
    const { user } = await this.confirmationResult.confirm(code);
    this.confirmationResult = null;
    const token = await user.getIdToken();
    if (!token) throw new Error('Verification succeeded but no token.');
    return token;
  }

  signOut(): Promise<void> {
    const auth = this.auth || this.ensureApp();
    this.confirmationResult = null;
    this.recaptchaVerifier = null;
    if (!auth) return Promise.resolve();
    return firebaseSignOut(auth);
  }
}
