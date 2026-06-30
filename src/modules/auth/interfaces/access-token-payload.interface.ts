import type { AuthUserPayload } from './auth-user-payload.interface';

export interface AccessTokenPayload extends AuthUserPayload {
  type: 'access';
  iat: number;
  exp: number;
}
