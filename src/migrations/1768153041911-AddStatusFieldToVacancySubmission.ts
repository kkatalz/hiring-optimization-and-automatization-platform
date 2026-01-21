import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusFieldToVacancySubmission1768153041911
  implements MigrationInterface
{
  name = 'AddStatusFieldToVacancySubmission1768153041911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."vacancy_submissions_status_enum" AS ENUM('pending', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD "status" "public"."vacancy_submissions_status_enum" NOT NULL DEFAULT 'pending'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP COLUMN "status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."vacancy_submissions_status_enum"`,
    );
  }
}
