import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDBNameToFirstAndLastNameInUserEntity1766406946477
  implements MigrationInterface
{
  name = 'AddDBNameToFirstAndLastNameInUserEntity1766406946477';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "firstName" TO "first_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "lastName" TO "last_name"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "first_name" TO "firstName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "last_name" TO "lastName"`,
    );
  }
}
