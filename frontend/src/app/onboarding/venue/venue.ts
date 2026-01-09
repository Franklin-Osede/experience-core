import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-onboarding-venue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venue.html',
  styles: []
})
export class OnboardingVenueComponent {
  venueName = signal<string>('Casa Tulum');
  capacity = signal<number | null>(null);
  selectedType = signal<string>('Nightclub');
  location = signal<string>('');
  
  // Tech & Vibe
  selectedAmenities = signal<string[]>(['Funktion-One', 'VIP Tables']);
  amenities = [
    { id: 'funktion-one', label: 'Funktion-One', icon: 'speaker_group' },
    { id: 'dj-booth', label: 'DJ Booth', icon: 'podium' },
    { id: 'pro-lighting', label: 'Pro Lighting', icon: 'light_mode' },
    { id: 'vip-tables', label: 'VIP Tables', icon: 'table_bar' },
    { id: 'stage', label: 'Stage', icon: 'curtains' },
    { id: 'projector', label: 'Projector', icon: 'videocam' }
  ];

  // House Rules
  strictDressCode = signal<boolean>(true);
  dressCodeDetails = signal<string>('');
  membersOnly = signal<boolean>(false);

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/role-selection']);
  }

  isAmenitySelected(label: string): boolean {
    return this.selectedAmenities().includes(label);
  }

  toggleAmenity(label: string): void {
    const current = this.selectedAmenities();
    if (current.includes(label)) {
      this.selectedAmenities.set(current.filter(a => a !== label));
    } else {
      this.selectedAmenities.set([...current, label]);
    }
  }

  toggleStrictDressCode(): void {
    this.strictDressCode.set(!this.strictDressCode());
  }

  toggleMembersOnly(): void {
    this.membersOnly.set(!this.membersOnly());
  }

  onNext(): void {
    console.log('Venue Details Saved:', {
      name: this.venueName(),
      capacity: this.capacity(),
      type: this.selectedType(),
      location: this.location(),
      amenities: this.selectedAmenities(),
      rules: {
        strictDressCode: this.strictDressCode(),
        dressCodeDetails: this.dressCodeDetails(),
        membersOnly: this.membersOnly()
      }
    });
    // Todo: Navigate to next step (Upload Photos)
    // this.router.navigate(['/onboarding/venue/photos']); 
  }
}
