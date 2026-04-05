import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  inject,
  signal,
  computed,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../features/ecommerce/models/product.model';
import { ProductService } from '../../../features/ecommerce/services/product.service';

@Component({
  selector: 'app-ecommerce-front',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './ecommerce-front.component.html',
  styleUrl: './ecommerce-front.component.scss'
})
export class EcommerceFrontComponent implements OnInit, AfterViewInit, OnDestroy {

  private productService = inject(ProductService);
  private platformId = inject(PLATFORM_ID);

  // Signals
  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedCategory = signal<string>('All');
  carouselOffset = signal(0);

  private observer?: IntersectionObserver;
  private carouselInterval: any;
  private isPaused = false;
  private readonly isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Computed values
  categories = computed<string[]>(() => {
    const cats = new Set<string>();
    this.products().forEach(product => {
      if (product.categoryName?.trim()) {
        cats.add(product.categoryName.trim());
      }
    });
    return Array.from(cats).sort();
  });

  filteredProducts = computed<Product[]>(() => {
    const allProducts = this.products();
    const category = this.selectedCategory();

    if (category === 'All') return allProducts;
    return allProducts.filter(p => p.categoryName?.trim() === category);
  });

  featuredProducts = computed<Product[]>(() => {
    return [...this.products()]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 8);
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.initScrollAnimation();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getAll().subscribe({
      next: (data) => {
        this.products.set(data ?? []);
        this.loading.set(false);

        if (this.isBrowser) {
          setTimeout(() => {
            this.startAutoCarousel();
            this.observeCards();
          }, 400);
        }
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.error.set('Failed to load products. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);

    if (!this.isBrowser) return;

    if (category === 'All') {
      this.carouselOffset.set(0);
      this.startAutoCarousel();
    } else if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }

    setTimeout(() => this.observeCards(), 100);
  }

  // ==================== CAROUSEL METHODS (Options 1, 2 & 3) ====================

  private startAutoCarousel(): void {
    if (!this.isBrowser || this.carouselInterval) return;

    const cardWidth = 368; // 340px + 28px gap

    this.carouselInterval = setInterval(() => {
      if (this.isPaused) return;

      const totalCards = this.featuredProducts().length;
      if (totalCards <= 3) return;

      let current = this.carouselOffset() - cardWidth;
      const maxOffset = -(totalCards - 3) * cardWidth;

      if (current < maxOffset) {
        current = 0;
      }

      this.carouselOffset.set(current);
    }, 3200); // Défile toutes les 3.2 secondes
  }

  // Option 3 : Pause au survol
  pauseCarousel(): void {
    this.isPaused = true;
  }

  resumeCarousel(): void {
    this.isPaused = false;
  }

  // Option 2 : Flèches de navigation
  prevSlide(): void {
    if (!this.isBrowser) return;
    const cardWidth = 368;
    let current = this.carouselOffset();
    current += cardWidth;
    if (current > 0) current = 0;
    this.carouselOffset.set(current);
  }

  nextSlide(): void {
    if (!this.isBrowser) return;
    const cardWidth = 368;
    const totalCards = this.featuredProducts().length;
    let current = this.carouselOffset();
    current -= cardWidth;
    const maxOffset = -(totalCards - 3) * cardWidth;
    if (current < maxOffset) current = maxOffset;
    this.carouselOffset.set(current);
  }

  // Scroll Animation
  private initScrollAnimation(): void {
    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
  }

  private observeCards(): void {
    if (!this.isBrowser || !this.observer) return;
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => this.observer!.observe(card));
  }

  // Utilitaires
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-product.png';
  }

  getImageUrl(imageUrl?: string | null): string {
    return this.productService.getImageUrl(imageUrl);
  }

  getDisplayPrice(product: Product): number {
    return product.currentPrice ?? product.basePrice;
  }

  trackByProduct(index: number, product: Product): number {
    return product.id;
  }

  isNewProduct(product: Product): boolean {
    if (!product.createdAt) return false;
    const diffDays = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }

  isPreorderProduct(product: Product): boolean {
    return product.saleType === 'PREORDER';
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    this.observer?.disconnect();
  }
}