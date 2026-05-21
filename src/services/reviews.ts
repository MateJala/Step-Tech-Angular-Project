import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment.development';
import { tap } from 'rxjs';

export interface reviewsData {
  items : {
    id:number,
    rating:number,
    createdAt : string,
    user: {
      id : number,
      email : string,
      lastName : string,
      firstName : string,
      details: {
        phoneNumber : string,
        address: string,
        dob : string,
        pictureUrl : string
      }
  }}[],
  currentPage : number,
  totalPages: number,
  totalCount:number,
  pageSize : number,
  hasMore : boolean
}

@Injectable({
  providedIn: 'root',
})
export class Reviews {
  private http = inject(HttpClient);
  private url = environment.baseUrl;
  private headerForGet = new HttpHeaders({
    'X-API-KEY': environment.apiKey,
    'Content-Type': 'application/json',
  });

  private _reviews = signal<reviewsData | null>(null)
  public reviews = this._reviews.asReadonly();
  public getReviews(id: number) {
      return this.http.get<{data: reviewsData, meta:[]}>(`${this.url}reviews/${id}`, { headers: this.headerForGet, params: {Take: 100, Page: 1}}).pipe(
        tap(response => {
          this._reviews.set(response.data);
        })
      );
    }

  public deleteReview(id: number) {
      const headers = new HttpHeaders({
        'X-API-KEY': environment.apiKey,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      });
      return this.http.delete<{}>(`${this.url}reviews/${id}`, { headers })
    }
  public postReview(productId:number,rate:number){
      const headers = new HttpHeaders({
        'X-API-KEY': environment.apiKey,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      }); 
      return this.http.post<{}>(`${this.url}reviews`, {productId, rate}, { headers })
    }
  public editReview(reviewId:number, rate:number){
    const headers = new HttpHeaders({
        'X-API-KEY': environment.apiKey,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      }); 
      return this.http.put<{}>(`${this.url}reviews`, {reviewId, rate}, { headers })
   }
}
