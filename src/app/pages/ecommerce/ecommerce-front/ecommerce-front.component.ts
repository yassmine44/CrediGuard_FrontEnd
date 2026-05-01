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
import { CalendarEvent } from '../../../pages/ecommerce/models/calendar-event.model';
import { CalendarEventService } from '../../../pages/ecommerce/services/calendar-event.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  RecentlyViewedProduct,
  RecentlyViewedProductsService
} from '../services/recently-viewed-products.service';
import {
  WishlistProduct,
  WishlistProductsService
} from '../services/wishlist-products.service';

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
  private calendarEventService = inject(CalendarEventService);
  private authService = inject(AuthService);
  private recentlyViewedProductsService = inject(RecentlyViewedProductsService);
  private wishlistProductsService = inject(WishlistProductsService);

  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedCategory = signal<string>('All');
  currentPage = signal(1);
  carouselOffset = signal(0);
  activeEvent = signal<CalendarEvent | null>(null);
  recentlyViewedProducts = signal<RecentlyViewedProduct[]>([]);
  wishlistProducts = signal<WishlistProduct[]>([]);

  private observer?: IntersectionObserver;
  private carouselInterval: any;
  private isPaused = false;
  private readonly isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

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

    if (category === 'All') {
      return allProducts;
    }

    if (category === 'PROMO') {
      return allProducts.filter(product => this.hasPromotion(product));
    }

    return allProducts.filter(p => p.categoryName?.trim() === category);
  });

  readonly pageSize = 12;

  totalPages = computed<number>(() => {
    return Math.max(1, Math.ceil(this.filteredProducts().length / this.pageSize));
  });

  paginatedProducts = computed<Product[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  visiblePages = computed<number[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
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

  promotedProducts = computed<Product[]>(() => {
    return this.products().filter(product => this.hasPromotion(product));
  });

  smartRecommendations = computed<Product[]>(() => {
    return [...this.products()]
      .filter(product => product.active !== false)
      .sort((a, b) => this.getRecommendationScore(b) - this.getRecommendationScore(a))
      .slice(0, 4);
  });

  ngOnInit(): void {
    this.loadRecentlyViewedProducts();
    this.loadWishlistProducts();
    this.loadProducts();
    this.loadActiveEvent();
  }

  loadRecentlyViewedProducts(): void {
    this.recentlyViewedProducts.set(this.recentlyViewedProductsService.getAll().slice(0, 5));
  }

  loadWishlistProducts(): void {
    this.wishlistProducts.set(this.wishlistProductsService.getAll());
  }

  loadActiveEvent(): void {
    this.calendarEventService.getActive().subscribe({
      next: (events) => {
        this.activeEvent.set(events && events.length > 0 ? events[0] : null);
      },
      error: (err) => {
        console.error('Failed to load active calendar events:', err);
        this.activeEvent.set(null);
      }
    });
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
    this.currentPage.set(1);

    if (!this.isBrowser) return;

    if (category === 'All') {
      this.carouselOffset.set(0);
      this.startAutoCarousel();
    } else if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }

    setTimeout(() => this.observeCards(), 100);
  }

  getCategoryCount(category: string): number {
    return this.products().filter(product => product.categoryName?.trim() === category).length;
  }

  getSelectedCategoryLabel(): string {
    const category = this.selectedCategory();

    if (category === 'All') return 'All products';
    if (category === 'PROMO') return 'Products on promotion';

    return category;
  }

  goToPage(page: number): void {
    const nextPage = Math.min(Math.max(1, page), this.totalPages());
    this.currentPage.set(nextPage);
    setTimeout(() => this.observeCards(), 100);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  private startAutoCarousel(): void {
    if (!this.isBrowser || this.carouselInterval) return;

    const cardWidth = 368;

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
    }, 3200);
  }

  pauseCarousel(): void {
    this.isPaused = true;
  }

  resumeCarousel(): void {
    this.isPaused = false;
  }

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

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-product.png';
  }

  getImageUrl(imageUrl?: string | null): string {
    return this.productService.getImageUrl(imageUrl);
  }

  clearRecentlyViewed(): void {
    this.recentlyViewedProductsService.clear();
    this.recentlyViewedProducts.set([]);
  }

  toggleWishlist(product: Product, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.wishlistProducts.set(this.wishlistProductsService.toggle(product));
  }

  removeFromWishlist(productId: number, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.wishlistProducts.set(this.wishlistProductsService.remove(productId));
  }

  isWishlisted(productId: number): boolean {
    return this.wishlistProducts().some(item => item.id === productId);
  }

  hasPromotion(product: Product): boolean {
    return !!product.promotionApplied
      && product.originalPrice != null
      && product.finalPrice != null
      && product.finalPrice < product.originalPrice;
  }

  getDisplayPrice(product: Product): number {
    return product.finalPrice ?? product.currentPrice ?? product.basePrice;
  }

  getOriginalPrice(product: Product): number {
    return product.originalPrice ?? product.currentPrice ?? product.basePrice;
  }

  getPromotionBadge(product: Product): string {
    if (!this.hasPromotion(product)) return '';
    return product.promotionName?.trim() || 'Seasonal Offer';
  }

  getDiscountPercent(product: Product): number {
    if (!this.hasPromotion(product) || !product.originalPrice || !product.finalPrice) {
      return 0;
    }

    return Math.round(
      ((product.originalPrice - product.finalPrice) / product.originalPrice) * 100
    );
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

  isLowStockProduct(product: Product): boolean {
    if (product.saleType === 'PREORDER') return false;
    const stock = product.stockQuantity ?? 0;
    return stock > 0 && stock <= 5;
  }

  getSmartBadge(product: Product): string {
    if (this.hasPromotion(product)) return 'Best deal';
    if (this.isLowStockProduct(product)) return 'Almost sold out';
    if (this.isNewProduct(product)) return 'New pick';
    if (this.isPreorderProduct(product)) return 'Preorder';
    return 'Recommended';
  }

  getSmartBadgeTone(product: Product): string {
    if (this.hasPromotion(product)) return 'deal';
    if (this.isLowStockProduct(product)) return 'stock';
    if (this.isNewProduct(product)) return 'new';
    if (this.isPreorderProduct(product)) return 'preorder';
    return 'recommended';
  }

  private getRecommendationScore(product: Product): number {
    let score = 0;

    if (this.hasPromotion(product)) score += 45;
    if (this.isLowStockProduct(product)) score += 35;
    if (this.isNewProduct(product)) score += 25;
    if (this.isPreorderProduct(product)) score += 15;
    if (product.expressDeliveryAvailable) score += 10;
    score += Math.max(0, 10 - Math.min(10, product.stockQuantity ?? 10));

    return score;
  }

  getActiveEventLabel(): string {
    return this.activeEvent()?.name?.trim() || 'Seasonal Offers';
  }

  getActiveEventDescription(): string {
    return this.activeEvent()?.description?.trim()
      || 'Discover our products currently on promotion and enjoy limited-time seasonal deals.';
  }

  getCurrentUser(): any | null {
    return this.authService.getUser();
  }

  getCurrentRole(): string | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    const role = user['role'] ?? user['userRole'] ?? user['authorities']?.[0];
    return typeof role === 'string' ? role.toUpperCase() : null;
  }

  isSeller(): boolean {
    const role = this.getCurrentRole();
    return role === 'BENEFICIARY';
  }

  isClient(): boolean {
    const role = this.getCurrentRole();
    return role === 'CLIENT';
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    this.observer?.disconnect();
  }
}
