import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styles: []
})
export class UserProfileComponent implements OnInit {
  user = signal<any>(null);
  invites = signal<any>({ inviteCredits: 0 });
  isLoading = signal<boolean>(true);

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoading.set(true);
    // Load Profile
    this.apiService.getProfile().subscribe({
      next: (data) => {
        this.user.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.isLoading.set(false);
      }
    });

    // Load Invites
    this.apiService.getInvites().subscribe({
      next: (data) => {
        this.invites.set(data);
      },
      error: (err) => console.error(err)
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }
}
