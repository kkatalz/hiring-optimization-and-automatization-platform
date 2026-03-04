import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClusterIdoSubmission1772625977708
  implements MigrationInterface
{
  name = 'AddClusterIdoSubmission1772625977708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD "cluster_id" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP COLUMN "cluster_id"`,
    );
  }
}
