import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Auth endpoints
  signup(data: { email: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, data);
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  // User endpoints
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me`, {
      headers: this.getHeaders(),
    });
  }

  updateProfile(data: {
    phoneNumber?: string;
    preferredGenres?: string[];
  }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/me`, data, {
      headers: this.getHeaders(),
    });
  }

  // Events endpoints
  getEvents(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/events`, { params });
  }

  getEventById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/${id}`);
  }

  createEvent(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, data, {
      headers: this.getHeaders(),
    });
  }
}

