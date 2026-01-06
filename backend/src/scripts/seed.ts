import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../config/data-source';
import { UserEntity } from '../modules/identity/infrastructure/typeorm/user.entity';
import { WalletEntity } from '../modules/finance/infrastructure/typeorm/wallet.entity';
import { UserRole } from '../modules/identity/domain/user-role.enum';

/**
 * Seed script to populate database with initial data for development
 * 
 * Usage:
 *   npm run seed
 *   or
 *   ts-node src/scripts/seed.ts
 */

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Initialize DataSource
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const userRepository = AppDataSource.getRepository(UserEntity);
    const walletRepository = AppDataSource.getRepository(WalletEntity);

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await walletRepository.delete({});
    await userRepository.delete({});
    console.log('✅ Existing data cleared');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create FOUNDER users (early adopters with 10 invites)
    const founders = [
      {
        email: 'founder1@experience-core.com',
        role: UserRole.FOUNDER,
        reputationScore: 100,
        isVerified: true,
      },
      {
        email: 'founder2@experience-core.com',
        role: UserRole.FOUNDER,
        reputationScore: 95,
        isVerified: true,
      },
    ];

    console.log('👥 Creating FOUNDER users...');
    const founderEntities = await Promise.all(
      founders.map(async (founder) => {
        const user = userRepository.create({
          id: uuidv4(),
          email: founder.email,
          password: hashedPassword,
          role: founder.role,
          reputationScore: founder.reputationScore,
          inviteCredits: -1, // Infinity mapped to -1
          isVerified: founder.isVerified,
          eventsAttended: 0,
          hasUnlockedInvites: true,
          outstandingDebtAmount: 0,
          outstandingDebtCurrency: 'EUR',
          isPhotoVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return await userRepository.save(user);
      }),
    );
    console.log(`✅ Created ${founderEntities.length} FOUNDER users`);

    // Create DJ users (unlimited invites)
    const djs = [
      {
        email: 'dj.valencia1@experience-core.com',
        reputationScore: 90,
        isVerified: true,
      },
      {
        email: 'dj.valencia2@experience-core.com',
        reputationScore: 85,
        isVerified: true,
      },
      {
        email: 'dj.valencia3@experience-core.com',
        reputationScore: 80,
        isVerified: false,
      },
    ];

    console.log('🎧 Creating DJ users...');
    const djEntities = await Promise.all(
      djs.map(async (dj) => {
        const user = userRepository.create({
          id: uuidv4(),
          email: dj.email,
          password: hashedPassword,
          role: UserRole.DJ,
          reputationScore: dj.reputationScore,
          inviteCredits: -1, // Infinity mapped to -1
          isVerified: dj.isVerified,
          eventsAttended: 0,
          hasUnlockedInvites: true,
          outstandingDebtAmount: 0,
          outstandingDebtCurrency: 'EUR',
          isPhotoVerified: dj.isVerified,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return await userRepository.save(user);
      }),
    );
    console.log(`✅ Created ${djEntities.length} DJ users`);

    // Create VENUE users
    const venues = [
      {
        email: 'venue.valencia1@experience-core.com',
        reputationScore: 88,
        isVerified: true,
      },
      {
        email: 'venue.valencia2@experience-core.com',
        reputationScore: 82,
        isVerified: true,
      },
    ];

    console.log('🏢 Creating VENUE users...');
    const venueEntities = await Promise.all(
      venues.map(async (venue) => {
        const user = userRepository.create({
          id: uuidv4(),
          email: venue.email,
          password: hashedPassword,
          role: UserRole.VENUE,
          reputationScore: venue.reputationScore,
          inviteCredits: 5, // Venues get some invites
          isVerified: venue.isVerified,
          eventsAttended: 0,
          hasUnlockedInvites: true,
          outstandingDebtAmount: 0,
          outstandingDebtCurrency: 'EUR',
          isPhotoVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return await userRepository.save(user);
      }),
    );
    console.log(`✅ Created ${venueEntities.length} VENUE users`);

    // Create PROVIDER users
    const providers = [
      {
        email: 'provider.valencia1@experience-core.com',
        reputationScore: 85,
        isVerified: true,
      },
      {
        email: 'provider.valencia2@experience-core.com',
        reputationScore: 80,
        isVerified: true,
      },
    ];

    console.log('🔧 Creating PROVIDER users...');
    const providerEntities = await Promise.all(
      providers.map(async (provider) => {
        const user = userRepository.create({
          id: uuidv4(),
          email: provider.email,
          password: hashedPassword,
          role: UserRole.PROVIDER,
          reputationScore: provider.reputationScore,
          inviteCredits: 0, // Providers don't need invites
          isVerified: provider.isVerified,
          eventsAttended: 0,
          hasUnlockedInvites: false,
          outstandingDebtAmount: 0,
          outstandingDebtCurrency: 'EUR',
          isPhotoVerified: provider.isVerified,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return await userRepository.save(user);
      }),
    );
    console.log(`✅ Created ${providerEntities.length} PROVIDER users`);

    // Create FAN users (0 invites initially, unlock after first event)
    const fans = [
      {
        email: 'fan1@experience-core.com',
        reputationScore: 50,
        isVerified: false,
      },
      {
        email: 'fan2@experience-core.com',
        reputationScore: 45,
        isVerified: false,
      },
      {
        email: 'fan3@experience-core.com',
        reputationScore: 40,
        isVerified: false,
      },
    ];

    console.log('🎉 Creating FAN users...');
    const fanEntities = await Promise.all(
      fans.map(async (fan) => {
        const user = userRepository.create({
          id: uuidv4(),
          email: fan.email,
          password: hashedPassword,
          role: UserRole.FAN,
          reputationScore: fan.reputationScore,
          inviteCredits: 0, // No invites initially
          isVerified: fan.isVerified,
          eventsAttended: 0,
          hasUnlockedInvites: false,
          outstandingDebtAmount: 0,
          outstandingDebtCurrency: 'EUR',
          isPhotoVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return await userRepository.save(user);
      }),
    );
    console.log(`✅ Created ${fanEntities.length} FAN users`);

    // Create ADMIN user
    console.log('👑 Creating ADMIN user...');
    const adminUser = userRepository.create({
      id: crypto.randomUUID(),
      email: 'admin@experience-core.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      reputationScore: 100,
      inviteCredits: -1, // Infinity
      isVerified: true,
      eventsAttended: 0,
      hasUnlockedInvites: true,
      outstandingDebtAmount: 0,
      outstandingDebtCurrency: 'EUR',
      isPhotoVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await userRepository.save(adminUser);
    console.log('✅ Created ADMIN user');

    // Create wallets for all users
    console.log('💰 Creating wallets for all users...');
    const allUsers = [
      ...founderEntities,
      ...djEntities,
      ...venueEntities,
      ...providerEntities,
      ...fanEntities,
      adminUser,
    ];

    await Promise.all(
      allUsers.map(async (user) => {
        const wallet = walletRepository.create({
          id: uuidv4(),
          userId: user.id,
          balanceAmount: 0,
          balanceCurrency: 'EUR',
          lockedBalanceAmount: 0,
          lockedBalanceCurrency: 'EUR',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return await walletRepository.save(wallet);
      }),
    );
    console.log(`✅ Created ${allUsers.length} wallets`);

    console.log('\n📊 Seed Summary:');
    console.log(`   - FOUNDER users: ${founderEntities.length}`);
    console.log(`   - DJ users: ${djEntities.length}`);
    console.log(`   - VENUE users: ${venueEntities.length}`);
    console.log(`   - PROVIDER users: ${providerEntities.length}`);
    console.log(`   - FAN users: ${fanEntities.length}`);
    console.log(`   - ADMIN users: 1`);
    console.log(`   - Total wallets: ${allUsers.length}`);
    console.log('\n🔑 Default password for all users: password123');
    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run seed if executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('✨ Seed script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed script failed:', error);
      process.exit(1);
    });
}

export { seed };

