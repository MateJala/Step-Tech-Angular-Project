import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment.development';
import { tap } from 'rxjs';

export interface Category {
  id: number,
  name: string,
  imageUrl: string,
  description: string,
  productCount: number,
  canDelete: boolean
}

export interface CategoryResponse {
  data: Category[],
  meta: {
    name: string,
    description: string,
    website: string,
    location: string,
    email: string
  }
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private url = environment.baseUrl;
  private headers = new HttpHeaders({
    'X-API-KEY': environment.apiKey,
    'Content-Type': 'application/json',
  });
  
  private _categories = signal<Category[]>([])
  public categories = this._categories.asReadonly();

  public getCategories() {
    return this.http.get<CategoryResponse>(`${this.url}categories`, { headers: this.headers }).pipe(
      tap(response => this._categories.set(response.data))
    );
  }
}
