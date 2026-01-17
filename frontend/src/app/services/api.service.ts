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

  getInvites(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me/invites`, {
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

  rsvpEvent(eventId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${eventId}/rsvp`, {}, {
      headers: this.getHeaders(),
    });
  }

  cancelRsvp(eventId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${eventId}/rsvp`, {
      headers: this.getHeaders(),
    });
  }

  publishEvent(eventId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/events/${eventId}/publish`, {}, {
      headers: this.getHeaders(),
    });
  }

  fundEvent(eventId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${eventId}/fund`, {}, {
      headers: this.getHeaders(),
    });
  }

  completeEvent(eventId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${eventId}/complete`, {}, {
      headers: this.getHeaders(),
    });
  }

  cancelEvent(eventId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${eventId}/cancel`, {}, {
      headers: this.getHeaders(),
    });
  }

  getEventRsvps(eventId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/${eventId}/rsvps`, {
      headers: this.getHeaders(),
    });
  }

  checkInEvent(eventId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${eventId}/check-in`, {}, {
      headers: this.getHeaders(),
    });
  }

  // Gig Market endpoints
  getVenueAvailabilities(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/gigs/venues/availability`, { params });
  }

  postVenueAvailability(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/gigs/venues/availability`, data, {
      headers: this.getHeaders(),
    });
  }

  applyToGig(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/gigs/apply`, data, {
      headers: this.getHeaders(),
    });
  }

  getGigApplications(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/gigs/applications`, {
      params,
      headers: this.getHeaders(),
    });
  }

  acceptGigApplication(applicationId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/gigs/applications/${applicationId}/accept`, data, {
      headers: this.getHeaders(),
    });
  }

  // Provider Marketplace endpoints
  getServiceListings(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/providers/listings`, { params });
  }

  getServiceListing(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/providers/listings/${id}`);
  }

  createServiceListing(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/providers/listings`, data, {
      headers: this.getHeaders(),
    });
  }

  updateServiceListing(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/providers/listings/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  bookService(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/providers/bookings`, data, {
      headers: this.getHeaders(),
    });
  }

  getBookings(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/providers/bookings`, {
      params,
      headers: this.getHeaders(),
    });
  }

  acceptBooking(bookingId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/providers/bookings/${bookingId}/accept`, {}, {
      headers: this.getHeaders(),
    });
  }

  rejectBooking(bookingId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/providers/bookings/${bookingId}/reject`, {}, {
      headers: this.getHeaders(),
    });
  }

  // Finance endpoints
  getWallet(): Observable<any> {
    return this.http.get(`${this.apiUrl}/finance/wallet`, {
      headers: this.getHeaders(),
    });
  }

  depositWallet(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/finance/wallet/deposit`, data, {
      headers: this.getHeaders(),
    });
  }

  createSplitPayment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/finance/split-payments`, data, {
      headers: this.getHeaders(),
    });
  }

  paySplitShare(splitPaymentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/finance/split-payments/${splitPaymentId}/pay`, {}, {
      headers: this.getHeaders(),
    });
  }

  // User endpoints adicionales
  inviteUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/invite`, data, {
      headers: this.getHeaders(),
    });
  }
}

