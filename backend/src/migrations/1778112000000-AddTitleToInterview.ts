import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTitleToInterview1778112000000 implements MigrationInterface {
  name = 'AddTitleToInterview1778112000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The DEFAULT backfills interviews that were created before titles existed
    await queryRunner.query(
      `ALTER TABLE "interviews" ADD COLUMN "title" character varying(120) NOT NULL DEFAULT 'Interview'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "interviews" DROP COLUMN "title"`);
  }
}
