import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeInterviewersEmailsToJsonb1778025600000
  implements MigrationInterface
{
  name = 'ChangeInterviewersEmailsToJsonb1778025600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interviews" ALTER COLUMN "interviewersEmails" TYPE jsonb USING "interviewersEmails"::jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" ALTER COLUMN "interviewersEmails" SET DEFAULT '[]'::jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interviews" ALTER COLUMN "interviewersEmails" SET DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" ALTER COLUMN "interviewersEmails" TYPE text USING "interviewersEmails"::text`,
    );
  }
}
