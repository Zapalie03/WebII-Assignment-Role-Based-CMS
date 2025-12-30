import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ArticleListComponent } from './components/articles/article-list.component';
import { CreateArticleComponent } from './components/articles/create-article.component';

// Import guards
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Protected routes
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard] // Only logged in users
  },
  { 
    path: 'articles', 
    component: ArticleListComponent,
    canActivate: [authGuard] // Only logged in users
  },
  
  { 
  path: 'articles/create', 
  component: CreateArticleComponent 
},
  
{ 
  path: 'admin-demo', 
  component: DashboardComponent, // Reusing your existing dashboard
  canActivate: [authGuard, roleGuard],
  data: { roles: ['SuperAdmin', 'Manager'] } // Only these roles
},
];