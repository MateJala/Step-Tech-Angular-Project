import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Favorites as FavoritesService, Product, PaginatedResponse } from '../../../../services/favorites';
import { Cart as CartService } from '../../../../services/cart';

@Component({
  selector: 'app-favorites',
  imports: [RouterLink, CommonModule],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss',
})
export class Favorites {
  private favoritesService = inject(FavoritesService);
  private cartService = inject(CartService);
  private destroyRef = inject(DestroyRef);

  public favorites = signal<PaginatedResponse<Product> | null>(null);
  public isLoading = signal(false);
  public isUpdating = signal(false);
  private currentTake = 10;

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.isLoading.set(true);
    this.favoritesService.getFavorites(this.currentTake)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.favorites.set(res.data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
        }
      });
  }

  showMore() {
    this.currentTake += 10;
    this.loadFavorites();
  }

  removeFavorite(productId: number) {
    this.isUpdating.set(true);
    this.favoritesService.removeFavorite(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadFavorites();
          this.isUpdating.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isUpdating.set(false);
        }
      });
  }

  clearAll() {
    const items = this.favorites()?.items ?? [];
    if (items.length === 0) return;

    this.isUpdating.set(true);
    let completed = 0;
    for (const product of items) {
      this.favoritesService.removeFavorite(product.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            completed++;
            if (completed === items.length) {
              this.loadFavorites();
              this.isUpdating.set(false);
            }
          },
          error: (err) => {
            console.error(err);
            this.isUpdating.set(false);
          }
        });
    }
  }

  addToCart(productId: number) {
    this.isUpdating.set(true);
    this.cartService.addToCart(productId, 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isUpdating.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isUpdating.set(false);
        }
      });
  }
}