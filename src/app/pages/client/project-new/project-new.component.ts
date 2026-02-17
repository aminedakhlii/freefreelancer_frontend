import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { PRESET_SKILLS } from '../../../core/constants/preset-skills';

@Component({
  selector: 'app-project-new',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container" style="padding-top: 1rem;">
      <div class="form-card" style="max-width: 560px;">
        <h1>Post a project</h1>
        <p class="form-subtitle">Describe your project (minimum budget \$1,000)</p>
        <form (ngSubmit)="submit()">
          <div class="form-group">
            <label for="project-title">Title</label>
            <input id="project-title" [(ngModel)]="title" name="title" placeholder="e.g. Build a React dashboard" required />
          </div>
          <div class="form-group">
            <label for="project-desc">Description (min 100 characters)</label>
            <textarea id="project-desc" [(ngModel)]="description" name="description" rows="6" placeholder="Describe the scope, goals, and deliverables..." minlength="100"></textarea>
          </div>
          <div class="form-group skills-group">
            <label for="project-skills">Skills</label>
            <p class="skills-hint">Type to search and click a suggestion to add it. Add at least 1 skill.</p>
            <div class="skills-input-wrap">
              <input
                id="project-skills"
                type="text"
                [(ngModel)]="skillInput"
                name="skillInput"
                placeholder="e.g. React, Node.js"
                (input)="showSuggestions = true; filterSuggestions()"
                (focus)="showSuggestions = true; filterSuggestions()"
                (blur)="onSkillsBlur()"
                autocomplete="off"
              />
              @if (showSuggestions && suggestions.length > 0) {
                <ul class="skills-suggestions" (mousedown)="$event.preventDefault()">
                  @for (s of suggestions; track s) {
                    <li (mousedown)="addSkill(s)">{{ s }}</li>
                  }
                </ul>
              }
            </div>
            @if (selectedSkills.length > 0) {
              <div class="skills-chips">
                @for (skill of selectedSkills; track skill) {
                  <span class="skill-chip">
                    {{ skill }}
                    <button type="button" class="chip-remove" (mousedown)="removeSkill(skill)" aria-label="Remove">×</button>
                  </span>
                }
              </div>
            }
          </div>
          <div class="form-group">
            <label for="project-budget">Budget (\$, min 1,000)</label>
            <input id="project-budget" type="number" [(ngModel)]="budget" name="budget" min="1000" placeholder="1000" />
          </div>
          <div class="form-group">
            <label for="project-timeline">Timeline</label>
            <input id="project-timeline" [(ngModel)]="timeline" name="timeline" placeholder="e.g. 4 weeks" />
          </div>
          @if (error) { <p class="error-msg">{{ error }}</p> }
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="loading">Post project</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .skills-group { overflow: visible; }
    .skills-hint { font-size: 0.8rem; color: var(--text-muted); margin: 0 0 0.5rem 0; }
    .skills-input-wrap { position: relative; overflow: visible; }
    .skills-suggestions {
      position: absolute; left: 0; right: 0; top: 100%; margin: 0; padding: 0.5rem 0; list-style: none;
      background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm);
      box-shadow: var(--shadow-hover); max-height: 260px; min-height: 2rem; overflow-y: auto; z-index: 100;
      margin-top: 2px;
    }
    .skills-suggestions li {
      padding: 0.5rem 1rem; cursor: pointer; font-size: 0.9375rem;
    }
    .skills-suggestions li:hover { background: var(--bg); }
    .skills-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; position: relative; z-index: 0; }
    .skill-chip {
      display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.6rem;
      background: var(--primary); color: #fff; border-radius: 999px; font-size: 0.875rem;
    }
    .chip-remove { border: none; background: none; cursor: pointer; padding: 0 0.15rem; font-size: 1.1rem; line-height: 1; color: #fff; }
    .chip-remove:hover { opacity: 0.9; }
  `],
})
export class ProjectNewComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  title = '';
  description = '';
  skillInput = '';
  selectedSkills: string[] = [];
  showSuggestions = false;
  suggestions: string[] = [];
  budget: number | null = 1000;
  timeline = '';
  loading = false;
  error = '';

  private get allSuggestions(): string[] {
    const q = this.skillInput.trim().toLowerCase();
    if (!q) return PRESET_SKILLS.slice(0, 15);
    return PRESET_SKILLS.filter(s => s.toLowerCase().includes(q) && !this.selectedSkills.includes(s)).slice(0, 12);
  }

  filterSuggestions() {
    this.suggestions = this.allSuggestions;
  }

  onSkillsBlur() {
    setTimeout(() => { this.showSuggestions = false; }, 200);
  }

  addSkill(skill: string) {
    if (!this.selectedSkills.includes(skill)) {
      this.selectedSkills = [...this.selectedSkills, skill];
      this.skillInput = '';
      this.suggestions = this.allSuggestions;
    }
    this.showSuggestions = false;
  }

  removeSkill(skill: string) {
    this.selectedSkills = this.selectedSkills.filter(s => s !== skill);
  }

  submit() {
    if (this.description.length < 100 || !this.title || (this.budget ?? 0) < 1000 || this.selectedSkills.length < 1) {
      this.error = 'Title, description (100+ chars), at least 1 skill, and budget ≥ $1000 required';
      return;
    }
    this.loading = true;
    this.error = '';
    this.api.post<any>('/projects', {
      title: this.title,
      description: this.description,
      skills: this.selectedSkills,
      budget: this.budget,
      timeline: this.timeline,
      deliverables: [],
    }).subscribe({
      next: () => this.router.navigate(['/client/projects']),
      error: (e) => { this.error = e?.error?.error || 'Failed'; this.loading = false; },
    });
  }
}
