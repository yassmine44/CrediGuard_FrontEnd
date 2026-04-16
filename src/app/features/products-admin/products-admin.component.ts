import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs';

import { PartnerProductService, PartnerProduct } from '../../services/partner-product.service';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatTableModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule
  ],
  templateUrl: './products-admin.component.html',
  styleUrls: ['./products-admin.component.scss']
})
export class ProductsComponent implements OnInit {

  products: PartnerProduct[] = [];
  filteredProducts: PartnerProduct[] = [];
  loading = false;
  search: string = '';

  displayedColumns: string[] = ['name', 'price', 'actions'];

  constructor(
    private partnerProductService: PartnerProductService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.load();
  }
load() {
  this.loading = true;
  this.partnerProductService.getAll()
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: (data) => {
        console.log("DATA:", data); // 🔍 debug
        this.products = data;
        this.filteredProducts = data; // ✅ FIX PRINCIPAL
        console.log("products:", this.products.length);
console.log("filtered:", this.filteredProducts.length);
      },
      error: (err) => console.error('Error loading products:', err)
    });

}

 onSearch() {
  const term = this.search.toLowerCase().trim();

  if (!term) {
    this.filteredProducts = this.products;
    return;
  }

  this.filteredProducts = this.products.filter(p =>
    p.name.toLowerCase().includes(term) ||
    (p.category && p.category.toLowerCase().includes(term))
  );
}


  openAddDialog() {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '450px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.add(result);
      }
    });
  }

  openEditDialog(product: PartnerProduct) {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '450px',
      data: product
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && product.id) {
        this.update(product.id, result);
      }
    });
  }

  add(product: PartnerProduct) {
    this.loading = true;
    this.partnerProductService.create(product)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.load();
        },
        error: (err) => console.error('Error adding product:', err)
      });
  }

  update(id: number, product: PartnerProduct) {
    this.loading = true;
    this.partnerProductService.update(id, product)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.load();
        },
        error: (err) => console.error('Error updating product:', err)
      });
  }

delete(id?: number) {
  if (!id) {
    console.error("ID UNDEFINED ❌");
    return;
  }

  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
    this.loading = true;
    this.partnerProductService.delete(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => this.load(),
        error: (err) => console.error('Error deleting product:', err)
      });
  }
}
}