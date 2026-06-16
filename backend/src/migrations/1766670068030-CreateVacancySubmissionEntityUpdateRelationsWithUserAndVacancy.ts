import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVacancySubmissionEntityUpdateRelationsWithUserAndVacancy1766670068030
  implements MigrationInterface
{
  name =
    'CreateVacancySubmissionEntityUpdateRelationsWithUserAndVacancy1766670068030';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "vacancy_submissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "comment" text, "vacancy_id" uuid NOT NULL, "candidate_id" uuid NOT NULL, CONSTRAINT "PK_645eb5fbf8640d2acb21dc417e7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD CONSTRAINT "FK_58a78c8426324c99f645d737baa" FOREIGN KEY ("vacancy_id") REFERENCES "vacancies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD CONSTRAINT "FK_d9a6d39fbd85fb4e1e331c84ed4" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP CONSTRAINT "FK_d9a6d39fbd85fb4e1e331c84ed4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP CONSTRAINT "FK_58a78c8426324c99f645d737baa"`,
    );
    await queryRunner.query(`DROP TABLE "vacancy_submissions"`);
  }
}
