import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequiredYearsOfExperience1772973889821
  implements MigrationInterface
{
  name = 'AddRequiredYearsOfExperience1772973889821';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancies" ADD "required_years_of_experience" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission_answers" ALTER COLUMN "value" TYPE jsonb USING "value"::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_questions" ALTER COLUMN "expected_value" TYPE jsonb USING "expected_value"::jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_questions" ALTER COLUMN "expected_value" TYPE character varying USING "expected_value"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission_answers" ALTER COLUMN "value" TYPE character varying USING "value"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" DROP COLUMN "required_years_of_experience"`,
    );
  }
}
