import type { Request } from 'express';
import type { AccessTokenPayload } from '../../modules/auth/interfaces/access-token-payload.interface';

export interface RequestWithUser extends Request {
  user?: AccessTokenPayload;
}
