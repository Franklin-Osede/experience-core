import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  authMode = signal<'login' | 'apply'>('login');
  email = signal<string>('');
  password = signal<string>('');
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  setAuthMode(mode: 'login' | 'apply'): void {
    this.authMode.set(mode);
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  onEmailChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.email.set(input.value);
  }

  onPasswordChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.password.set(input.value);
  }

  canSubmit(): boolean {
    return this.email().trim().length > 0 && 
           this.password().trim().length > 0;
  }

  onSubmit(): void {
    if (!this.canSubmit() || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    if (this.authMode() === 'login') {
      this.apiService.login({
        email: this.email(),
        password: this.password()
      }).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          // Guardar token si viene en la respuesta
          if (response.access_token) {
            localStorage.setItem('access_token', response.access_token);
          }
          this.isLoading.set(false);
          // Navegar a selección de rol o dashboard según el caso
          this.router.navigate(['/role-selection']);
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.isLoading.set(false);
          alert('Error al iniciar sesión. Por favor, verifica tus credenciales.');
        }
      });
    } else {
      // Modo "Apply" - registro
      this.apiService.signup({
        email: this.email(),
        password: this.password(),
        role: 'FAN' // Por defecto, luego pueden cambiar en role-selection
      }).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          if (response.access_token) {
            localStorage.setItem('access_token', response.access_token);
          }
          this.isLoading.set(false);
          this.router.navigate(['/role-selection']);
        },
        error: (error) => {
          console.error('Error en registro:', error);
          this.isLoading.set(false);
          alert('Error al registrarse. Por favor, intenta de nuevo.');
        }
      });
    }
  }

  onAppleLogin(): void {
    // TODO: Implementar login con Apple
    console.log('Apple login clicked');
  }

  onGoogleLogin(): void {
    // TODO: Implementar login con Google
    console.log('Google login clicked');
  }
}
