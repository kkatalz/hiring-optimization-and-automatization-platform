import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeInterviewersEmailsTypeInInterviewToJSON1770886545910
  implements MigrationInterface
{
  name = 'ChangeInterviewersEmailsTypeInInterviewToJSON1770886545910';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interviews" DROP COLUMN "interviewersEmails"`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" ADD "interviewersEmails" jsonb DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interviews" DROP COLUMN "interviewersEmails"`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" ADD "interviewersEmails" text DEFAULT '[]'`,
    );
  }
}
