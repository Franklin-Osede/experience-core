import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';

interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  venue?: string;
  location?: string;
  price?: number;
  currency?: string;
  status: string;
  imageUrl?: string;
  eventType?: string;
  eventGenre?: string;
}

interface Tribe {
  id: string;
  name: string;
  imageUrl: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  featuredEvent = signal<Event | null>(null);
  weekendEvents = signal<Event[]>([]);
  upcomingHighlights = signal<Event[]>([]);
  tribes = signal<Tribe[]>([]);
  isLoading = signal<boolean>(true);

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // ... existing logic ...
    });

    this.loadEvents();
    this.loadTribes();

    // Personalize using saved preferences (Mock logic)
    const savedGenres = localStorage.getItem('fanGenres');
    if (savedGenres) {
      const genres = JSON.parse(savedGenres) as string[];
      if (genres.length > 0) {
        // Mock: If 'Techno' is selected, show Techno Tribe first
        if (genres.includes('Techno') || genres.includes('Melodic Techno')) {
          this.tribes.set([
             { id: '1', name: 'Techno', imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1', isActive: true },
             { id: '2', name: 'House', imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67', isActive: false },
             { id: '3', name: 'Rave', imageUrl: 'https://images.unsplash.com/photo-1571266028243-371695039989', isActive: false },
             // ...
          ]);
        }
      }
    }
  }

  loadEvents() {
    this.isLoading.set(true);
    
    // Cargar eventos destacados (PUBLISHED)
    this.apiService.getEvents({ 
      status: 'PUBLISHED',
      limit: 10 
    }).subscribe({
      next: (response) => {
        // El backend puede devolver { data: [...], total: ... } o directamente [...]
        let events: any[] = [];
        if (Array.isArray(response)) {
          events = response;
        } else if (response?.data && Array.isArray(response.data)) {
          events = response.data;
        } else if (response?.events && Array.isArray(response.events)) {
          events = response.events;
        }
        
        if (events.length > 0) {
          // Primer evento como featured
          this.featuredEvent.set(this.formatEvent(events[0]));
          
          // Próximos eventos para el fin de semana
          const weekend = events.slice(1, 3);
          this.weekendEvents.set(weekend.map(e => this.formatEvent(e)));
          
          // Highlights (eventos futuros)
          const highlights = events.slice(3, 4);
          this.upcomingHighlights.set(highlights.map(e => this.formatEvent(e)));
        } else {
          // Si no hay eventos, cargar datos mock
          this.loadMockData();
        }
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.isLoading.set(false);
        // Datos mock para desarrollo cuando hay error
        this.loadMockData();
      }
    });
  }

  loadTribes() {
    // Mock data para tribes - esto se puede conectar a un endpoint real más adelante
    this.tribes.set([
      {
        id: '1',
        name: 'Techno Purists',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLZHLjMHhg4ICChRVWkgqCB0AAnGM6TlcEzgbvIVaD3VtpZ0Xk7CaZfxVRySX_JUUYw6C4AggtMkUMdC6_-y78fiP4Zfuu5DAsHnQR6CR1Kn6GBivVAVQ-IV8fuyxFggHCPe29CLoE92XBZelJ_jivkoIaURYD2wtTlSb78aeLxOYMxDh3QYi_067xOIExU2W5IKazzfWddDGWAI1FMXhZBgnPa5ubWWUvnSAaCWODUkb0llid3I5D7S_s5sTkt2uQxp_hyPBMQJ_u',
        isActive: true
      },
      {
        id: '2',
        name: 'VIP Lounge',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4_00c9SQATwbg3e2nh7e13IfMGGfFXz_Q3Opl_zL04fyMgcObKRnynE-sm9af-rH6m6NnxVUOu3No1ULUO_NORHfG_LKCQQnjg_uLrzDKQbnoO9QU00x8t-b7QOsg5hLiXyJudx9CHroU2YnYQtTnDtmFLi_mFKCWYe_xwYa9zp9lQBPT2sZqkevN--EGGsyL_UYOWXYHKWzsLCzjQ57zwLhBqNzh5DnR0JTfbg32j3E4ckjaAGi9GFvwvl7O9K2DonglQlbK-tkA'
      },
      {
        id: '3',
        name: 'Jazz Collective',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJnAAMVO7ryD9i2luDgBr5IdP60Ky710N5AS0wLsaguF3yiwDUiZt2G5SgYYguw4uBYyRXdeVMfT8Igk5m04kzyIwTIlTmoKJe3G23GiTUwIJxuLh4yYRWR_fL8X4g6Pa0FzBA5ug3V98PKGCcp_zc795oK6T-bzqZqOZc94bnpn9fiUoRVinOLX_uCHWoV9WSUR85JaU6RGO7r5G3VSdhDdAz7HGyslpxP9H2_ZW4IoT3ukHyvLo-7rvVmBRo79832vvbFT0_9aKG'
      },
      {
        id: '4',
        name: 'House Heads',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAM97Xho2q4JXfufYCAWjb8pkCV5okmg3-Pu2qFhL12tWUpJ-25VKCSoFL4oaTD8lysHB1VjfMed44qbFJXPNR4TN_6GyJOhNI1WfrrsObTz2uR7_DJQ4WFK2n6Ycae-N4YHsfp0sp1i0ifWHymyCo6UTBOY1zN2aeHNSVWewNuj1zbDYes45cX0vzOBWZAvzmVshtJylHHdC61wysOO49XTMty3rwSd_3T4d5AXucAjZIZEYciSa03_y7GuYgOSs39Nhz8JJFi6oqv'
      }
    ]);
  }

  formatEvent(event: any): Event {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue?.name || event.venueName,
      location: event.location || event.venue?.location,
      price: event.price?.amount || event.priceAmount,
      currency: event.price?.currency || event.priceCurrency || 'USD',
      status: event.status,
      imageUrl: event.imageUrl || this.getDefaultEventImage(),
      eventType: event.eventType,
      eventGenre: event.eventGenre
    };
  }

  getDefaultEventImage(): string {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFiwnJVLI1boiOHqhZavcrsLAod9RqVnRumhYDM0RnpoVRpOlo2DhnJMjI2luc5-gNypqWnyZ-LVdY1C-ON-gSG0UA13do3Phll1mmmOvuDi_mCsXd_XDs4dy3V1Vnqxa40DOBWy7VXUTR03fEwAHb7_44RVWJx6EgCx9eVx8drNnZW0NbKr5opMK0cNFsOv2mThyRlxa0Jud6VEeMX8ZqX7kXYh9j9yaJYA5nqpDi7kVlfW6yCojmlvjyJJAypOaqj_fulyK1qceD';
  }

  loadMockData() {
    // Datos mock para desarrollo cuando no hay eventos en el backend
    this.featuredEvent.set({
      id: '1',
      title: 'Secret Warehouse Rave',
      startTime: new Date().toISOString(),
      venue: 'Industrial Zone',
      location: 'Industrial Zone',
      price: 0,
      currency: 'USD',
      status: 'PUBLISHED',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFiwnJVLI1boiOHqhZavcrsLAod9RqVnRumhYDM0RnpoVRpOlo2DhnJMjI2luc5-gNypqWnyZ-LVdY1C-ON-gSG0UA13do3Phll1mmmOvuDi_mCsXd_XDs4dy3V1Vnqxa40DOBWy7VXUTR03fEwAHb7_44RVWJx6EgCx9eVx8drNnZW0NbKr5opMK0cNFsOv2mThyRlxa0Jud6VEeMX8ZqX7kXYh9j9yaJYA5nqpDi7kVlfW6yCojmlvjyJJAypOaqj_fulyK1qceD'
    });

    this.weekendEvents.set([
      {
        id: '2',
        title: 'Skyline Noir: Jazz Night',
        startTime: new Date().toISOString(),
        venue: 'The Glass Penthouse',
        location: 'The Glass Penthouse',
        price: 45,
        currency: 'USD',
        status: 'PUBLISHED',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSTx9B2SY-NZqK0z7BrVAv5XO8mtySma-zJxIOlC3i2d-js-hbHvSA92AAknFgoI0QBpzQjOHdXEW8n026Gfaf5SQ-czxqt5s1uwy3AmVMkdM8yXLwB5i8L0yaPwItAwoj76YNKS4S09FQHaYwYimqeTHZvxCcuZZ0Hlc52MJdohWpXVEhJPQ3WhDDTIkrjhANi1Nb-Trc42hkChfwR2atdd3BngApA9lTmVLbxVhPLNUE-tWSBd6egEqBtcrSpfHXmIWcTKwIb8dp'
      },
      {
        id: '3',
        title: 'Neon Underground: 001',
        startTime: new Date().toISOString(),
        venue: 'Sub-Zero Basement',
        location: 'Sub-Zero Basement',
        price: 25,
        currency: 'USD',
        status: 'PUBLISHED',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR5JCv8cgdKz9bmmkXxpnzk3nq2hTuR7CEfqxW6ItBXQYLolNzZfOVyD-A0IRlck8qUuCEqWIBmTXZ6QJjzzD2q6fZ1w7cH0vQVu8eRztdG1RsT4eJR13Y1Fi8r5EV-mI5yajTTk7cxGBtNVma0sqc_dfsc-i1hfckh6cDMkU6WQAiRI5PMvVAJQm8LYnTn0YsIvuPYZ1Puch5YZsa7bTOjiTWoIok9cq7NdvuC4CYwdLRDxsVyhSa96EuVlx4FB9Rn0Ax4bi21JUw'
      }
    ]);

    this.upcomingHighlights.set([
      {
        id: '4',
        title: 'Solaris Music Festival',
        description: 'Early access tickets for the most anticipated electronic festival of the season drop this Friday at midnight.',
        startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PUBLISHED'
      }
    ]);
  }

  formatDate(dateString: string): { month: string; day: string } {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate().toString();
    return { month, day };
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }

  formatPrice(price: number | undefined, currency: string = 'USD'): string {
    if (!price) return 'Free';
    const symbol = currency === 'USD' ? '$' : currency;
    return `${symbol}${price}${price > 0 ? '+' : ''}`;
  }

  onBookAccess(eventId: string) {
    this.router.navigate(['/events', eventId]);
  }

  onEventClick(eventId: string) {
    this.router.navigate(['/events', eventId]);
  }

  onSearch() {
    // TODO: Implementar búsqueda
    console.log('Search clicked');
  }

  onNotifications() {
    // TODO: Implementar notificaciones
    console.log('Notifications clicked');
  }

  onTribeClick(tribeId: string) {
    // TODO: Implementar navegación a tribe
    console.log('Tribe clicked:', tribeId);
  }

  onSeeAllTribes() {
    // TODO: Implementar ver todos los tribes
    console.log('See all tribes');
  }

  onBookmark(eventId: string) {
    // TODO: Implementar guardar evento
    console.log('Bookmark event:', eventId);
  }

  onGetReminder(eventId: string) {
    // TODO: Implementar recordatorio
    console.log('Get reminder for event:', eventId);
  }

  navigateTo(path: string) {
    // Evitar navegación si ya estamos en esa ruta
    if (path === '/home' && this.router.url === '/home') {
      return;
    }
    this.router.navigate([path]);
  }
}
