import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-client-profile-edit',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container" style="padding-top: 1rem;">
      <div class="form-card" style="max-width: 560px;">
        <h1>Edit profile</h1>
        <p class="form-subtitle">Your company or contact profile</p>
        <form (ngSubmit)="save()">
          <div class="form-group">
            <label for="ce-name">Full name / Company name</label>
            <input id="ce-name" [(ngModel)]="fullName" name="fullName" placeholder="Your name or company" />
          </div>
          <div class="form-group">
            <label for="ce-company">Company name</label>
            <input id="ce-company" [(ngModel)]="companyName" name="companyName" placeholder="Company name" />
          </div>
          <div class="form-group">
            <label for="ce-industry">Industry</label>
            <input id="ce-industry" [(ngModel)]="industry" name="industry" placeholder="e.g. Technology, Healthcare" />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="loading">Save</button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ClientProfileEditComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  fullName = '';
  companyName = '';
  industry = '';
  loading = false;

  ngOnInit() {
    const p = this.auth.profile();
    if (p) {
      this.fullName = p.full_name ?? '';
      this.companyName = p.company_name ?? '';
      this.industry = (p as Record<string, string>)['industry'] ?? '';
    }
  }

  save() {
    this.loading = true;
    this.api.patch<any>('/profiles/me', {
      full_name: this.fullName,
      company_name: this.companyName,
      industry: this.industry,
    }).subscribe({
      next: () => { this.loading = false; this.auth.loadProfile(); },
      error: () => { this.loading = false; },
    });
  }
}
