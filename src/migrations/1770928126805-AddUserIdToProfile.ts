import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToProfile1770928126805 implements MigrationInterface {
  name = 'AddUserIdToProfile1770928126805';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" DROP CONSTRAINT "FK_5a3673f11918bcea56f48549603"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" ALTER COLUMN "user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" ADD CONSTRAINT "FK_5a3673f11918bcea56f48549603" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

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

    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" DROP CONSTRAINT "FK_5a3673f11918bcea56f48549603"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" ALTER COLUMN "user_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" ADD CONSTRAINT "FK_5a3673f11918bcea56f48549603" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
