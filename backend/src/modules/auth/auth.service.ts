import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../identity/domain/user.repository';
// import * as bcrypt from 'bcrypt'; // Removed unused
import { User } from '../identity/domain/user.entity';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

const RP_ID = 'localhost';
const ORIGIN = 'http://localhost:4202';
const RP_NAME = 'Experience Core';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (user && (await user.validatePassword(pass))) {
      return user;
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async login(user: { email: string; id: string; role: string }) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // --- WebAuthn Registration ---

  async generateRegistrationOptions(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Isolate existing authenticators
    // excludeCredentials expects PublicKeyCredentialDescriptorJSON[]
    // { id: Base64URLString, type: 'public-key', ... }
    const userAuthenticators: any[] = user.authenticators.map((auth) => ({
      id: auth.credentialID,
      type: 'public-key',
      transports: auth.transports,
    }));

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      // Stable User ID is required so authenticator recognizes the user later.
      // We convert the UUID string to a Buffer compatible format.
      userID: isoBase64URL.toBuffer(isoBase64URL.fromUTF8String(user.email)),
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: userAuthenticators,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });

    // Save challenge to user
    user.setChallenge(options.challenge);
    await this.userRepository.save(user);

    return options;
  }

  async verifyRegistration(userId: string, body: any) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.currentChallenge) {
      throw new Error('User or challenge not found');
    }

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
      });
    } catch (error) {
      console.error(error);
      throw new Error('Verification failed');
    }

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;

      const newAuthenticator = {
        // credential.id is Base64URLString in v13
        credentialID: credential.id,
        // credential.publicKey is Uint8Array in v13, verifyRegistrationResponse returns Parsed structure?
        // Wait, registrationInfo.credential.publicKey is Uint8Array usually.
        // We need to store it as String for JSON DB.
        credentialPublicKey: isoBase64URL.fromBuffer(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports,
      };

      user.addAuthenticator(newAuthenticator);
      user.setChallenge(undefined); // Clear challenge
      await this.userRepository.save(user);

      return { verified: true };
    }

    throw new Error('Verification failed');
  }

  // --- WebAuthn Login ---

  async generateAuthenticationOptions(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const userAuthenticators: any[] = user.authenticators.map((auth) => ({
      id: auth.credentialID,
      type: 'public-key',
      transports: auth.transports,
    }));

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: userAuthenticators,
      userVerification: 'preferred',
    });

    user.setChallenge(options.challenge);
    await this.userRepository.save(user);

    return options;
  }

  async verifyAuthentication(email: string, body: any) {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.currentChallenge) {
      throw new Error('User or challenge not found');
    }

    const authenticator = user.authenticators.find(
      (auth) => auth.credentialID === body.id,
    );

    if (!authenticator) {
      throw new Error('Authenticator not registered');
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: authenticator.credentialID,
          publicKey: isoBase64URL.toBuffer(authenticator.credentialPublicKey),
          counter: authenticator.counter,
          transports: authenticator.transports,
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error('Verification failed');
    }

    if (verification.verified) {
      const { authenticationInfo } = verification;
      
      // Update counter
      authenticator.counter = authenticationInfo.newCounter;
      user.setChallenge(undefined);
      await this.userRepository.save(user);

      return this.login({
        email: user.email,
        id: user.id,
        role: user.role,
      });
    }

    throw new Error('Verification failed');
  }
}

