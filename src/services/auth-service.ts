import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment.development';

export interface registerBody {
  firstName: string,
  lastName: string,
  email: string,
  password: string
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private url = environment.baseUrl;
  private headers = new HttpHeaders({
    'X-API-KEY': environment.apiKey,
    'Content-Type': 'application/json',
  });

  public Register(info : registerBody){
    return this.http.post<void>(`${this.url}auth/register`, info, { headers: this.headers})
  }
  public VerifyEmail(email: string, code: string) {
    return this.http.put<void>(`${this.url}auth/verify-email`, {email, code}, {headers: this.headers})
  }
  public ResendEmailVerification(email: string) {
    return this.http.post<void>(`${this.url}auth/resend-email-verification/${email}`, {}, {headers: this.headers})
  }
  public Login(email: string, password: string){
    return this.http.post<{ data: { accessToken: string, refreshToken: string } }>(`${this.url}auth/login`, {email, password}, {headers: this.headers})
  }
  public ForgotPassword(email:string){
    return this.http.post<void>(`${this.url}auth/forget-password/${email}`, {}, {headers: this.headers})
  }
}
