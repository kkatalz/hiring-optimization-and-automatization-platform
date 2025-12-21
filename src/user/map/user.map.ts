import { User } from 'src/entities/user';
import { UserDto } from 'src/user/dto/user.dto';

export const userToUserDto = ({
  id,
  email,
  firstName,
  lastName,
  role,
}: User): UserDto => ({
  id,
  email,
  firstName,
  lastName,
  token: generate,
  role,
});
