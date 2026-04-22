import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';   // ← Important pour routerLink

import { CategoryService } from '../services/category.service';
import {
  Category,
  CategoryCreateRequest,
  CategoryUpdateRequest
} from '../models/category.model';

@Component({
  selector: 'app-categories-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterModule], // ← Ajout de RouterModule
  templateUrl: './categories-admin.component.html',
  styleUrl: './categories-admin.component.scss'
})
export class CategoriesAdminComponent implements OnInit {

  private categoryService = inject(CategoryService);

  categories = signal<Category[]>([]);
  loading = signal(false);
  error = signal('');
  success = signal('');

  showForm = signal(false);
  editingCategoryId = signal<number | null>(null);

  formData: CategoryCreateRequest = {
    name: '',
    description: '',
    parentId: null
  };

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set('');

    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement catégories :', err);
        this.error.set('Impossible de charger les catégories.');
        this.loading.set(false);
      }
    });
  }

  openCreateForm(): void {
    this.resetForm();
    this.showForm.set(true);
  }

  openEditForm(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.formData = {
      name: category.name,
      description: category.description ?? '',
      parentId: category.parentId
    };
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.resetForm();
    this.showForm.set(false);
  }

  private resetForm(): void {
    this.editingCategoryId.set(null);
    this.formData = {
      name: '',
      description: '',
      parentId: null
    };
    this.error.set('');
    this.success.set('');
  }

  saveCategory(): void {
    this.error.set('');
    this.success.set('');

    if (!this.formData.name?.trim()) {
      this.error.set('Le nom de la catégorie est obligatoire.');
      return;
    }

    const payload = {
      name: this.formData.name.trim(),
      description: this.formData.description?.trim() || null,
      parentId: this.formData.parentId || null
    };

    const editingId = this.editingCategoryId();

    if (editingId !== null) {
      // Update
      const updatePayload: CategoryUpdateRequest = payload;
      this.categoryService.update(editingId, updatePayload).subscribe({
        next: () => {
          this.success.set('Catégorie mise à jour avec succès.');
          this.showForm.set(false);
          this.loadCategories();
        },
        error: (err) => {
          this.error.set(this.extractErrorMessage(err, 'Erreur lors de la mise à jour.'));
        }
      });
    } else {
      // Create
      const createPayload: CategoryCreateRequest = payload;
      this.categoryService.create(createPayload).subscribe({
        next: () => {
          this.success.set('Catégorie créée avec succès.');
          this.showForm.set(false);
          this.loadCategories();
        },
        error: (err) => {
          this.error.set(this.extractErrorMessage(err, 'Erreur lors de la création.'));
        }
      });
    }
  }

  deleteCategory(id: number): void {
    if (!confirm('Voulez-vous vraiment supprimer cette catégorie ?')) return;

    this.categoryService.delete(id).subscribe({
      next: () => {
        this.success.set('Catégorie supprimée avec succès.');
        this.loadCategories();
      },
      error: (err) => {
        this.error.set(this.extractErrorMessage(err, 'Erreur lors de la suppression.'));
      }
    });
  }

  getParentName(parentId: number | null): string {
    if (!parentId) return '—';
    const parent = this.categories().find(c => c.id === parentId);
    return parent ? parent.name : `#${parentId}`;
  }

  availableParents(currentId: number | null): Category[] {
    return this.categories().filter(c => c.id !== currentId);
  }

  private extractErrorMessage(err: any, fallback: string): string {
    return err?.error?.message || fallback;
  }
}