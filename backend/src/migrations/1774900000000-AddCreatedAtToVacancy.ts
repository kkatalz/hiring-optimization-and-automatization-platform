import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedAtToVacancy1774900000000 implements MigrationInterface {
  name = 'AddCreatedAtToVacancy1774900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancies" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vacancies" DROP COLUMN "created_at"`);
  }
}
