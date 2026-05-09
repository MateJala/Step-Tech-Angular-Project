import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../services/product-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  public product = input.required<Product>();
  public IsNew = input<boolean>(false);
  public isSoldOut = computed(() => this.product().stock === 0);
  public stars = computed(() => {
    const rating = this.product().rating;
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  });
}
