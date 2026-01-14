import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-selection',
  imports: [CommonModule],
  templateUrl: './role-selection.html',
  styleUrl: './role-selection.css',
})
export class RoleSelection {
  selectedRole = signal<string | null>(this.getInitialRole());

  constructor(private router: Router) {}

  private getInitialRole(): string | null {
    return localStorage.getItem('selectedRole') || 'FAN';
  }

  selectRole(role: string): void {
    this.selectedRole.set(role);
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }

  onContinue(): void {
    const role = this.selectedRole();
    if (!role) {
      return;
    }

    // Guardar el rol seleccionado en localStorage
    localStorage.setItem('selectedRole', role);

    // Navegar al onboarding según el rol
    if (role === 'FAN') {
      this.router.navigate(['/onboarding']);
    } else if (role === 'DJ') {
      // TODO: Crear onboarding para DJ
      this.router.navigate(['/onboarding/dj']);
    } else if (role === 'VENUE') {
      // TODO: Crear onboarding para Venue
      this.router.navigate(['/onboarding/venue']);
    } else if (role === 'PROVIDER') {
      // TODO: Crear onboarding para Provider
      this.router.navigate(['/onboarding/provider']);
    }
  }
}
