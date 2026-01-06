import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-onboarding',
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding {
  selectedGenres = signal<string[]>([]);
  phoneNumber = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  toggleGenre(genre: string): void {
    const current = this.selectedGenres();
    if (current.includes(genre)) {
      this.selectedGenres.set(current.filter(g => g !== genre));
    } else {
      this.selectedGenres.set([...current, genre]);
    }
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    
    if (value.length >= 6) {
      value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
    } else if (value.length >= 3) {
      value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
    }
    
    this.phoneNumber.set(value);
  }

  canSubmit(): boolean {
    return this.selectedGenres().length > 0 && 
           this.phoneNumber().replace(/\D/g, '').length >= 10;
  }

  onSubmit(): void {
    if (!this.canSubmit() || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    // Formatear teléfono para enviar (solo números con código de país)
    const cleanPhone = this.phoneNumber().replace(/\D/g, '');
    const formattedPhone = `+1${cleanPhone}`;

    const data = {
      phoneNumber: formattedPhone,
      preferredGenres: this.selectedGenres()
    };

    this.apiService.updateProfile(data).subscribe({
      next: (response) => {
        console.log('Perfil actualizado:', response);
        this.isLoading.set(false);
        // Navegar a siguiente pantalla (dashboard o home)
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        this.isLoading.set(false);
        // Aquí podrías mostrar un mensaje de error al usuario
        alert('Error al guardar. Por favor, intenta de nuevo.');
      }
    });
  }
}
