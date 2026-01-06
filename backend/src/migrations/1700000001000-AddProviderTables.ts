import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProviderTables1700000001000 implements MigrationInterface {
  name = 'AddProviderTables1700000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM types for Provider module
    await queryRunner.query(`
      CREATE TYPE "service_category_enum" AS ENUM(
        'AUDIO_PA', 'DJ_GEAR', 'LIGHTING', 
        'VISUALS', 'ATMOSPHERE', 'STAFF'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE "booking_status_enum" AS ENUM(
        'PENDING', 'CONFIRMED', 'REJECTED', 
        'CANCELLED', 'COMPLETED'
      );
    `);

    // Add PROVIDER to user_role_enum if not exists
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TYPE "user_role_enum" ADD VALUE IF NOT EXISTS 'PROVIDER';
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create service_listings table
    await queryRunner.query(`
      CREATE TABLE "service_listings" (
        "id" uuid PRIMARY KEY,
        "providerId" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "description" text NOT NULL,
        "category" service_category_enum NOT NULL,
        "pricePerDayAmount" bigint NOT NULL,
        "pricePerDayCurrency" varchar(3) NOT NULL,
        "specs" jsonb,
        "isAvailable" boolean DEFAULT true,
        "createdAt" timestamptz NOT NULL,
        "updatedAt" timestamptz NOT NULL
      );
    `);

    // Create service_bookings table
    await queryRunner.query(`
      CREATE TABLE "service_bookings" (
        "id" uuid PRIMARY KEY,
        "serviceListingId" uuid NOT NULL,
        "providerId" uuid NOT NULL,
        "eventId" uuid NOT NULL,
        "startDate" timestamptz NOT NULL,
        "endDate" timestamptz NOT NULL,
        "totalCostAmount" bigint NOT NULL,
        "totalCostCurrency" varchar(3) NOT NULL,
        "status" booking_status_enum DEFAULT 'PENDING',
        "createdAt" timestamptz NOT NULL,
        "updatedAt" timestamptz NOT NULL
      );
    `);

    // Foreign keys
    await queryRunner.query(`
      ALTER TABLE "service_listings" 
        ADD CONSTRAINT "FK_service_listings_provider" 
        FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE "service_bookings" 
        ADD CONSTRAINT "FK_service_bookings_listing" 
        FOREIGN KEY ("serviceListingId") REFERENCES "service_listings"("id") ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE "service_bookings" 
        ADD CONSTRAINT "FK_service_bookings_provider" 
        FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE "service_bookings" 
        ADD CONSTRAINT "FK_service_bookings_event" 
        FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE;
    `);

    // Indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_service_listings_provider" ON "service_listings"("providerId");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_service_listings_category" ON "service_listings"("category");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_service_listings_available" ON "service_listings"("isAvailable");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_service_bookings_listing" ON "service_bookings"("serviceListingId");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_service_bookings_provider" ON "service_bookings"("providerId");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_service_bookings_event" ON "service_bookings"("eventId");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_service_bookings_status" ON "service_bookings"("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_service_bookings_status" CASCADE;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_service_bookings_event" CASCADE;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_service_bookings_provider" CASCADE;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_service_bookings_listing" CASCADE;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_service_listings_available" CASCADE;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_service_listings_category" CASCADE;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_service_listings_provider" CASCADE;`,
    );

    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "service_bookings" DROP CONSTRAINT IF EXISTS "FK_service_bookings_event" CASCADE;`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" DROP CONSTRAINT IF EXISTS "FK_service_bookings_provider" CASCADE;`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_bookings" DROP CONSTRAINT IF EXISTS "FK_service_bookings_listing" CASCADE;`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_listings" DROP CONSTRAINT IF EXISTS "FK_service_listings_provider" CASCADE;`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "service_bookings" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_listings" CASCADE;`);

    // Drop ENUM types
    await queryRunner.query(
      `DROP TYPE IF EXISTS "booking_status_enum" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "service_category_enum" CASCADE;`,
    );

    // Note: We don't remove PROVIDER from user_role_enum to avoid breaking existing data
  }
}

