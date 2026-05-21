import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductCard } from '../../product-card/product-card';
import { Product, ProductService } from '../../../../services/product-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Favorites } from '../../../../services/favorites';

@Component({
  selector: 'app-new-arrivals',
  imports: [ProductCard],
  templateUrl: './new-arrivals.html',
  styleUrl: './new-arrivals.scss',
})
export class NewArrivals implements OnInit{
  public isNew = signal<boolean>(true);
  constructor(private router: Router){}
  SortNewset(){
    this.router.navigate(['/shop'], { queryParams: {sort: 'newest'} });
  }
  private productService = inject(ProductService);
    private destroyRef = inject(DestroyRef);
    public products = signal<Product[]>([]);
    public featuredProducts = computed(() => this.products().reverse().slice(0, 4));
    public isProductsLoading = signal(false);
    public error = signal<string | null>(null);
    
    private fetchProducts(page: number = 1): void {
      this.isProductsLoading.set(true);
  
      this.productService.getProductsLocal(page, 10, {categoryId: 7})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.products.set(response.data.items)
          this.isProductsLoading.set(false)
        },
        error: (err) => {
          this.error.set('Failed to load new arrivals. Please try again later.');
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
