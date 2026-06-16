import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeMatchScore0ByDefault1772457934087
  implements MigrationInterface
{
  name = 'MakeMatchScore0ByDefault1772457934087';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ALTER COLUMN "match_score" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ALTER COLUMN "match_score" SET DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ALTER COLUMN "match_score" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ALTER COLUMN "match_score" DROP NOT NULL`,
    );
  }
}
