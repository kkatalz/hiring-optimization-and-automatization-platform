import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTagsColFromVacancy1766769218910
  implements MigrationInterface
{
  name = 'RemoveTagsColFromVacancy1766769218910';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vacancies" DROP COLUMN "tags"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vacancies" ADD "tags" text NOT NULL`);
  }
}
