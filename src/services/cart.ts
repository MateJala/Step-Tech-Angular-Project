import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment.development';
import { Category } from './favorites';
import { HttpClient, HttpHeaders } from '@angular/common/http'

export interface CartProduct {
  id: number;
  stock: number;
  name: string;
  brand: string;
  model: string;
  price: number;
  imageUrl: string;
  isFavorite: boolean;
  rating: number;
  createdAt: string;
  canDelete: boolean;
  category: Category;
}

export interface CartItem {
  id: number;
  quantity: number;
  price: number;
  totalPrice: number;
  product: CartProduct;
}

export interface CartResponse {
  data: PaginatedResponse<CartItem>;
  meta: {};
}

export interface PaginatedResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Cart {
  private http = inject(HttpClient);
  private url = environment.baseUrl;

  public getCart(take: number) {
    const headers = new HttpHeaders({
      'X-API-KEY': environment.apiKey,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    });

    return this.http.get<CartResponse>(`${this.url}cart`, {
      headers,
      params: { take, page: 1 }
    });
  }
  public addToCart(productId: number, quantity: number) {
    const headers = new HttpHeaders({
      'X-API-KEY': environment.apiKey,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    });

    return this.http.post(`${this.url}cart/add-to-cart`, { productId, quantity }, { headers });
  }

  public removeFromCart(itemId: number) {
    const headers = new HttpHeaders({
      'X-API-KEY': environment.apiKey,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    });

    return this.http.delete(`${this.url}cart/remove-from-cart/${itemId}`, { headers });
  }

  public editQuantity(itemId: number, quantity: number) {
    const headers = new HttpHeaders({
      'X-API-KEY': environment.apiKey,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    });

    return this.http.put(`${this.url}cart/edit-quantity`, { itemId, quantity }, { headers });
  }
}