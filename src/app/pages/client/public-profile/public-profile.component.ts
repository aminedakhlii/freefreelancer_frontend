import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-client-public-profile',
  standalone: true,
  template: `
    <div class="container">
      @if (profile) {
        <h1>{{ profile.company_name || profile.full_name }}</h1>
        <p>{{ profile.industry }}</p>
      }
    </div>
  `,
})
export class ClientPublicProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  profile: any = null;

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.api.get<any>(`/profiles/client/${username}`).subscribe({ next: (p) => (this.profile = p) });
    }
  }
}
