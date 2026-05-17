import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Cart as CartService, CartItem, PaginatedResponse } from '../../../../services/cart';
import { UserService } from '../../../../services/user-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private cartService = inject(CartService);
  private destroyRef = inject(DestroyRef);

  public cart = signal<PaginatedResponse<CartItem> | null>(null);
  public isLoading = signal(false);
  public isUpdating = signal(false);

  public cartTotal = computed(() =>
    this.cart()?.items.reduce((sum, item) => sum + item.totalPrice, 0) ?? 0
  );
  public cartCount = computed(() =>
    this.cart()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  );

  ngOnInit() {
    this.loadCart();
  }

  private loadCart() {
    this.isLoading.set(true);
    this.cartService.getCart(10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.cart.set(res.data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  editQuantity(itemId: number, currentQuantity: number, change: number) {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    this.isUpdating.set(true);
    this.cartService.editQuantity(itemId, newQuantity)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadCart();
          this.isUpdating.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isUpdating.set(false);
        }
      });
  }

  removeItem(itemId: number) {
    this.isUpdating.set(true);
    this.cartService.removeFromCart(itemId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadCart();
          this.isUpdating.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isUpdating.set(false);
        }
      });
  }

  clearCart() {
    const items = this.cart()?.items ?? [];
    if (items.length === 0) return;

    this.isUpdating.set(true);
    let completed = 0;
    for (const item of items) {
      this.cartService.removeFromCart(item.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            completed++;
            if (completed === items.length) {
              this.loadCart();
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

  private userService = inject(UserService);

  checkout() {
    this.userService.checkout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadCart();
          Swal.fire({
            icon: 'success',
            title: 'Order Placed!',
            text: 'Your order has been placed successfully.',
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Checkout Failed',
            text: err.error?.message || 'Something went wrong. Please try again.',
          });
        }
      });
  }
}