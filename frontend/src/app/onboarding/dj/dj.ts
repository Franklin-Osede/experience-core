import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-onboarding-dj',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dj.html',
  styles: []
})
export class OnboardingDjComponent {
  selectedGenres = signal<string[]>(['Afro House']); // Afro House by default
  selectedEquipment = signal<string>('USB (CDJs)'); // USB by default
  selectedVibe = signal<string[]>(['Peak Time']); // Peak Time by default

  genres = ['House', 'Afro House', 'Deep House', 'Tech House', 'Melodic Techno'];
  equipmentOptions = [
    { label: 'USB (CDJs)', value: 'USB (CDJs)' },
    { label: 'Vinyl', value: 'Vinyl' },
    { label: 'Controller (Laptop)', value: 'Controller (Laptop)' },
    { label: 'Hybrid Setup', value: 'Hybrid Setup' }
  ];
  vibeOptions = ['Warm-up Set', 'Peak Time'];

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/role-selection']);
  }

  toggleGenre(genre: string): void {
    const current = this.selectedGenres();
    if (current.includes(genre)) {
      this.selectedGenres.set(current.filter(g => g !== genre));
    } else {
      this.selectedGenres.set([...current, genre]);
    }
  }

  selectEquipment(equipment: string): void {
    this.selectedEquipment.set(equipment);
  }
  
  toggleVibe(vibe: string): void {
     const current = this.selectedVibe();
    if (current.includes(vibe)) {
      this.selectedVibe.set(current.filter(v => v !== vibe));
    } else {
      this.selectedVibe.set([...current, vibe]);
    }
  }

  isGenreSelected(genre: string): boolean {
    return this.selectedGenres().includes(genre);
  }

  isVibeSelected(vibe: string): boolean {
    return this.selectedVibe().includes(vibe);
  }

  onContinue(): void {
    console.log('DJ Profile Saved:', {
      genres: this.selectedGenres(),
      equipment: this.selectedEquipment(),
      vibe: this.selectedVibe()
    });
    // Navegar a Home después de completar onboarding
    this.router.navigate(['/home']); 
  }
}
