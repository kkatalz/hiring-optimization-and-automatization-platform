import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveApplicationsToCandidateProfile1770926758076
  implements MigrationInterface
{
  name = 'MoveApplicationsToCandidateProfile1770926758076';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP CONSTRAINT "FK_d9a6d39fbd85fb4e1e331c84ed4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD CONSTRAINT "FK_d9a6d39fbd85fb4e1e331c84ed4" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" DROP CONSTRAINT "FK_d9a6d39fbd85fb4e1e331c84ed4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_submissions" ADD CONSTRAINT "FK_d9a6d39fbd85fb4e1e331c84ed4" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
