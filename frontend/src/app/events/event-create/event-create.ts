import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-create.html',
  styleUrls: ['./event-create.css']
})
export class EventCreateComponent {
  title = signal<string>('');
  description = signal<string>('');
  type = signal<string>('HOUSE_DAY');
  genre = signal<string>('HOUSE');
  startTime = signal<string>('');
  endTime = signal<string>('');
  location = signal<string>('');
  venueId = signal<string>('');
  maxCapacity = signal<number | null>(null);
  isLoading = signal<boolean>(false);

  eventTypes = ['HOUSE_DAY', 'CLUB_NIGHT', 'AFRO_SESSION', 'PRIVATE_LAB'];
  eventGenres = ['HOUSE', 'AFRO_HOUSE', 'DEEP_HOUSE', 'TECH_HOUSE', 'MELODIC_TECHNO', 'SALSA'];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.title() || !this.description() || !this.startTime() || !this.endTime() || !this.location()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    this.isLoading.set(true);
    const eventData = {
      title: this.title(),
      description: this.description(),
      type: this.type(),
      genre: this.genre(),
      startTime: new Date(this.startTime()).toISOString(),
      endTime: new Date(this.endTime()).toISOString(),
      location: this.location(),
      venueId: this.venueId() || undefined,
      maxCapacity: this.maxCapacity() || undefined
    };

    this.apiService.createEvent(eventData).subscribe({
      next: (response) => {
        alert('Evento creado exitosamente');
        this.router.navigate(['/events', response.id]);
      },
      error: (err) => {
        console.error('Error creating event:', err);
        alert('Error al crear evento');
        this.isLoading.set(false);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/events']);
  }
}
