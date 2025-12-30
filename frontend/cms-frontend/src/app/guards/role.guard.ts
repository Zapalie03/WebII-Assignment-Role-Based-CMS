import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as string[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No role requirement, allow access
  }

  const userRole = authService.getUserRole();
  
  if (!userRole) {
    // No role, redirect to login
    router.navigate(['/login']);
    return false;
  }

  if (requiredRoles.includes(userRole)) {
    return true; // User has required role
  }

  // User doesn't have required role, redirect to dashboard or show error
  router.navigate(['/dashboard']);
  return false;
};