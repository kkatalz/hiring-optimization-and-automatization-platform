import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameRecruiterRatingToRatingAndRatedByRecruiterIdToRatedById1788884871459
  implements MigrationInterface
{
  name =
    'RenameRecruiterRatingToRatingAndRatedByRecruiterIdToRatedById1788884871459';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" RENAME COLUMN "recruiter_rating" TO "rating"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" RENAME COLUMN "rated_by_recruiter_id" TO "rated_by_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" RENAME COLUMN "rated_by_id" TO "rated_by_recruiter_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" RENAME COLUMN "rating" TO "recruiter_rating"`,
    );
  }
}
