import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequiredYearsOfExperience1772973889821
  implements MigrationInterface
{
  name = 'AddRequiredYearsOfExperience1772973889821';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancies" ADD "required_years_of_experience" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancies" DROP COLUMN "required_years_of_experience"`,
    );
  }
}
