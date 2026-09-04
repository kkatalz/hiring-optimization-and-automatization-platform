import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidPassword } from '../../decorators/isValidPassword.decorator';

/** Step two of a password reset: the emailed token plus the new password. */
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsValidPassword()
  newPassword: string;
}
