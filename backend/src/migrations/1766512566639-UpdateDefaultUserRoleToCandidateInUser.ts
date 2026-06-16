import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDefaultUserRoleToCandidateInUser1766512566639
  implements MigrationInterface
{
  name = 'UpdateDefaultUserRoleToCandidateInUser1766512566639';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'candidate'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'admin'`,
    );
  }
}
