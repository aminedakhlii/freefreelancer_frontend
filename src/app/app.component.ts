import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);
  private doc = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  profile = this.auth.profile;

  ngOnInit() {
    this.auth.init();
    if (isPlatformBrowser(this.platformId)) {
      this.addVerificationTags();
      this.addGa4IfConfigured();
    }
  }

  private addVerificationTags(): void {
    const head = this.doc.getElementsByTagName('head')[0];
    if (!head) return;
    if (environment.googleSiteVerification) {
      let meta = this.doc.querySelector('meta[name="google-site-verification"]');
      if (!meta) {
        meta = this.doc.createElement('meta');
        meta.setAttribute('name', 'google-site-verification');
        head.appendChild(meta);
      }
      meta.setAttribute('content', environment.googleSiteVerification);
    }
    if (environment.bingSiteVerification) {
      let meta = this.doc.querySelector('meta[name="msvalidate.01"]');
      if (!meta) {
        meta = this.doc.createElement('meta');
        meta.setAttribute('name', 'msvalidate.01');
        head.appendChild(meta);
      }
      meta.setAttribute('content', environment.bingSiteVerification);
    }
  }

  private addGa4IfConfigured(): void {
    if (!environment.gaMeasurementId) return;
    const script = this.doc.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${environment.gaMeasurementId}`;
    this.doc.head.appendChild(script);
    const config = this.doc.createElement('script');
    config.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${environment.gaMeasurementId}');`;
    this.doc.head.appendChild(config);
  }

  signOut() {
    this.auth.signOut();
  }
}
