import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TestAuthService {
  getUserRole(): string {
    // Get role from localStorage (from registration)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role || 'Viewer';
      } catch {
        return 'Viewer';
      }
    }
    return 'Viewer';
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}