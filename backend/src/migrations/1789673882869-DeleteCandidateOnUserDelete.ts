import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteCandidateOnUserDelete1789673882869
  implements MigrationInterface
{
  name = 'DeleteCandidateOnUserDelete1789673882869';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" DROP CONSTRAINT "FK_5a3673f11918bcea56f48549603"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" ADD CONSTRAINT "FK_5a3673f11918bcea56f48549603" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" DROP CONSTRAINT "FK_5a3673f11918bcea56f48549603"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" ADD CONSTRAINT "FK_5a3673f11918bcea56f48549603" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
