import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container" style="padding-top: 2rem;">
      <div class="form-card">
        <h1>Forgot password</h1>
        <p class="form-subtitle">This app uses phone sign-in. Use the code sent to your phone to log in.</p>
        <p class="form-footer"><a routerLink="/login">Back to login</a></p>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {}
