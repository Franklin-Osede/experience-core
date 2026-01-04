import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM types
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM('FAN', 'DJ', 'FOUNDER', 'VENUE', 'ADMIN');
    `);

    await queryRunner.query(`
      CREATE TYPE "event_type_enum" AS ENUM('HOUSE_DAY', 'CLUB_NIGHT', 'AFRO_SESSION', 'PRIVATE_LAB');
    `);

    await queryRunner.query(`
      CREATE TYPE "event_genre_enum" AS ENUM('HOUSE', 'TECHNO', 'SALSA', 'BACHATA', 'KIZOMBA', 'REGGAETON', 'HIP_HOP', 'RNB', 'OPEN_FORMAT', 'LIVE_MUSIC');
    `);

    await queryRunner.query(`
      CREATE TYPE "event_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
    `);

    await queryRunner.query(`
      CREATE TYPE "attendee_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'ATTENDED', 'NO_SHOW', 'CANCELLED', 'EXCUSED');
    `);

    await queryRunner.query(`
      CREATE TYPE "availability_status_enum" AS ENUM('OPEN', 'NEGOTIATING', 'BOOKED');
    `);

    await queryRunner.query(`
      CREATE TYPE "gig_application_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');
    `);

    await queryRunner.query(`
      CREATE TYPE "transaction_type_enum" AS ENUM('DEPOSIT', 'WITHDRAWAL', 'LOCK', 'RELEASE', 'SPLIT_PAYMENT');
    `);

    await queryRunner.query(`
      CREATE TYPE "split_payment_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED');
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL,
        "email" varchar(255) NOT NULL,
        "password" varchar(255) NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'FAN',
        "isVerified" boolean NOT NULL DEFAULT false,
        "reputationScore" integer NOT NULL DEFAULT 0,
        "inviteCredits" integer NOT NULL DEFAULT 0,
        "eventsAttended" integer NOT NULL DEFAULT 0,
        "hasUnlockedInvites" boolean NOT NULL DEFAULT false,
        "outstandingDebtAmount" bigint NOT NULL DEFAULT 0,
        "outstandingDebtCurrency" varchar(3) NOT NULL DEFAULT 'EUR',
        "profilePhotoUrl" varchar(500),
        "isPhotoVerified" boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "CHK_users_reputationScore" CHECK ("reputationScore" >= 0),
        CONSTRAINT "CHK_users_inviteCredits" CHECK ("inviteCredits" >= 0 OR "inviteCredits" = -1),
        CONSTRAINT "CHK_users_eventsAttended" CHECK ("eventsAttended" >= 0),
        CONSTRAINT "CHK_users_outstandingDebtAmount" CHECK ("outstandingDebtAmount" >= 0)
      );
    `);

    // Create indexes for users
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_users_role" ON "users" ("role");
    `);

    // Create wallets table
    await queryRunner.query(`
      CREATE TABLE "wallets" (
        "id" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "balanceAmount" bigint NOT NULL DEFAULT 0,
        "balanceCurrency" varchar(3) NOT NULL DEFAULT 'EUR',
        "lockedBalanceAmount" bigint NOT NULL DEFAULT 0,
        "lockedBalanceCurrency" varchar(3) NOT NULL DEFAULT 'EUR',
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_wallets" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_wallets_userId" UNIQUE ("userId"),
        CONSTRAINT "CHK_wallets_balanceAmount" CHECK ("balanceAmount" >= 0),
        CONSTRAINT "CHK_wallets_lockedBalanceAmount" CHECK ("lockedBalanceAmount" >= 0),
        CONSTRAINT "FK_wallets_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Create indexes for wallets
    await queryRunner.query(`
      CREATE INDEX "IDX_wallets_userId" ON "wallets" ("userId");
    `);

    // Create transactions table
    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL,
        "walletId" uuid NOT NULL,
        "type" "transaction_type_enum" NOT NULL,
        "amount" bigint NOT NULL,
        "currency" varchar(3) NOT NULL,
        "description" text,
        "referenceId" uuid,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_transactions_amount" CHECK ("amount" > 0),
        CONSTRAINT "FK_transactions_walletId" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE
      );
    `);

    // Create indexes for transactions
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_walletId" ON "transactions" ("walletId");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_createdAt" ON "transactions" ("createdAt");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_type" ON "transactions" ("type");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_referenceId" ON "transactions" ("referenceId");
    `);

    // Create events table
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid NOT NULL,
        "organizerId" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "description" text NOT NULL,
        "type" "event_type_enum" NOT NULL,
        "genre" "event_genre_enum" NOT NULL,
        "status" "event_status_enum" NOT NULL DEFAULT 'DRAFT',
        "startTime" timestamptz NOT NULL,
        "endTime" timestamptz NOT NULL,
        "location" varchar(500) NOT NULL,
        "venueId" uuid,
        "maxCapacity" integer,
        "isEscrowFunded" boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_events" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_events_endTime" CHECK ("endTime" > "startTime"),
        CONSTRAINT "CHK_events_maxCapacity" CHECK ("maxCapacity" IS NULL OR "maxCapacity" > 0),
        CONSTRAINT "FK_events_organizerId" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE RESTRICT
      );
    `);

    // Create indexes for events
    await queryRunner.query(`
      CREATE INDEX "IDX_events_organizerId" ON "events" ("organizerId");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_events_status" ON "events" ("status");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_events_startTime" ON "events" ("startTime");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_events_genre" ON "events" ("genre");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_events_venueId" ON "events" ("venueId");
    `);

    // Create event_attendees table
    await queryRunner.query(`
      CREATE TABLE "event_attendees" (
        "id" uuid NOT NULL,
        "eventId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "status" "attendee_status_enum" NOT NULL DEFAULT 'PENDING',
        "rsvpDate" timestamptz NOT NULL,
        "checkInDate" timestamptz,
        "cancelledDate" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_event_attendees" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_event_attendees_eventId_userId" UNIQUE ("eventId", "userId"),
        CONSTRAINT "FK_event_attendees_eventId" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_event_attendees_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Create indexes for event_attendees
    await queryRunner.query(`
      CREATE INDEX "IDX_event_attendees_eventId" ON "event_attendees" ("eventId");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_event_attendees_userId" ON "event_attendees" ("userId");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_event_attendees_status" ON "event_attendees" ("status");
    `);

    // Create venue_availabilities table
    await queryRunner.query(`
      CREATE TABLE "venue_availabilities" (
        "id" uuid NOT NULL,
        "venueId" uuid NOT NULL,
        "date" date NOT NULL,
        "minGuaranteeAmount" bigint NOT NULL,
        "minGuaranteeCurrency" varchar(3) NOT NULL,
        "terms" text NOT NULL,
        "status" "availability_status_enum" NOT NULL DEFAULT 'OPEN',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_venue_availabilities" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_venue_availabilities_venueId_date" UNIQUE ("venueId", "date"),
        CONSTRAINT "CHK_venue_availabilities_minGuaranteeAmount" CHECK ("minGuaranteeAmount" >= 0),
        CONSTRAINT "FK_venue_availabilities_venueId" FOREIGN KEY ("venueId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Create indexes for venue_availabilities
    await queryRunner.query(`
      CREATE INDEX "IDX_venue_availabilities_venueId" ON "venue_availabilities" ("venueId");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_venue_availabilities_date" ON "venue_availabilities" ("date");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_venue_availabilities_status" ON "venue_availabilities" ("status");
    `);

    // Create gig_applications table
    await queryRunner.query(`
      CREATE TABLE "gig_applications" (
        "id" uuid NOT NULL,
        "availabilityId" uuid NOT NULL,
        "djId" uuid NOT NULL,
        "proposal" text NOT NULL,
        "status" "gig_application_status_enum" NOT NULL DEFAULT 'PENDING',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gig_applications" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_gig_applications_availabilityId_djId" UNIQUE ("availabilityId", "djId"),
        CONSTRAINT "FK_gig_applications_availabilityId" FOREIGN KEY ("availabilityId") REFERENCES "venue_availabilities"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_gig_applications_djId" FOREIGN KEY ("djId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Create indexes for gig_applications
    await queryRunner.query(`
      CREATE INDEX "IDX_gig_applications_availabilityId" ON "gig_applications" ("availabilityId");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_gig_applications_djId" ON "gig_applications" ("djId");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_gig_applications_status" ON "gig_applications" ("status");
    `);

    // Create split_payments table
    await queryRunner.query(`
      CREATE TABLE "split_payments" (
        "id" uuid NOT NULL,
        "totalAmount" bigint NOT NULL,
        "currency" varchar(3) NOT NULL,
        "reason" varchar(255) NOT NULL,
        "status" "split_payment_status_enum" NOT NULL DEFAULT 'PENDING',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_split_payments" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_split_payments_totalAmount" CHECK ("totalAmount" > 0)
      );
    `);

    // Create indexes for split_payments
    await queryRunner.query(`
      CREATE INDEX "IDX_split_payments_status" ON "split_payments" ("status");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_split_payments_createdAt" ON "split_payments" ("createdAt");
    `);

    // Create split_payment_payers table
    await queryRunner.query(`
      CREATE TABLE "split_payment_payers" (
        "id" uuid NOT NULL,
        "splitPaymentId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "amount" bigint NOT NULL,
        "isPaid" boolean NOT NULL DEFAULT false,
        "paidAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_split_payment_payers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_split_payment_payers_splitPaymentId_userId" UNIQUE ("splitPaymentId", "userId"),
        CONSTRAINT "CHK_split_payment_payers_amount" CHECK ("amount" > 0),
        CONSTRAINT "FK_split_payment_payers_splitPaymentId" FOREIGN KEY ("splitPaymentId") REFERENCES "split_payments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_split_payment_payers_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Create indexes for split_payment_payers
    await queryRunner.query(`
      CREATE INDEX "IDX_split_payment_payers_splitPaymentId" ON "split_payment_payers" ("splitPaymentId");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_split_payment_payers_userId" ON "split_payment_payers" ("userId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting foreign key dependencies)
    await queryRunner.query(
      `DROP TABLE IF EXISTS "split_payment_payers" CASCADE;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "split_payments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "gig_applications" CASCADE;`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "venue_availabilities" CASCADE;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "event_attendees" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "events" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transactions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wallets" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE;`);

    // Drop ENUM types
    await queryRunner.query(
      `DROP TYPE IF EXISTS "split_payment_status_enum" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "transaction_type_enum" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "gig_application_status_enum" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "availability_status_enum" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "attendee_status_enum" CASCADE;`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "event_status_enum" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "event_genre_enum" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "event_type_enum" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum" CASCADE;`);
  }
}
