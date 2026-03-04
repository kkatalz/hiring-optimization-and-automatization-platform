import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClusterIdToSubmissionAndNeedsReclusteringFlagTovacancy1772632378559
  implements MigrationInterface
{
  name =
    'AddClusterIdToSubmissionAndNeedsReclusteringFlagTovacancy1772632378559';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancies" ADD "needs_reclustering" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD "cluster_id" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP COLUMN "cluster_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" DROP COLUMN "needs_reclustering"`,
    );
  }
}
