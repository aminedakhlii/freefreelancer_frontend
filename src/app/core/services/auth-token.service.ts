import { Injectable } from '@angular/core';

/** Provides the current auth token for API calls. AuthService registers itself so ApiService has no dependency on AuthService. */
@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private getToken: () => Promise<string | null> = () => Promise.resolve(null);

  setProvider(fn: () => Promise<string | null>): void {
    this.getToken = fn;
  }

  getAccessToken(): Promise<string | null> {
    return this.getToken();
  }
}
