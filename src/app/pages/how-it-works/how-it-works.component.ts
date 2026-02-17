import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container">
      <h1>How it works</h1>
      <p>Clients post projects ($1,000+). Freelancers take an AI interview, then submit proposals. Clients review scores and transcripts, then hire.</p>
      <a routerLink="/signup">Sign up</a>
    </div>
  `,
})
export class HowItWorksComponent implements OnInit {
  private seo = inject(SeoService);
  ngOnInit() {
    this.seo.update({
      title: 'How It Works | freefreelancer - $1000+ Projects & AI Interviews',
      description: 'Learn how freefreelancer works: clients post $1000+ projects, freelancers pass AI skill interviews, then submit proposals. No platform fees.',
    });
  }
}
