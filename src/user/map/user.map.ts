import { User } from 'src/entities/user';
import { UserResponseDto } from 'src/user/dto/userResponse.dto';

export const userToUserResponseDto = ({
  user,
  token,
}: {
  user: User;
  token?: string;
}): UserResponseDto => {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    tenantId: user.tenantId,
    token: token,
  };
};
