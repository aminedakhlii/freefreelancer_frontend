import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `<div class="container" style="text-align: center; padding: 4rem;"><h1>404</h1><p>Page not found.</p><a routerLink="/">Go home</a></div>`,
})
export class NotFoundComponent {}
