import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router'; // ADDED Router
import { TestAuthService } from '../../services/test-auth.service';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.css']
})
export class ArticleListComponent implements OnInit {
  articles: any[] = [];
  isLoading = false;
  userRole: string = '';
  currentUser: any = null;

  constructor(
    private testAuth: TestAuthService,
    private router: Router // ADDED Router
  ) {
    this.userRole = this.testAuth.getUserRole();
    this.currentUser = this.testAuth.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.isLoading = true;
    
    // Mock data
    setTimeout(() => {
      this.articles = [
        {
          _id: '1',
          title: 'Getting Started with Angular',
          body: 'Angular is a platform for building mobile and desktop web applications...',
          author: {
            _id: 'admin123',
            fullName: 'System Admin',
            email: 'admin@example.com'
          },
          isPublished: true,
          createdAt: '2025-12-29T10:30:00Z',
          updatedAt: '2025-12-29T10:30:00Z'
        },
        {
          _id: '2',
          title: 'MEAN Stack Tutorial',
          body: 'Learn how to build applications using MongoDB, Express, Angular, and Node.js...',
          author: {
            _id: 'manager123',
            fullName: 'Content Manager',
            email: 'manager@example.com'
          },
          isPublished: false,
          createdAt: '2025-12-28T14:20:00Z',
          updatedAt: '2025-12-29T09:15:00Z'
        },
        {
          _id: '3',
          title: 'Web Development Best Practices',
          body: 'Learn the best practices for modern web development...',
          author: {
            _id: 'contributor123',
            fullName: 'Content Contributor',
            email: 'contributor@example.com'
          },
          isPublished: true,
          createdAt: '2025-12-27T11:45:00Z',
          updatedAt: '2025-12-28T16:30:00Z'
        }
      ];
      
      // If user is Viewer, show only published articles
      if (this.userRole === 'Viewer') {
        this.articles = this.articles.filter(article => article.isPublished);
      }
      
      this.isLoading = false;
    }, 1000);
  }

  canCreateArticle(): boolean {
    return ['SuperAdmin', 'Manager', 'Contributor'].includes(this.userRole);
  }

  canEditArticle(article: any): boolean {
    if (this.userRole === 'SuperAdmin') return true;
    if (this.userRole === 'Manager') return true;
    if (this.userRole === 'Contributor') {
      return this.currentUser?._id === article.author._id;
    }
    return false;
  }

  canDeleteArticle(): boolean {
    return ['SuperAdmin', 'Manager'].includes(this.userRole);
  }

  canPublishArticle(): boolean {
    return ['SuperAdmin', 'Manager'].includes(this.userRole);
  }

  viewArticle(article: any): void {
  alert(`📖 Viewing Article:\n\nTitle: ${article.title}\n\nContent: ${article.body}\n\nAuthor: ${article.author.fullName}\n\nStatus: ${article.isPublished ? 'Published' : 'Draft'}`);
}

  editArticle(article: any): void {
  alert(`✏️ Editing Article:\n\nTitle: ${article.title}\n\nID: ${article._id}\n\nIn a full implementation, this would open the edit form.`);
}

  deleteArticle(id: string): void {
    if (confirm('Are you sure you want to delete this article?')) {
      this.articles = this.articles.filter(article => article._id !== id);
    }
  }

  togglePublish(article: any): void {
    article.isPublished = !article.isPublished;
  }
}