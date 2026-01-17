import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-detail.html',
  styleUrls: ['./event-detail.css']
})
export class EventDetailComponent implements OnInit {
  event = signal<any>(null);
  isLoading = signal<boolean>(true);
  hasRsvp = signal<boolean>(false);
  userRole = signal<string>('');

  constructor(
    private apiService: ApiService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEvent(eventId);
      this.checkUserRole();
    }
  }

  checkUserRole() {
    // TODO: Get from auth service
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      try {
        const user = JSON.parse(profile);
        this.userRole.set(user.role || '');
      } catch (e) {
        console.error('Error parsing user profile');
      }
    }
  }

  loadEvent(id: string) {
    this.isLoading.set(true);
    this.apiService.getEventById(id).subscribe({
      next: (data) => {
        this.event.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading event:', err);
        this.isLoading.set(false);
      }
    });
  }

  onRsvp() {
    const eventId = this.event()?.id;
    if (!eventId) return;

    this.apiService.rsvpEvent(eventId).subscribe({
      next: () => {
        this.hasRsvp.set(true);
        alert('RSVP confirmado');
      },
      error: (err) => {
        console.error('Error RSVP:', err);
        alert('Error al confirmar RSVP');
      }
    });
  }

  onCancelRsvp() {
    const eventId = this.event()?.id;
    if (!eventId) return;

    this.apiService.cancelRsvp(eventId).subscribe({
      next: () => {
        this.hasRsvp.set(false);
        alert('RSVP cancelado');
      },
      error: (err) => {
        console.error('Error cancel RSVP:', err);
        alert('Error al cancelar RSVP');
      }
    });
  }

  onPublish() {
    const eventId = this.event()?.id;
    if (!eventId) return;

    this.apiService.publishEvent(eventId).subscribe({
      next: () => {
        alert('Evento publicado');
        this.loadEvent(eventId);
      },
      error: (err) => {
        console.error('Error publishing:', err);
        alert('Error al publicar evento');
      }
    });
  }

  onFund() {
    const eventId = this.event()?.id;
    if (!eventId) return;

    if (!confirm('¿Confirmar financiamiento del evento?')) return;

    this.apiService.fundEvent(eventId).subscribe({
      next: () => {
        alert('Evento financiado');
        this.loadEvent(eventId);
      },
      error: (err) => {
        console.error('Error funding:', err);
        alert('Error al financiar evento');
      }
    });
  }

  onComplete() {
    const eventId = this.event()?.id;
    if (!eventId) return;

    if (!confirm('¿Marcar evento como completado?')) return;

    this.apiService.completeEvent(eventId).subscribe({
      next: () => {
        alert('Evento completado');
        this.loadEvent(eventId);
      },
      error: (err) => {
        console.error('Error completing:', err);
        alert('Error al completar evento');
      }
    });
  }

  onCancel() {
    const eventId = this.event()?.id;
    if (!eventId) return;

    if (!confirm('¿Cancelar este evento?')) return;

    this.apiService.cancelEvent(eventId).subscribe({
      next: () => {
        alert('Evento cancelado');
        this.router.navigate(['/events']);
      },
      error: (err) => {
        console.error('Error canceling:', err);
        alert('Error al cancelar evento');
      }
    });
  }

  onViewRsvps() {
    const eventId = this.event()?.id;
    if (eventId) {
      this.router.navigate(['/events', eventId, 'rsvps']);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }

  canManageEvent(): boolean {
    const role = this.userRole();
    return role === 'DJ' || role === 'VENUE' || role === 'ADMIN';
  }

  isOrganizer(): boolean {
    // TODO: Check if current user is organizer
    return false;
  }
}
