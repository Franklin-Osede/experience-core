import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-onboarding-fan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fan.html',
  styles: []
})
export class OnboardingFanComponent {
  selectedGenres = signal<string[]>(['Afro House']); 
  phoneNumber = signal<string>('');

  genres = [
    { name: 'Afro House', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMDQ2oWbuIOvXr69Cl5VB5FY5viqpY_T3xmlg3fX3DrHwy2T8RE3TYsL9SEbWISe6XYaXOp4QVF07eoF0jJckTj-RkDiK9u3i5DhUafB7-p1scSRPaUJ3i7y_DJbRVJ9LrkFKGevc3hCUi5hMOYf57-DigPbQV67Fmqy_hvf9XrahS76PaovipFkHMP9SlSEVLGUCTMcw0POtUSWfdPKXKzTOXW-ZoDzbhaIPLcVE7-s33YJqKjo3lD1VHdUedj5qu8tSsbCiDneXt' },
    { name: 'Latin House', image: 'https://images.unsplash.com/photo-1545128485-c400e77d27e1?q=80&w=2000&auto=format&fit=crop' },
    { name: 'Tech House', image: 'https://images.unsplash.com/photo-1574391884720-3850ea238830?q=80&w=2000&auto=format&fit=crop' },
    { name: 'Melodic Techno', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7iPe6FyPqH-m0glHeA0ARhj5pvup5OMhXUGV_W7u9c0DAZRAVnNtjXkkspKKMn3ljR8j_yr2Up4glDfolr2BsA4eHHBvH4QRcEuwCCTNd-G-5Mzt82Hpg_0ntFz8uShke1yLEw031UA8jeWOrVWa7HjC6cdlq-UOD2-h2V2GEFX4-OeiN0bWew1RB92qRXRcsBIA9jsydps3gmc4XoMSmXlkUWhQgH5E0bnqHirU_yNB-JPRd5NVt0aZLYP3DhLJcmsFVEfw8nbsT' },
    { name: 'Deep House', image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2000&auto=format&fit=crop' },
    { name: 'Minimal', image: 'https://images.unsplash.com/photo-1557672199-6e8c8b2b8fff?q=80&w=2000&auto=format&fit=crop' }
  ];

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

  isGenreSelected(genre: string): boolean {
    return this.selectedGenres().includes(genre);
  }

  onPhoneNumberChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.phoneNumber.set(input.value);
  }

  onContinue(): void {
    console.log('Fan Profile Saved:', {
      genres: this.selectedGenres(),
      phoneNumber: this.phoneNumber()
    });
    
    // Save preferences to customize Home
    localStorage.setItem('fanGenres', JSON.stringify(this.selectedGenres()));
    
    this.router.navigate(['/home']); 
  }
}
