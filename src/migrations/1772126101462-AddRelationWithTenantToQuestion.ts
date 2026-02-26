import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationWithTenantToQuestion1772126101462
  implements MigrationInterface
{
  name = 'AddRelationWithTenantToQuestion1772126101462';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions" ALTER COLUMN "answerOptions" SET DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "FK_43d1b1dd813501e3b294953b159" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "FK_43d1b1dd813501e3b294953b159"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ALTER COLUMN "answerOptions" DROP DEFAULT`,
    );
  }
}
