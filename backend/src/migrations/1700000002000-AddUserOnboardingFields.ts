import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserOnboardingFields1700000002000 implements MigrationInterface {
  name = 'AddUserOnboardingFields1700000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add AFRO_HOUSE to event_genre_enum
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TYPE "event_genre_enum" ADD VALUE IF NOT EXISTS 'AFRO_HOUSE';
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add phoneNumber column to users table
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "phoneNumber" varchar(20) NULL;
    `);

    // Add preferredGenres column to users table (simple-array)
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "preferredGenres" text NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "preferredGenres";
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "phoneNumber";
    `);

    // Note: We cannot easily remove a value from an enum in PostgreSQL
    // The AFRO_HOUSE value will remain in the enum but won't cause issues
  }
}
