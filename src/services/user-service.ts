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
  public updateUser(body: {
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string| null,
    address: string | null,
    pictureUrl: string | null,
    dateOfBirth: string | null
  }) {
    const headers = new HttpHeaders({
      'X-API-KEY': environment.apiKey,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    });

    return this.http.put(`${this.url}users`, body, { headers });
  }

  public changePassword(body: {
    currentPassword: string;
    newPassword: string;
  }) {
    const headers = new HttpHeaders({
      'X-API-KEY': environment.apiKey,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    });

    return this.http.put(`${this.url}users/change-password`, body, { headers });
  }

  public deleteProfile() {
    const headers = new HttpHeaders({
      'X-API-KEY': environment.apiKey,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    });

    return this.http.delete(`${this.url}users/delete-profile`, { headers });
  }
  
  public checkout() {
  const headers = new HttpHeaders({
    'X-API-KEY': environment.apiKey,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  });

  return this.http.post(`${this.url}users/checkout`, {}, { headers });
}
}
