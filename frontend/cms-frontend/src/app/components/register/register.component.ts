import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    fullName: '',
    email: '',
    password: '',
    role: 'Viewer'
  };
  
  roles = ['SuperAdmin', 'Manager', 'Contributor', 'Viewer'];
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}
  
  onSubmit() {
    if (!this.user.fullName || !this.user.email || !this.user.password) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // TEMPORARY: Simulate registration since backend returns 204
    console.log('Registration data:', this.user);
    
    this.successMessage = 'Registration successful! Redirecting to dashboard...';
    
    // Create mock user for testing frontend
    const mockUser = {
      _id: 'mock-id-' + Date.now(),
      fullName: this.user.fullName,
      email: this.user.email,
      role: this.user.role
    };

    // Save to localStorage (like real auth would)
    localStorage.setItem('accessToken', 'mock-token-' + Date.now());
    localStorage.setItem('refreshToken', 'mock-refresh-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Redirect to dashboard
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1500);
    
    this.isLoading = false;
    
    // KEEP THIS COMMENTED CODE FOR LATER - when backend works:
    /*
    this.authService.register(this.user).subscribe({
      next: (response) => {
        this.successMessage = 'Registration successful! Redirecting to login...';
        
        // Wait 2 seconds then redirect to login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
    */
  }
}