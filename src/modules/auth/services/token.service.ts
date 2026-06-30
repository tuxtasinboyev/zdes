import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomBytes } from 'node:crypto';
import {
  ACCESS_TOKEN_TYPE,
  REFRESH_TOKEN_TYPE,
  TWENTY_DAYS_IN_MS,
  TWENTY_DAYS_IN_SECONDS,
} from '../constants/auth.constants';
import type { AccessTokenPayload } from '../interfaces/access-token-payload.interface';
import type { AuthUserPayload } from '../interfaces/auth-user-payload.interface';

type JwtHeader = {
  alg: 'HS256';
  typ: 'JWT';
};

@Injectable()
export class TokenService {
  getAccessTokenExpiresInSeconds(): number {
    return TWENTY_DAYS_IN_SECONDS;
  }

  getRefreshTokenExpiryDate(): Date {
    return new Date(Date.now() + TWENTY_DAYS_IN_MS);
  }

  createAccessToken(user: AuthUserPayload): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const payload: AccessTokenPayload = {
      ...user,
      type: ACCESS_TOKEN_TYPE,
      iat: issuedAt,
      exp: issuedAt + this.getAccessTokenExpiresInSeconds(),
    };

    return this.signJwt(payload, this.getAccessSecret());
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const payload = this.verifyJwt(token, this.getAccessSecret());

    if (payload.type !== ACCESS_TOKEN_TYPE) {
      throw new UnauthorizedException('Invalid access token');
    }

    return payload as unknown as AccessTokenPayload;
  }

  createRefreshToken(): string {
    const randomToken = randomBytes(48).toString('base64url');
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + TWENTY_DAYS_IN_SECONDS;

    return `${REFRESH_TOKEN_TYPE}.${issuedAt}.${expiresAt}.${randomToken}`;
  }

  hashRefreshToken(refreshToken: string): string {
    return createHmac('sha256', this.getRefreshSecret())
      .update(refreshToken)
      .digest('hex');
  }

  private signJwt(payload: object, secret: string): string {
    const header: JwtHeader = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = this.toBase64Url(JSON.stringify(header));
    const encodedPayload = this.toBase64Url(JSON.stringify(payload));
    const signature = createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private verifyJwt(token: string, secret: string): Record<string, unknown> {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Malformed token');
    }

    const expectedSignature = createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid token signature');
    }

    const payload = JSON.parse(this.fromBase64Url(encodedPayload)) as Record<
      string,
      unknown
    >;

    const expiration = Number(payload.exp);

    if (!Number.isFinite(expiration) || expiration <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token expired');
    }

    return payload;
  }

  private toBase64Url(value: string): string {
    return Buffer.from(value).toString('base64url');
  }

  private fromBase64Url(value: string): string {
    return Buffer.from(value, 'base64url').toString('utf8');
  }

  private getAccessSecret(): string {
    return process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET ?? 'dev-access-secret';
  }

  private getRefreshSecret(): string {
    return process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'dev-refresh-secret';
  }
}
