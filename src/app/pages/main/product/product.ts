import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ProductService, Product as ProductInterface } from '../../../../services/product-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Reviews as ReviewsService } from '../../../../services/reviews';
import { CommonModule } from '@angular/common';
import { Cart as CartService } from '../../../../services/cart';
import { Favorites as FavoritesService} from '../../../../services/favorites';
import { UserService } from '../../../../services/user-service';
import { ProductCard } from '../../../components/product-card/product-card';

@Component({
  selector: 'app-product',
  imports: [RouterLink, CommonModule, ProductCard],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class Product {
  public activeTab = signal<'description' | 'specifications' | 'reviews'>('description');
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public userService = inject(UserService);
  private productService = inject(ProductService);
  private reviewsService = inject(ReviewsService);
  private cartService = inject(CartService);
  private favoritesService = inject(FavoritesService);
  private destroyRef = inject(DestroyRef);

  public product = this.productService.productById;
  public reviews = this.reviewsService.reviews;
  public isProductLoading = signal(false);
  public isUpdating = signal(false);
  public error = signal<string | null>(null);
  public isFavorited = signal(false);

  public images: string[] = [];
  public selectedImageIndex: number = 0;
  public quantity: number = 1;


  private isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  private fetchProduct(id: number): void {
    this.isProductLoading.set(true);

    this.productService.getProduct(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.images = this.product()!.imageUrls;
          this.images.unshift(this.product()!.imageUrl);
          this.isFavorited.set(this.product()!.isFavorite);
          this.isProductLoading.set(false);
          this.fetchProducts(this.product()?.category.id)
        },
        error: (err) => {
          this.router.navigate(['/shop']);
          console.error('[ProductService] Failed to fetch product:', err);
          this.isProductLoading.set(false);
        }
      });
  }

  private fetchReviews(id: number): void {
    this.reviewsService.getReviews(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          console.error('[ReviewsService] Failed to fetch product:', err);
        }
      });
  }

  public quantityChange(t: number): void {
    this.quantity += t;
    this.quantity === 0 ? this.quantity = 1 : this.quantity > this.product()!.stock ? this.quantity = this.product()!.stock : null;
  }

  addToCart() {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isUpdating.set(true);
    this.cartService.addToCart(this.product()!.id, this.quantity)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.isUpdating.set(false),
        error: (err) => {
          console.error(err);
          this.isUpdating.set(false);
        }
      });
  }

  toggleFavorite() {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isUpdating.set(true);
    const action = this.isFavorited()
      ? this.favoritesService.removeFavorite(this.product()!.id)
      : this.favoritesService.addFavorite(this.product()!.id);

    action
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isFavorited.set(!this.isFavorited());
          this.isUpdating.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isUpdating.set(false);
        }
      });
  }

  private checkFavorite() {
    if (!this.isLoggedIn()) return;
    this.favoritesService.getFavorites(10)
    .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          let favorites = res.data.items.map(p => p.id);
          this.isFavorited.set(favorites.includes(this.product()!.id))
        },
        error: (err) => {
          console.error(err);
          this.isFavorited.set(false)
        }
      });
  }

  getStarCount(star: number): number {
    return this.reviews()?.items.filter(r => Math.round(r.rating) === star).length ?? 0;
  }

  getStarPercent(star: number): number {
      const total = this.reviews()?.totalCount ?? 0;
      if (total === 0) return 0;
      return (this.getStarCount(star) / total) * 100;
    }

  public showReviewModal = signal(false);
  public reviewModalMode = signal<'create' | 'edit'>('create');
  public selectedRating = signal(0);
  public showDeleteConfirm = signal(false);
  public reviewToDelete = signal<number | null>(null);
  public isReviewLoading = signal(false);
  public selectedReview = signal<number>(0)
  openReviewModal() {
    this.reviewModalMode.set('create');
    this.selectedRating.set(0);
    this.showReviewModal.set(true);
  }

  editReview(review: any) {
    this.reviewModalMode.set('edit');
    this.selectedRating.set(review.rating);
    this.selectedReview.set(review.id)
    this.showReviewModal.set(true);
  }

  submitReview() {
    if (this.selectedRating() === 0) return;
    this.isReviewLoading.set(true);

    const action = this.reviewModalMode() === 'create'
      ? this.reviewsService.postReview(this.product()!.id, this.selectedRating())
      : this.reviewsService.editReview(this.selectedReview(), this.selectedRating());

    action
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showReviewModal.set(false);
          this.isReviewLoading.set(false);
          this.fetchReviews(this.product()!.id);
        },
        error: (err) => {
          console.error(err);
          this.isReviewLoading.set(false);
        }
      });
  }

  deleteReview(id: number) {
    this.reviewToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    if (!this.reviewToDelete()) return;
    this.isReviewLoading.set(true);

    this.reviewsService.deleteReview(this.reviewToDelete()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showDeleteConfirm.set(false);
          this.reviewToDelete.set(null);
          this.isReviewLoading.set(false);
          this.fetchReviews(this.product()!.id);
        },
        error: (err) => {
          console.error(err);
          this.isReviewLoading.set(false);
        }
      });
  }

  public specsArray = computed(() => {
    const specs = this.product()?.specifications;
    if (!specs) return [];
    return Object.entries(specs).map(([key, value]) => ({ key, value }));
  });

  public userReview = computed(() =>
    this.reviews()?.items.find(r => r.user.id === this.userService.user()?.id) ?? null
  );

  public products = signal<ProductInterface[]>([]);
  public featuredProducts = computed(() => this.products().slice(0, 4));
  public isProductsLoading = signal(false);
  
  private fetchProducts(categoryId?: number): void {
    this.isProductsLoading.set(true);

    this.productService.getProductsLocal(1, 10, { categoryId: categoryId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.products.set(response.data.items.filter(p => p.id !== this.product()!.id));
          this.isProductsLoading.set(false);
          this.loadFavorites(); // 👈 load favorites after products are set
        },
        error: (err) => {
          console.error(err);
          this.isProductsLoading.set(false);
        }
      });
  }



  public favoritedIds = signal<number[]>([]);


  loadFavorites() {
  if (!localStorage.getItem('access_token')) return;
  
  this.favoritesService.getFavorites(100)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (res) => {
        const ids = res.data.items.map(p => p.id);
        this.favoritedIds.set(ids);
      }
    });
}
  

  ngOnInit() {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const id = Number(params['id']);
        this.selectedImageIndex = 0;
        this.quantity = 1;
        this.fetchProduct(id);
        if (this.isLoggedIn()) {
          this.userService.getUser()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.checkFavorite();
                this.fetchReviews(id);
                this.loadFavorites();
              },
              error: () => {
                this.fetchReviews(id); 
              }
            });
        } else {
          this.fetchReviews(id);
        }
      });
  }
}