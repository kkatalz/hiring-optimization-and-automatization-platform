import { User } from '../../entities/user';
import { UserDto } from '../../user/dto/user.dto';

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
