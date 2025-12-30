import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVacancyEntitySetRelationWithUser1766667946914
  implements MigrationInterface
{
  name = 'CreateVacancyEntitySetRelationWithUser1766667946914';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "vacancies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "tags" text NOT NULL, "salary" character varying, "tenant_id" uuid, "created_by_id" uuid, CONSTRAINT "PK_3b45154a366568190cc15be2906" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" ADD CONSTRAINT "FK_b85132f68cf2041cfc4de445d34" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancies" DROP CONSTRAINT "FK_b85132f68cf2041cfc4de445d34"`,
    );
    await queryRunner.query(`DROP TABLE "vacancies"`);
  }
}
