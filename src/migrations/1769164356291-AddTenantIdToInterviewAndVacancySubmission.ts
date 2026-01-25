import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantIdToInterviewAndVacancySubmission1769164356291
  implements MigrationInterface
{
  name = 'AddTenantIdToInterviewAndVacancySubmission1769164356291';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "interviews" ADD "tenant_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "interviews" ADD "candidate_email" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD "tenant_id" uuid NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP COLUMN "tenant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" DROP COLUMN "candidate_email"`,
    );
    await queryRunner.query(`ALTER TABLE "interviews" DROP COLUMN "tenant_id"`);
  }
}
