import { MigrationInterface, QueryRunner } from 'typeorm';

export class IncreaseMatchScorePrecision1777824000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ALTER COLUMN "match_score" TYPE numeric(7, 2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Clamp values that exceed the smaller column's max before shrinking the type,
    // otherwise PostgreSQL rejects the ALTER on rows where match_score > 999.99.
    await queryRunner.query(
      `UPDATE "vacancy_submissions" SET "match_score" = 999.99 WHERE "match_score" > 999.99`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ALTER COLUMN "match_score" TYPE numeric(5, 2)`,
    );
  }
}
