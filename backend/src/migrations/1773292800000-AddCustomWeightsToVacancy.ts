import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomWeightsToVacancy1773292800000
  implements MigrationInterface
{
  name = 'AddCustomWeightsToVacancy1773292800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancies" ADD "custom_weights" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancies" DROP COLUMN "custom_weights"`,
    );
  }
}
