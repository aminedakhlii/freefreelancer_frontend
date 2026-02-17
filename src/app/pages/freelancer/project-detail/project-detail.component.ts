import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-freelancer-project-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page project-detail-page">
      @if (loading) {
        <div class="loading-state"><div class="spinner"></div><span>Loading…</span></div>
      } @else if (project) {
        <div class="detail-header card">
          <h1>{{ project.title }}</h1>
          <div class="meta-row">
            <span class="meta-budget">\${{ project.budget?.toLocaleString?.() ?? project.budget }}</span>
            @if (project.timeline) { <span class="meta-timeline">{{ project.timeline }}</span> }
          </div>
          @if (project.skills?.length) {
            <div class="skills-row">
              @for (s of project.skills; track s) { <span class="skill-tag">{{ s }}</span> }
            </div>
          }
          <div class="description">
            <p>{{ project.description }}</p>
          </div>
          <a [routerLink]="['/freelancer/interview', project.id]" class="btn btn-primary cta-btn">
            Submit proposal (start AI interview)
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .project-detail-page { padding: 1.5rem 0 3rem; max-width: 640px; margin: 0 auto; }
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem; color: var(--text-muted); }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .detail-header { padding: 1.5rem; }
    .detail-header h1 { margin: 0 0 0.75rem 0; font-size: 1.5rem; font-weight: 700; line-height: 1.3; }
    .meta-row { display: flex; gap: 1.25rem; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; }
    .meta-budget { font-size: 1.125rem; font-weight: 700; color: var(--primary); }
    .meta-timeline { font-size: 0.9375rem; color: var(--text-muted); }
    .skills-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .skill-tag { background: var(--bg); color: var(--text); padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.8rem; }
    .description { margin-bottom: 1.5rem; }
    .description p { margin: 0; font-size: 0.9375rem; line-height: 1.6; color: var(--text); }
    .cta-btn { display: inline-block; text-decoration: none; }
  `],
})
export class FreelancerProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  project: any = null;
  loading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<any>(`/projects/${id}`).subscribe({
        next: (p) => { this.project = p; this.loading = false; },
        error: () => { this.loading = false; },
      });
    }
  }
}
