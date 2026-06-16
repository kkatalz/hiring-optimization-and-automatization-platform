import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeValueAndExpectedValueToJsonb1772700000000
  implements MigrationInterface
{
  name = 'ChangeValueAndExpectedValueToJsonb1772700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert existing varchar data to jsonb (wrapping strings in quotes for valid JSON)
    await queryRunner.query(
      `ALTER TABLE "submission_answers" ALTER COLUMN "value" TYPE jsonb USING to_jsonb(value)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_questions" ALTER COLUMN "expected_value" TYPE jsonb USING to_jsonb(expected_value)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "submission_answers" ALTER COLUMN "value" TYPE varchar USING value::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_questions" ALTER COLUMN "expected_value" TYPE varchar USING expected_value::text`,
    );
  }
}
