import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PartnerProduct } from '../../../services/partner-product.service';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Modifier' : 'Ajouter' }} un Produit</h2>
    <mat-dialog-content>
      <form [formGroup]="productForm" class="product-form">
        <mat-form-field appearance="outline">
          <mat-label>Nom du Produit</mat-label>
          <input matInput formControlName="name" placeholder="Ex: Assurance Vie">
          <mat-error *ngIf="productForm.get('name')?.hasError('required')">Le nom est obligatoire</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Prix (TND)</mat-label>
          <input matInput type="number" formControlName="price" placeholder="0.00">
          <mat-error *ngIf="productForm.get('price')?.hasError('required')">Le prix est obligatoire</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Catégorie</mat-label>
          <input matInput formControlName="category" placeholder="Ex: Santé, Auto...">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Description du produit..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" [disabled]="productForm.invalid" (click)="onSave()">
        {{ data ? 'Mettre à jour' : 'Ajouter' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .product-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px 0;
      min-width: 350px;
    }
  `]
})
export class ProductDialogComponent {
  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PartnerProduct | null
  ) {
    this.productForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      price: [data?.price || '', [Validators.required, Validators.min(0)]],
      category: [data?.category || ''],
      description: [data?.description || ''],
      partnerId: [data?.partnerId || null]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.productForm.valid) {
      this.dialogRef.close({ ...this.data, ...this.productForm.value });
    }
  }
}
