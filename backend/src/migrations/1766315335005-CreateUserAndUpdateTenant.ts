import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAndUpdateTenant1766315335005
  implements MigrationInterface
{
  name = 'CreateUserAndUpdateTenant1766315335005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('superAdmin', 'admin', 'recruiter', 'candidate')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying(20) NOT NULL, "lastName" character varying(50) NOT NULL, "deleted" boolean NOT NULL DEFAULT false, "role" "public"."users_role_enum" NOT NULL DEFAULT 'admin', "tenant_id" uuid, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_109638590074998bb72a2f2cf08" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_109638590074998bb72a2f2cf08"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
