import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResumeAndAIFieldsToCandidateProfileAndSubmission1773171294380
  implements MigrationInterface
{
  name = 'AddResumeAndAIFieldsToCandidateProfileAndSubmission1773171294380';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" ADD "resume" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" ADD "resume_ai_score" numeric(5,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" ADD "resume_ai_sentence_scores" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD "comment_ai_score" numeric(5,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD "comment_ai_sentence_scores" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD "resume" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD "resume_ai_score" numeric(5,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD "resume_ai_sentence_scores" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP COLUMN "resume_ai_sentence_scores"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP COLUMN "resume_ai_score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP COLUMN "resume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP COLUMN "comment_ai_sentence_scores"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP COLUMN "comment_ai_score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" DROP COLUMN "resume_ai_sentence_scores"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" DROP COLUMN "resume_ai_score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" DROP COLUMN "resume"`,
    );
  }
}
