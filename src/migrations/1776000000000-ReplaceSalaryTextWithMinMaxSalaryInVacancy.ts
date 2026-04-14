import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceSalaryTextWithMinMaxSalaryInVacancy1776000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancies" ADD "min_salary" decimal(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" ADD "max_salary" decimal(10,2)`,
    );

    // Migrate existing salary text data to structured columns.
    // Matches patterns like "1000-1100 USD", "500", "3000-5000".
    // Non-parseable values like "competitive" produce no matches and stay NULL.
    await queryRunner.query(`
      UPDATE "vacancies"
      SET
        "min_salary" = (regexp_match(salary, '([0-9]+\\.?[0-9]*)'))[1]::decimal,
        "max_salary" = COALESCE(
          (regexp_match(salary, '[0-9]+\\.?[0-9]*[^0-9]+([0-9]+\\.?[0-9]*)'))[1]::decimal,
          (regexp_match(salary, '([0-9]+\\.?[0-9]*)'))[1]::decimal
        )
      WHERE salary IS NOT NULL
        AND salary ~ '[0-9]'
    `);

    await queryRunner.query(`ALTER TABLE "vacancies" DROP COLUMN "salary"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancies" ADD "salary" character varying`,
    );

    await queryRunner.query(`
      UPDATE "vacancies"
      SET "salary" = CASE
        WHEN "min_salary" IS NOT NULL AND "max_salary" IS NOT NULL AND "min_salary" != "max_salary"
          THEN "min_salary"::text || '-' || "max_salary"::text
        WHEN "min_salary" IS NOT NULL
          THEN "min_salary"::text
        ELSE NULL
      END
    `);

    await queryRunner.query(`ALTER TABLE "vacancies" DROP COLUMN "max_salary"`);
    await queryRunner.query(`ALTER TABLE "vacancies" DROP COLUMN "min_salary"`);
  }
}
