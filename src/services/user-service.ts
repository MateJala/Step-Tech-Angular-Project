import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../environments/environment.development';
import { tap } from 'rxjs';

export interface User {
  id: number,
  email: string,
  role: string,
  lastName: string,
  firstName: string,
  details: {
    phoneNumber: string | null,
    address: string | null,
    dob: string | null,
    pictureUrl: string | null
  }
}

export interface response {
  data: User,
  meta: {}
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private url = environment.baseUrl;
  private headers = new HttpHeaders({
    'X-API-KEY': environment.apiKey,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  });

  private _user = signal<User | null>(null)
  public user = this._user.asReadonly();

  public getUser() {
    return this.http.get<response>(`${this.url}users/me`, { headers: this.headers }).pipe(
      tap(response => {
        this._user.set(response.data);
      }))
    }
}
