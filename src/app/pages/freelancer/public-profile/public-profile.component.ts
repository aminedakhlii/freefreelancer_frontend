import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { SeoService } from '../../../core/services/seo.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-freelancer-public-profile',
  standalone: true,
  template: `
    <div class="container">
      @if (profile) {
        <h1>{{ profile.full_name }}</h1>
        <p>{{ profile.title }}</p>
        <p>{{ profile.bio }}</p>
        <p>Skills: {{ profile.skills?.join(', ') }}</p>
      }
    </div>
  `,
})
export class PublicProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private seo = inject(SeoService);
  profile: any = null;

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.api.get<any>(`/profiles/freelancer/${username}`).subscribe({
        next: (p) => {
          this.profile = p;
          if (p) {
            const name = p.full_name || 'Freelancer';
            const title = p.title || '';
            const desc = (p.bio || '').slice(0, 155) || `${name}${title ? ' - ' + title : ''} | freefreelancer`;
            this.seo.update({
              title: `${name}${title ? ' | ' + title : ''} | freefreelancer`,
              description: desc,
              canonicalUrl: `${environment.siteUrl.replace(/\/$/, '')}/freelancer/${username}`,
            });
          }
        },
      });
    }
  }
}
