import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment.development';

export interface Category {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  productCount: number;
  canDelete: boolean;
}

export interface Product {
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

export interface PaginatedResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasMore: boolean;
}

export interface FavoritesResponse {
  data: PaginatedResponse<Product>;
  meta: {};
}
  
@Injectable({
  providedIn: 'root',
})
export class Favorites {
  private http = inject(HttpClient);
  private url = environment.baseUrl;

  public getFavorites(take: number) {
    const headers = new HttpHeaders({
      'X-API-KEY': environment.apiKey,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    });

    return this.http.get<FavoritesResponse>(`${this.url}favorites`, {
      headers,
      params: { take, page: 1 }
    });
  }
}
