import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriorityExpectedValueAndMatchScoreForVacancy1772186680876
  implements MigrationInterface
{
  name = 'AddPriorityExpectedValueAndMatchScoreForVacancy1772186680876';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD "match_score" numeric(5,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_questions" ADD "priority" integer NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_questions" ADD "expected_value" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_questions" DROP COLUMN "expected_value"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_questions" DROP COLUMN "priority"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP COLUMN "match_score"`,
    );
  }
}
