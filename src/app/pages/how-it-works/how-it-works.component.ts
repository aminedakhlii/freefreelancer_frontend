import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container">
      <h1>Land better clients. Hire better talent. Here's how.</h1>
      <h2>For Clients</h2>
      <p>1. Post Your Project
        Describe what you need, set your budget ($1,000+), and list 
        the skills required. Takes less than 5 minutes.</p>
      <p>2. Let AI Do the Screening
        Every freelancer who wants to bid must first pass an AI skill 
        interview tailored to your project. No interview, no proposal.
      </p>
      <p>3. Review Scores, Not Guesswork
        Read proposals alongside each freelancer's interview transcript 
        and skill scores. Know who's qualified before you even reply.
      </p>
      <p>4. Hire With Confidence
        Message freelancers directly, agree on terms, and get to work. 
        No platform fees, no middleman.
      </p>
      <h2>For Freelancers</h2>
      <p>1. Build Your Profile
        Import your portfolio from Upwork, Fiverr, GitHub or add 
        projects manually. Set your skills and let your work speak.</p>

      <p>2. Find Projects Worth Your Time
        Browse $1,000+ projects from US clients who are serious about 
        hiring. Filter by skill, budget, and timeline.</p>

      <p>3. Take the AI Interview
        When you find a project you want, complete a short AI skill 
        interview. It's your chance to prove you're the right fit — 
        no cover letter lottery.</p>

      <p>4. Submit a Standout Proposal
        Pass the interview and your proposal goes to the top. Clients 
        see your score, transcript, and portfolio — not just a pitch.
      </p>
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
