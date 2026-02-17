import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-privacy',
  standalone: true,
  template: `<div class="container"><h1>Privacy Policy</h1><p>Placeholder. Replace with your policy.</p></div>`,
})
export class PrivacyComponent implements OnInit {
  private seo = inject(SeoService);
  ngOnInit() {
    this.seo.update({
      title: 'Privacy Policy | freefreelancer',
      description: 'Privacy Policy for freefreelancer. How we collect, use, and protect your data.',
    });
  }
}
