import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInterviewEntitySetRelationWithSubmission1769094791897
  implements MigrationInterface
{
  name = 'AddInterviewEntitySetRelationWithSubmission1769094791897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."interviews_status_enum" AS ENUM('scheduled', 'completed', 'canceled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "interviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "meet_link" text NOT NULL, "scheduled_date" TIMESTAMP NOT NULL, "duration_minutes" integer NOT NULL DEFAULT '60', "submission_id" uuid NOT NULL, "interviewers" text DEFAULT '[]', "notes" text, "status" "public"."interviews_status_enum" NOT NULL DEFAULT 'scheduled', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fd41af1f96d698fa33c2f070f47" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."vacancy_submissions_status_enum" RENAME TO "vacancy_submissions_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vacancy_submissions_status_enum" AS ENUM('pending', 'interviewing', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ALTER COLUMN "status" TYPE "public"."vacancy_submissions_status_enum" USING "status"::"text"::"public"."vacancy_submissions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."vacancy_submissions_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" ADD CONSTRAINT "FK_19f42c92f731a01923da90d577e" FOREIGN KEY ("submission_id") REFERENCES "vacancy_submissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interviews" DROP CONSTRAINT "FK_19f42c92f731a01923da90d577e"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vacancy_submissions_status_enum_old" AS ENUM('pending', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ALTER COLUMN "status" TYPE "public"."vacancy_submissions_status_enum_old" USING "status"::"text"::"public"."vacancy_submissions_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."vacancy_submissions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."vacancy_submissions_status_enum_old" RENAME TO "vacancy_submissions_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "interviews"`);
    await queryRunner.query(`DROP TYPE "public"."interviews_status_enum"`);
  }
}
