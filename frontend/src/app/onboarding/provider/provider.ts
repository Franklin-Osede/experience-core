import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  rateType: string;
}

@Component({
  selector: 'app-onboarding-provider',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './provider.html',
  styles: []
})
export class OnboardingProviderComponent {
  // Existing Services
  services = signal<ServiceItem[]>([
    {
      id: '1',
      name: 'Sistema Funktion-One',
      category: 'Sonido',
      description: 'Stack completo para hasta 300 personas.',
      price: 1500,
      rateType: 'evento'
    },
    {
      id: '2',
      name: 'Ingeniero de Sonido',
      category: 'Personal',
      description: 'Soporte técnico y montaje in-situ.',
      price: 75,
      rateType: 'hora'
    }
  ]);

  // New Service Form
  newServiceName = signal<string>('');
  newServiceCategory = signal<string>('Iluminación');
  newServicePrice = signal<number | null>(null);
  newServiceRateType = signal<string>('Evento (Fijo)');

  // Availability & Terms
  openToTravel = signal<boolean>(true);
  insuranceIncluded = signal<boolean>(false);
  minBookingNotice = signal<string>('48 Horas');

  categories = ['Iluminación', 'Sistema de Sonido', 'Equipo DJ', 'Seguridad', 'Visuales / VJ', 'Personal'];
  rateTypes = ['Evento (Fijo)', 'Hora', 'Día', 'Persona'];
  noticeOptions = ['24 Horas', '48 Horas', '1 Semana'];

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/role-selection']);
  }

  toggleTravel(): void {
    this.openToTravel.set(!this.openToTravel());
  }

  toggleInsurance(): void {
    this.insuranceIncluded.set(!this.insuranceIncluded());
  }

  setNotice(notice: string): void {
    this.minBookingNotice.set(notice);
  }

  addService(): void {
    if (!this.newServiceName() || !this.newServicePrice()) return;

    const newService: ServiceItem = {
      id: Date.now().toString(),
      name: this.newServiceName(),
      category: this.newServiceCategory(),
      description: 'Nuevo servicio añadido',
      price: this.newServicePrice()!,
      rateType: this.newServiceRateType().toLowerCase().split(' ')[0]
    };

    this.services.set([...this.services(), newService]);
    
    // Reset form
    this.newServiceName.set('');
    this.newServicePrice.set(null);
  }

  onNext(): void {
    console.log('Provider Profile Saved:', {
      services: this.services(),
      terms: {
        openToTravel: this.openToTravel(),
        insuranceIncluded: this.insuranceIncluded(),
        minBookingNotice: this.minBookingNotice()
      }
    });
    // Navegar a Home después de completar onboarding
    this.router.navigate(['/home']); 
  }
}
