import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './events-list.html',
  styleUrls: ['./events-list.css']
})
export class EventsListComponent implements OnInit {
  events = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = signal<string>('');
  selectedType = signal<string>('ALL');
  selectedStatus = signal<string>('PUBLISHED');
  selectedGenre = signal<string>('ALL');
  
  eventTypes = ['ALL', 'HOUSE_DAY', 'CLUB_NIGHT', 'AFRO_SESSION', 'PRIVATE_LAB'];
  eventGenres = ['ALL', 'HOUSE', 'AFRO_HOUSE', 'DEEP_HOUSE', 'TECH_HOUSE', 'MELODIC_TECHNO', 'SALSA'];
  eventStatuses = ['ALL', 'DRAFT', 'PUBLISHED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  constructor(
    private apiService: ApiService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading.set(true);
    const params: any = {};
    
    if (this.selectedType() !== 'ALL') params.type = this.selectedType();
    if (this.selectedStatus() !== 'ALL') params.status = this.selectedStatus();
    if (this.selectedGenre() !== 'ALL') params.genre = this.selectedGenre();
    if (this.searchQuery().trim()) params.search = this.searchQuery().trim();

    this.apiService.getEvents(params).subscribe({
      next: (response) => {
        let events: any[] = [];
        if (Array.isArray(response)) {
          events = response;
        } else if (response?.data && Array.isArray(response.data)) {
          events = response.data;
        }
        this.events.set(events);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.events.set([]);
        this.isLoading.set(false);
      }
    });
  }

  onSearch() {
    this.loadEvents();
  }

  onFilterChange() {
    this.loadEvents();
  }

  onEventClick(eventId: string) {
    this.router.navigate(['/events', eventId]);
  }

  onCreateEvent() {
    this.router.navigate(['/events/create']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
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

  getStatusColor(status: string): string {
    const colors: any = {
      'DRAFT': 'bg-gray-500',
      'PUBLISHED': 'bg-blue-500',
      'CONFIRMED': 'bg-green-500',
      'COMPLETED': 'bg-purple-500',
      'CANCELLED': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  }
}
