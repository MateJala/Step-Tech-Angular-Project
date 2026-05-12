import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ProductService } from '../../../../services/product-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product',
  imports: [],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class Product {
  private route = inject(ActivatedRoute)
  private productService = inject(ProductService)
  private destroyRef = inject(DestroyRef);

  public product = this.productService.productById;
  public isProductLoading = signal(false);
  public error = signal<string | null>(null);

  private fetchProduct(id: number): void {
    this.isProductLoading.set(true);

    this.productService.getProduct(id)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => this.isProductLoading.set(false),
      error: (err) => {
        this.error.set('Failed to load the product. Please try again later.')
        console.error('[ProductService] Failed to fetch product:', err);
        this.isProductLoading.set(false);
      }
    });
  }
  ngOnInit(){
    const id = Number(this.route.snapshot.paramMap.get('id'))
    this.fetchProduct(id)
  }
}
