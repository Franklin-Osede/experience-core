import { User } from './user.entity';
import { UserRole } from './user-role.enum';

// Mock uuid to avoid Jest ESM issues
jest.mock('uuid', () => ({
  v4: () => 'test-user-uuid',
}));

describe('User Entity - Hybrid Launch Model', () => {
  describe('Invite Credits Assignment', () => {
    it('should give DJs unlimited invites', () => {
      const dj = User.create({
        email: 'dj@test.com',
        password: 'password123',
        role: UserRole.DJ,
      });

      expect(dj.inviteCredits).toBe(Infinity);
      expect(dj.hasUnlockedInvites).toBe(true);
    });

    it('should give FOUNDER users 10 invites', () => {
      const founder = User.create({
        email: 'founder@test.com',
        password: 'password123',
        role: UserRole.FOUNDER,
      });

      expect(founder.inviteCredits).toBe(10);
      expect(founder.hasUnlockedInvites).toBe(true);
    });

    it('should give FANs 0 invites initially', () => {
      const fan = User.create({
        email: 'fan@test.com',
        password: 'password123',
        role: UserRole.FAN,
      });

      expect(fan.inviteCredits).toBe(0);
      expect(fan.hasUnlockedInvites).toBe(false);
      expect(fan.eventsAttended).toBe(0);
    });
  });

  describe('Invite Unlocking After First Event', () => {
    it('should unlock 3 invites for FANs after attending first event', () => {
      const fan = User.create({
        email: 'fan@test.com',
        password: 'password123',
        role: UserRole.FAN,
      });

      expect(fan.inviteCredits).toBe(0);

      fan.markEventAttended();

      expect(fan.eventsAttended).toBe(1);
      expect(fan.inviteCredits).toBe(3);
      expect(fan.hasUnlockedInvites).toBe(true);
    });

    it('should not give more invites on subsequent events', () => {
      const fan = User.create({
        email: 'fan@test.com',
        password: 'password123',
        role: UserRole.FAN,
      });

      fan.markEventAttended(); // First event: unlock 3
      expect(fan.inviteCredits).toBe(3);

      fan.markEventAttended(); // Second event: no change
      expect(fan.inviteCredits).toBe(3);
      expect(fan.eventsAttended).toBe(2);
    });
  });

  describe('Using Invites', () => {
    it('should allow DJs to use invites without limit', () => {
      const dj = User.create({
        email: 'dj@test.com',
        password: 'password123',
        role: UserRole.DJ,
      });

      dj.useInvite();
      dj.useInvite();
      dj.useInvite();

      expect(dj.inviteCredits).toBe(Infinity);
    });

    it('should decrease invite credits for FOUNDERs', () => {
      const founder = User.create({
        email: 'founder@test.com',
        password: 'password123',
        role: UserRole.FOUNDER,
      });

      expect(founder.inviteCredits).toBe(10);

      founder.useInvite();
      expect(founder.inviteCredits).toBe(9);

      founder.useInvite();
      expect(founder.inviteCredits).toBe(8);
    });

    it('should throw error when FAN tries to use invite before unlocking', () => {
      const fan = User.create({
        email: 'fan@test.com',
        password: 'password123',
        role: UserRole.FAN,
      });

      expect(() => fan.useInvite()).toThrow('No invite credits available');
    });

    it('should allow FAN to use invites after unlocking', () => {
      const fan = User.create({
        email: 'fan@test.com',
        password: 'password123',
        role: UserRole.FAN,
      });

      fan.markEventAttended(); // Unlock 3 invites
      expect(fan.inviteCredits).toBe(3);

      fan.useInvite();
      expect(fan.inviteCredits).toBe(2);

      fan.useInvite();
      expect(fan.inviteCredits).toBe(1);
    });
  });
});
