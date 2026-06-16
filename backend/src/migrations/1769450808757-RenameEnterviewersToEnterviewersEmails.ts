import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameEnterviewersToEnterviewersEmails1769450808757
  implements MigrationInterface
{
  name = 'RenameEnterviewersToEnterviewersEmails1769450808757';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interviews" RENAME COLUMN "interviewers" TO "interviewersEmails"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interviews" RENAME COLUMN "interviewersEmails" TO "interviewers"`,
    );
  }
}
