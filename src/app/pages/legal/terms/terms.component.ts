import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-terms',
  standalone: true,
  template: `<div class="container"><h1>Terms of Service</h1><p>Placeholder. Replace with your terms.</p></div>`,
})
export class TermsComponent implements OnInit {
  private seo = inject(SeoService);
  ngOnInit() {
    this.seo.update({
      title: 'Terms of Service | freefreelancer',
      description: 'Terms of Service for freefreelancer. Read our terms and conditions for using the platform.',
    });
  }
}
