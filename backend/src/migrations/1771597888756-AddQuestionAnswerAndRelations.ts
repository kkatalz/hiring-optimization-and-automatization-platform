import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuestionAnswerAndRelations1771597888756
  implements MigrationInterface
{
  name = 'AddQuestionAnswerAndRelations1771597888756';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "submission_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "submission_id" uuid NOT NULL, "question_id" uuid NOT NULL, "value" character varying NOT NULL, CONSTRAINT "PK_32d8f1ef26cf32a2e8ba2f1fc13" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."questions_type_enum" AS ENUM('boolean', 'text', 'dropdown')`,
    );
    await queryRunner.query(
      `CREATE TABLE "questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "label" character varying NOT NULL, "type" "public"."questions_type_enum" NOT NULL, "answerOptions" jsonb, CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "vacancy_questions" ("vacancy_id" uuid NOT NULL, "question_id" uuid NOT NULL, "is_required" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_d4e73e37c870fe0ef26a6dd7f75" PRIMARY KEY ("vacancy_id", "question_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission_answers" ADD CONSTRAINT "FK_5b61c511ac5f89a1a8bcffe6cc3" FOREIGN KEY ("submission_id") REFERENCES "vacancy_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission_answers" ADD CONSTRAINT "FK_b65dfe2c68541fe7d90e82ebf03" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_questions" ADD CONSTRAINT "FK_58c4f7f057db041eaee1a625954" FOREIGN KEY ("vacancy_id") REFERENCES "vacancies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_questions" ADD CONSTRAINT "FK_f4a5f3b70776753ebc55b8fc2dd" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_questions" DROP CONSTRAINT "FK_f4a5f3b70776753ebc55b8fc2dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_questions" DROP CONSTRAINT "FK_58c4f7f057db041eaee1a625954"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission_answers" DROP CONSTRAINT "FK_b65dfe2c68541fe7d90e82ebf03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission_answers" DROP CONSTRAINT "FK_5b61c511ac5f89a1a8bcffe6cc3"`,
    );
    await queryRunner.query(`DROP TABLE "vacancy_questions"`);
    await queryRunner.query(`DROP TABLE "questions"`);
    await queryRunner.query(`DROP TYPE "public"."questions_type_enum"`);
    await queryRunner.query(`DROP TABLE "submission_answers"`);
  }
}
