import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-article',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-article.component.html',
  styleUrls: ['./create-article.component.css']
})
export class CreateArticleComponent {
  article = {
    title: '',
    body: '',
    image: null as File | null
  };
  
  isEditMode = false;
  articleId: string | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  imagePreview: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {

    
    // Check if we're in edit mode (has id parameter)
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.articleId = params['id'];
        this.loadArticleForEdit();
      }
    });
  }

  loadArticleForEdit(): void {
    console.log('Loading article for edit:', this.articleId);
    
    // For demo, pre-fill with sample data
    this.article = {
      title: 'Sample Article for Editing',
      body: 'This is a sample article content that can be edited. You can modify this text as needed.',
      image: null
    };
    
    this.imagePreview = 'https://via.placeholder.com/400x200/4CAF50/FFFFFF?text=Article+Image';
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        this.errorMessage = 'Please select an image file (JPEG, PNG, GIF)';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }

      this.article.image = file;
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
      
      this.errorMessage = '';
    }
  }

  removeImage(): void {
    this.article.image = null;
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (!this.article.title.trim() || !this.article.body.trim()) {
      this.errorMessage = 'Title and content are required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    setTimeout(() => {
      console.log('Article data:', this.article);
      
      if (this.isEditMode) {
        this.successMessage = 'Article updated successfully!';
      } else {
        this.successMessage = 'Article created successfully!';
      }
      
      this.isLoading = false;
      
      setTimeout(() => {
        this.router.navigate(['/articles']);
      }, 2000);
    }, 1500);
  }

  cancel(): void {
    if (confirm('Are you sure? Unsaved changes will be lost.')) {
      this.router.navigate(['/articles']);
    }
  }
}