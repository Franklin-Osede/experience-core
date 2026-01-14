import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { startRegistration } from '@simplewebauthn/browser';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.css']
})
export class SecuritySettingsComponent {
  message: string = '';
  isSuccess: boolean = false;

  constructor(private authService: AuthService) {}

  async registerPasskey() {
    try {
      this.message = 'Initializing registration...';
      const options = await this.authService.getRegistrationOptions().toPromise();
      
      const verificationResp = await startRegistration(options);
      
      const verificationJSON = await this.authService.verifyRegistration(verificationResp).toPromise();
      
      if (verificationJSON && verificationJSON.verified) {
        this.isSuccess = true;
        this.message = 'Passkey registered successfully!';
      } else {
        this.isSuccess = false;
        this.message = 'Registration failed.';
      }
    } catch (error) {
      this.isSuccess = false;
      this.message = 'Error during registration: ' + error;
      console.error(error);
    }
  }

  toggleBiometric(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.registerPasskey();
    }
  }
}
