import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ProductCard } from '../../product-card/product-card';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Product, ProductService } from '../../../../services/product-service';
import { Favorites } from '../../../../services/favorites';

@Component({
  selector: 'app-featured-products',
  imports: [ProductCard, RouterLink],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.scss',
})
export class FeaturedProducts implements OnInit{
  private productService = inject(ProductService);
  private destroyRef = inject(DestroyRef);
  public products = signal<Product[]>([]);
  public featuredProducts = computed(() => this.products().reverse().slice(0, 4));
  public isProductsLoading = signal(false);
  public error = signal<string | null>(null);
  
  private fetchProducts(page: number = 1): void {
    this.isProductsLoading.set(true);

    this.productService.getProductsLocal(page, 10, {categoryId: 8})
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response) => {
        this.products.set(response.data.items)
        this.isProductsLoading.set(false)
      },
      error: (err) => {
        this.error.set('Failed to load featured products. Please try again later.');
        console.error('[ProductService] Failed to fetch products:', err);
        this.isProductsLoading.set(false);
      }
    });
  }
  private favoritesService = inject(Favorites)
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
  ngOnInit(): void {
    this.fetchProducts(1)
    this.loadFavorites()
  }
}
