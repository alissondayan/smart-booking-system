import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../domain/enums/user-role.enum';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser | undefined => {
    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
    }>();

    return request.user;
  },
);
