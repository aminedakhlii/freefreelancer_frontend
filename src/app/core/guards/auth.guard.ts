import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.waitForInitialSession();
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};

export const roleGuard = (role: 'freelancer' | 'client'): CanActivateFn => async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.waitForInitialSession();
  const p = auth.profile();
  if (!p) {
    router.navigate(['/login']);
    return false;
  }
  if (p.role !== role) {
    router.navigate([p.role === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard']);
    return false;
  }
  return true;
};
