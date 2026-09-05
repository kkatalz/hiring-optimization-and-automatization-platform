import { IsOptional, IsString } from 'class-validator';
import { IsValidPassword } from '../../decorators/isValidPassword.decorator';

export class ChangePasswordDto {
  /**
   * Required when a user changes their own password, ignored when an admin or a
   * super admin changes somebody else's. The service enforces that.
   */
  @IsOptional()
  @IsString()
  oldPassword?: string;

  @IsValidPassword()
  password: string;
}
