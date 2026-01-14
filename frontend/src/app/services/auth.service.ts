import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl; // e.g. http://localhost:5555/api

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

  // --- WebAuthn Registration ---

  getRegistrationOptions(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/webauthn/register/options`, {}, {
      headers: this.getHeaders()
    });
  }

  verifyRegistration(response: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/webauthn/register/verify`, response, {
      headers: this.getHeaders()
    });
  }

  // --- WebAuthn Login ---

  getLoginOptions(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/webauthn/login/options`, { email });
  }

  verifyLogin(response: any): Observable<any> {
    // response from startAuthentication contains 'id', 'rawId', 'response', etc.
    // Backend needs email to find user + the credential response.
    // The browser response doesn't contain email, so we must merge it.
    // However, verifyAuthentication(body) in backend expects { ...response, email }.
    // Or we pass email in body alongside.
    return this.http.post(`${this.apiUrl}/auth/webauthn/login/verify`, response, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }).pipe(
      map((res: any) => {
        if (res.access_token) {
           localStorage.setItem('access_token', res.access_token);
        }
        return res;
      })
    );
  }
}
