import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment.development';
import { Category } from './categoryService';
import { tap } from 'rxjs';

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

export interface ProductListResponse {
  data: {
    items: Product[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasMore: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private url = environment.baseUrl;
  private headers = new HttpHeaders({
    'X-API-KEY': environment.apiKey,
    'Content-Type': 'application/json',
  });

  private _products = signal<Product[]>([]);
  private _currentPage = signal<number>(1);
  private _totalPages = signal<number>(1);
  private _hasMore = signal<boolean>(false);
  private _totalProductsCount = signal<number>(0)

  public products = this._products.asReadonly();
  public currentPage = this._currentPage.asReadonly();
  public totalPages = this._totalPages.asReadonly();
  public hasMore = this._hasMore.asReadonly();
  public totalProductsCount = this._totalProductsCount.asReadonly()

  public getProducts(page: number, take: number, filters?: {
    search?: string | null;
    brand?: string | null;
    inStock?: boolean | null;
    sortBy?: string | null;
    categoryId?: number | null;
    minRating?: number | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    sortDescending?: boolean | null;
  }) {
    let params = new HttpParams()
      .set('Page', page)
      .set('Take', take);

    if (filters?.search)        params = params.set('Search', filters.search);
    if (filters?.brand)         params = params.set('Brand', filters.brand);
    if (filters?.inStock != null) params = params.set('InStock', filters.inStock);
    if (filters?.sortBy)        params = params.set('SortBy', filters.sortBy);
    if (filters?.categoryId)    params = params.set('CategoryId', filters.categoryId);
    if (filters?.minRating)     params = params.set('MinRating', filters.minRating);
    if (filters?.minPrice)      params = params.set('MinPrice', filters.minPrice);
    if (filters?.maxPrice)      params = params.set('MaxPrice', filters.maxPrice);
    if (filters?.sortDescending != null) params = params.set('SortDescending', filters.sortDescending);

    return this.http.get<ProductListResponse>(`${this.url}products/filter`, { headers: this.headers, params }).pipe(
      tap(response => {
        this._products.set(response.data.items);
        this._currentPage.set(response.data.currentPage);
        this._totalPages.set(response.data.totalPages);
        this._hasMore.set(response.data.hasMore);
        this._totalProductsCount.set(response.data.totalCount);
      })
    );
  }
  public getProductsLocal(page: number, take: number, filters?: {
    search?: string | null;
    brand?: string | null;
    inStock?: boolean | null;
    sortBy?: string | null;
    categoryId?: number | null;
    minRating?: number | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    sortDescending?: boolean | null;
  }) {
    let params = new HttpParams()
      .set('Page', page)
      .set('Take', take);

    if (filters?.search)        params = params.set('Search', filters.search);
    if (filters?.brand)         params = params.set('Brand', filters.brand);
    if (filters?.inStock != null) params = params.set('InStock', filters.inStock);
    if (filters?.sortBy)        params = params.set('SortBy', filters.sortBy);
    if (filters?.categoryId)    params = params.set('CategoryId', filters.categoryId);
    if (filters?.minRating)     params = params.set('MinRating', filters.minRating);
    if (filters?.minPrice)      params = params.set('MinPrice', filters.minPrice);
    if (filters?.maxPrice)      params = params.set('MaxPrice', filters.maxPrice);
    if (filters?.sortDescending != null) params = params.set('SortDescending', filters.sortDescending);

    return this.http.get<ProductListResponse>(`${this.url}products/filter`, { headers: this.headers, params });
  }
}
