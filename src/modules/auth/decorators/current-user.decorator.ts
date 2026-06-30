import {
  UnauthorizedException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import type { RequestWithUser } from '../../../common/interfaces/request-with-user.interface';
import type { AccessTokenPayload } from '../interfaces/access-token-payload.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AccessTokenPayload => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user) {
      throw new UnauthorizedException('Authenticated user is missing from request');
    }

    return request.user;
  },
);
