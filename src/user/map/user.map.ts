import { User } from 'src/entities/user';
import { UserDto } from 'src/user/dto/user.dto';

export const userToUserDto = ({
  user,
  token,
}: {
  user: User;
  token?: string;
}): UserDto => {
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
