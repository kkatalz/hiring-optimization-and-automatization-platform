import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeEMailAndSlugUnique1775851115327 implements MigrationInterface {
    name = 'MakeEMailAndSlugUnique1775851115327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "UQ_155c343439adc83ada6ee3f48be" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD CONSTRAINT "UQ_2310ecc5cb8be427097154b18fc" UNIQUE ("slug")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" DROP CONSTRAINT "UQ_2310ecc5cb8be427097154b18fc"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP CONSTRAINT "UQ_155c343439adc83ada6ee3f48be"`);
    }

}
