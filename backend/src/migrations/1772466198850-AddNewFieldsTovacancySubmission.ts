import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewFieldsTovacancySubmission1772466198850
  implements MigrationInterface
{
  name = 'AddNewFieldsTovacancySubmission1772466198850';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD "expected_salary" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD "recruiter_rating" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD "rated_by_recruiter_id" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP COLUMN "rated_by_recruiter_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP COLUMN "recruiter_rating"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP COLUMN "expected_salary"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP COLUMN "created_at"`,
    );
  }
}
