import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'how-it-works', loadComponent: () => import('./pages/how-it-works/how-it-works.component').then(m => m.HowItWorksComponent) },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./pages/auth/signup/signup.component').then(m => m.SignupComponent) },
  { path: 'forgot-password', loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'complete-signup', loadComponent: () => import('./pages/auth/complete-signup/complete-signup.component').then(m => m.CompleteSignupComponent) },
  { path: 'terms', loadComponent: () => import('./pages/legal/terms/terms.component').then(m => m.TermsComponent) },
  { path: 'privacy', loadComponent: () => import('./pages/legal/privacy/privacy.component').then(m => m.PrivacyComponent) },
  {
    path: 'freelancer',
    canActivate: [authGuard, roleGuard('freelancer')],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/freelancer/dashboard/dashboard.component').then(m => m.FreelancerDashboardComponent) },
      { path: 'projects', loadComponent: () => import('./pages/freelancer/projects-list/projects-list.component').then(m => m.FreelancerProjectsListComponent) },
      { path: 'projects/:id', loadComponent: () => import('./pages/freelancer/project-detail/project-detail.component').then(m => m.FreelancerProjectDetailComponent) },
      { path: 'interview/:projectId', loadComponent: () => import('./pages/freelancer/interview/interview.component').then(m => m.InterviewComponent) },
      { path: 'proposals/create/:projectId', loadComponent: () => import('./pages/freelancer/proposal-create/proposal-create.component').then(m => m.ProposalCreateComponent) },
      { path: 'proposals', loadComponent: () => import('./pages/freelancer/proposals-list/proposals-list.component').then(m => m.ProposalsListComponent) },
      { path: 'proposals/:id', loadComponent: () => import('./pages/freelancer/proposal-detail/proposal-detail.component').then(m => m.ProposalDetailComponent) },
      { path: 'profile', loadComponent: () => import('./pages/freelancer/profile-view/profile-view.component').then(m => m.ProfileViewComponent) },
      { path: 'profile/edit', loadComponent: () => import('./pages/freelancer/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent) },
      { path: 'profile/import', loadComponent: () => import('./pages/freelancer/profile-import/profile-import.component').then(m => m.ProfileImportComponent) },
      { path: 'messages', loadComponent: () => import('./pages/shared/messages/messages.component').then(m => m.MessagesComponent) },
      { path: 'messages/thread/:threadId', loadComponent: () => import('./pages/shared/thread-view/thread-view.component').then(m => m.ThreadViewComponent) },
      { path: ':username', loadComponent: () => import('./pages/freelancer/public-profile/public-profile.component').then(m => m.PublicProfileComponent) },
    ],
  },
  {
    path: 'client',
    canActivate: [authGuard, roleGuard('client')],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/client/dashboard/dashboard.component').then(m => m.ClientDashboardComponent) },
      { path: 'projects/new', loadComponent: () => import('./pages/client/project-new/project-new.component').then(m => m.ProjectNewComponent) },
      { path: 'projects', loadComponent: () => import('./pages/client/projects-list/projects-list.component').then(m => m.ClientProjectsListComponent) },
      { path: 'projects/:id', loadComponent: () => import('./pages/client/project-detail/project-detail.component').then(m => m.ClientProjectDetailComponent) },
      { path: 'proposals/:id', loadComponent: () => import('./pages/client/proposal-view/proposal-view.component').then(m => m.ProposalViewComponent) },
      { path: 'freelancers', loadComponent: () => import('./pages/client/freelancers-list/freelancers-list.component').then(m => m.FreelancersListComponent) },
      { path: 'freelancers/view/:username', loadComponent: () => import('./pages/client/freelancer-view/freelancer-view.component').then(m => m.FreelancerViewComponent) },
      { path: 'profile/edit', loadComponent: () => import('./pages/client/profile-edit/profile-edit.component').then(m => m.ClientProfileEditComponent) },
      { path: 'messages', loadComponent: () => import('./pages/shared/messages/messages.component').then(m => m.MessagesComponent) },
      { path: 'messages/new/:freelancerId', loadComponent: () => import('./pages/client/new-conversation/new-conversation.component').then(m => m.NewConversationComponent) },
      { path: 'messages/thread/:threadId', loadComponent: () => import('./pages/shared/thread-view/thread-view.component').then(m => m.ThreadViewComponent) },
      { path: ':username', loadComponent: () => import('./pages/client/public-profile/public-profile.component').then(m => m.ClientPublicProfileComponent) },
    ],
  },
  { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent), canActivate: [authGuard] },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
