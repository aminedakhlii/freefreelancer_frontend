import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="container">
      <h1>Settings</h1>
      <p>Notification and account settings. (Placeholder)</p>
    </div>
  `,
})
export class SettingsComponent {
  private auth = inject(AuthService);
}
