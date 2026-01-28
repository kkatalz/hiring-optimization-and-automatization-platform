import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveFKToCandidateProfileRemoveFromUser1769637006682
  implements MigrationInterface
{
  name = 'MoveFKToCandidateProfileRemoveFromUser1769637006682';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_803fadb7ab126c22b175a119ad9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_803fadb7ab126c22b175a119ad9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "candidateProfileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" ADD "user_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" ADD CONSTRAINT "UQ_5a3673f11918bcea56f48549603" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" ADD CONSTRAINT "FK_5a3673f11918bcea56f48549603" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" DROP CONSTRAINT "FK_5a3673f11918bcea56f48549603"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" DROP CONSTRAINT "UQ_5a3673f11918bcea56f48549603"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" DROP COLUMN "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "candidateProfileId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_803fadb7ab126c22b175a119ad9" UNIQUE ("candidateProfileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_803fadb7ab126c22b175a119ad9" FOREIGN KEY ("candidateProfileId") REFERENCES "candidate_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
