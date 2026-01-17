import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

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
    private authService: AuthService,
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
    // Desarrollo: Permitir continuar sin ingresar datos
    return true; 
    /* return this.email().trim().length > 0 && 
           this.password().trim().length > 0; */
  }

  onSubmit(): void {
    if (!this.canSubmit() || this.isLoading()) {
      return;
    }

    // TODO: Implementar funcionalidad cuando todas las pantallas estén creadas
    // Por ahora, solo navegar a role-selection para probar el flujo
    console.log('Login/Apply clicked:', {
      mode: this.authMode(),
      email: this.email(),
      password: this.password()
    });
    
    // Navegación temporal para probar el flujo
    // Si ya tiene rol seleccionado, ir directo a home, sino a role-selection
    // Navigation logic updated for dev testing: Always go to role-selection
    this.router.navigate(['/role-selection']);

    /* Código comentado - se implementará después de crear todas las pantallas
    this.isLoading.set(true);

    if (this.authMode() === 'login') {
      this.apiService.login({
        email: this.email(),
        password: this.password()
      }).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          if (response.access_token) {
            localStorage.setItem('access_token', response.access_token);
          }
          this.isLoading.set(false);
          // Si ya tiene rol seleccionado, ir directo a home, sino a role-selection
          const selectedRole = localStorage.getItem('selectedRole');
          if (selectedRole) {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/role-selection']);
          }
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.isLoading.set(false);
          alert('Error al iniciar sesión. Por favor, verifica tus credenciales.');
        }
      });
    } else {
      this.apiService.signup({
        email: this.email(),
        password: this.password(),
        role: 'FAN'
      }).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          if (response.access_token) {
            localStorage.setItem('access_token', response.access_token);
          }
          this.isLoading.set(false);
          // Si ya tiene rol seleccionado, ir directo a home, sino a role-selection
          const selectedRole = localStorage.getItem('selectedRole');
          if (selectedRole) {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/role-selection']);
          }
        },
        error: (error) => {
          console.error('Error en registro:', error);
          this.isLoading.set(false);
          alert('Error al registrarse. Por favor, intenta de nuevo.');
        }
      });
    }
    */
  }

  onAppleLogin(): void {
    // TODO: Implementar login con Apple
    console.log('Apple login clicked');
  }

  onGoogleLogin(): void {
    // TODO: Implementar login con Google
    console.log('Google login clicked');
  }

  async onBiometricLogin() {
    if (!this.email()) {
      alert('Please enter your email to login with Passkey');
      return;
    }
    
    try {
      this.isLoading.set(true);
      // Dynamic import to avoid SSR issues if any, though not strict here
      const { startAuthentication } = await import('@simplewebauthn/browser');
      
      const options = await this.authService.getLoginOptions(this.email()).toPromise();
      const authResp = await startAuthentication(options);
      
      const verificationResp = await this.authService.verifyLogin(authResp).toPromise();
      
      if (verificationResp && (verificationResp.verified || verificationResp.access_token)) {
        console.log('Biometric login success');
         // If token is handled in service map, good. Otherwise set here if needed.
        if(verificationResp.access_token) {
            localStorage.setItem('access_token', verificationResp.access_token);
        }
        // Si ya tiene rol seleccionado, ir directo a home, sino a role-selection
        const selectedRole = localStorage.getItem('selectedRole');
        if (selectedRole) {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/role-selection']);
        }
      } else {
        alert('Biometric login failed');
      }
    } catch (error) {
      console.error(error);
      alert('Authentication failed or cancelled');
    } finally {
      this.isLoading.set(false);
    }
  }
}
