import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthTokenService } from './auth-token.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private authToken = inject(AuthTokenService);

  private getHeaders(): Observable<Record<string, string>> {
    return from(this.authToken.getAccessToken()).pipe(
      switchMap((token) => {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return [headers];
      })
    );
  }

  getWithToken<T>(path: string, token: string, params?: Record<string, string | number | boolean>): Observable<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => { httpParams = httpParams.set(k, String(v)); });
    }
    return this.http.get<T>(`${environment.apiUrl}${path}`, { headers, params: httpParams });
  }

  postWithToken<T>(path: string, body: unknown, token: string): Observable<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    return this.http.post<T>(`${environment.apiUrl}${path}`, body, { headers });
  }

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        let httpParams = new HttpParams();
        if (params) {
          Object.entries(params).forEach(([k, v]) => { httpParams = httpParams.set(k, String(v)); });
        }
        return this.http.get<T>(`${environment.apiUrl}${path}`, { headers, params: httpParams });
      })
    );
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.post<T>(`${environment.apiUrl}${path}`, body, { headers }))
    );
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.patch<T>(`${environment.apiUrl}${path}`, body, { headers }))
    );
  }

  delete<T>(path: string): Observable<T> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.delete<T>(`${environment.apiUrl}${path}`, { headers }))
    );
  }
}
