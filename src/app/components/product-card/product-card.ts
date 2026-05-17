import { Component, computed, inject, input, signal, DestroyRef, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../../services/product-service';
import { CommonModule } from '@angular/common';
import { Cart as CartService } from '../../../services/cart';
import { Favorites as FavoritesService } from '../../../services/favorites';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard implements OnInit {
  private router = inject(Router);
  private cartService = inject(CartService);
  private favoritesService = inject(FavoritesService);
  private destroyRef = inject(DestroyRef);

  public product = input.required<Product>();
  public IsNew = input<boolean>(false);
  public isSoldOut = computed(() => this.product().stock === 0);
  public isUpdating = signal(false);
  public isFavorited = signal(false);

  public stars = computed(() => {
    const rating = this.product().rating;
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  });

  private isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  addToCart() {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isUpdating.set(true);
    this.cartService.addToCart(this.product().id, 1)
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
      ? this.favoritesService.removeFavorite(this.product().id)
      : this.favoritesService.addFavorite(this.product().id);

    action
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isFavorited.set(!this.isFavorited()); // 👈 flip it locally
          this.isUpdating.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isUpdating.set(false);
        }
      });
  }
  ngOnInit() {
    this.isFavorited.set(this.product().isFavorite);
  }
}