import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTenantEntity1765979349140 implements MigrationInterface {
    name = 'CreateTenantEntity1765979349140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "slug" character varying NOT NULL, "deleted" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tenants"`);
    }

}
