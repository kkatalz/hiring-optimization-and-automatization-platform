import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCandidateProfileSetRelationWithUserAddNewFieldsToVacancy1769551368096
  implements MigrationInterface
{
  name =
    'AddCandidateProfileSetRelationWithUserAddNewFieldsToVacancy1769551368096';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "candidate_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "years_of_experience" integer NOT NULL, "country" text NOT NULL, "city" text NOT NULL, "languages" jsonb NOT NULL, CONSTRAINT "PK_8e8cf5b54118601673585218cc4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vacancies_time_commitment_enum" AS ENUM('full_time', 'part_time', 'project_based')`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" ADD "time_commitment" "public"."vacancies_time_commitment_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" ADD "language_requirements" jsonb`,
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

  public async down(queryRunner: QueryRunner): Promise<void> {
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
      `ALTER TABLE "vacancies" DROP COLUMN "language_requirements"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" DROP COLUMN "time_commitment"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."vacancies_time_commitment_enum"`,
    );
    await queryRunner.query(`DROP TABLE "candidate_profiles"`);
  }
}
