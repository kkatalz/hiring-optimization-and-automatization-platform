import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTypeOfTimeCommitmentInVacancy1770641722430
  implements MigrationInterface
{
  name = 'ChangeTypeOfTimeCommitmentInVacancy1770641722430';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."vacancies_time_commitment_enum" RENAME TO "vacancies_time_commitment_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vacancies_time_commitment_enum" AS ENUM('FULL_TIME', 'PART_TIME', 'PROJECT_BASED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" ALTER COLUMN "time_commitment" TYPE "public"."vacancies_time_commitment_enum" USING "time_commitment"::"text"::"public"."vacancies_time_commitment_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."vacancies_time_commitment_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."vacancies_time_commitment_enum_old" AS ENUM('full_time', 'part_time', 'project_based')`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" ALTER COLUMN "time_commitment" TYPE "public"."vacancies_time_commitment_enum_old" USING "time_commitment"::"text"::"public"."vacancies_time_commitment_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."vacancies_time_commitment_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."vacancies_time_commitment_enum_old" RENAME TO "vacancies_time_commitment_enum"`,
    );
  }
}
