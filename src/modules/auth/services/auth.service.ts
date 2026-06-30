import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { User, UserRole } from '@prisma/client';
import { PrismaService } from '../../../common/congif/prisma/prisma.service';
import type { AccessTokenPayload } from '../interfaces/access-token-payload.interface';
import type { AuthUserPayload } from '../interfaces/auth-user-payload.interface';
import type { TokenRequestMeta } from '../interfaces/token-request-meta.interface';
import { isDateExpired, trimToNull } from '../../../common/utils/helpers';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

const LOGIN_ALLOWED_ROLES: UserRole[] = ['superadmin', 'admin', 'manager'];

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async login(
    login: string,
    password: string,
    meta: TokenRequestMeta,
  ) {
    const normalizedLogin = trimToNull(login);

    if (!normalizedLogin || !password) {
      throw new UnauthorizedException('Login and password are required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ login: normalizedLogin }, { email: normalizedLogin }],
      },
    });

    if (!user || !(await this.passwordService.verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid login or password');
    }

    this.ensureUserCanLogin(user);

    const refreshToken = this.tokenService.createRefreshToken();

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: this.tokenService.hashRefreshToken(refreshToken),
        expiresAt: this.tokenService.getRefreshTokenExpiryDate(),
        deviceType: meta.deviceType,
        deviceName: meta.deviceName,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
        lastUsedAt: new Date(),
      },
    });

    return this.buildAuthTokensResponse(user, refreshToken);
  }

  async refresh(
    refreshToken: string,
    meta: TokenRequestMeta,
  ) {
    const normalizedRefreshToken = trimToNull(refreshToken);

    if (!normalizedRefreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokenRecord = await this.prisma.refreshToken.findFirst({
      where: {
        token: this.tokenService.hashRefreshToken(normalizedRefreshToken),
      },
      include: {
        user: true,
      },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    if (isDateExpired(tokenRecord.expiresAt)) {
      await this.prisma.refreshToken.delete({
        where: {
          id: tokenRecord.id,
        },
      });

      throw new UnauthorizedException('Refresh token expired');
    }

    this.ensureUserCanLogin(tokenRecord.user);

    await this.prisma.refreshToken.update({
      where: {
        id: tokenRecord.id,
      },
      data: {
        lastUsedAt: new Date(),
        userAgent: meta.userAgent ?? tokenRecord.userAgent,
        ipAddress: meta.ipAddress ?? tokenRecord.ipAddress,
        deviceType: meta.deviceType ?? tokenRecord.deviceType,
        deviceName: meta.deviceName ?? tokenRecord.deviceName,
      },
    });

    return this.buildAuthTokensResponse(tokenRecord.user);
  }

  async logout(refreshToken: string) {
    const normalizedRefreshToken = trimToNull(refreshToken);

    if (!normalizedRefreshToken) {
      return { success: true };
    }

    await this.prisma.refreshToken.deleteMany({
      where: {
        token: this.tokenService.hashRefreshToken(normalizedRefreshToken),
      },
    });

    return { success: true };
  }

  async getCurrentUser(authUser: AccessTokenPayload) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: authUser.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.ensureUserCanLogin(user);

    return this.toPublicUser(user);
  }

  private ensureUserCanLogin(user: User): void {
    if (!LOGIN_ALLOWED_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Only superadmin, admin, and manager users can login. Employee users authenticate through turnstile integration.',
      );
    }

    if (!user.isActive) {
      throw new ForbiddenException('User is inactive');
    }

    if (user.isBlocked) {
      throw new ForbiddenException('User is blocked');
    }
  }

  private toAuthPayload(user: User): AuthUserPayload {
    return {
      sub: user.id,
      login: user.login,
      role: user.role,
      companyId: user.companyId,
      branchId: user.branchId,
      faceDeviceUserId: user.faceDeviceUserId,
    };
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      login: user.login,
      role: user.role,
      companyId: user.companyId,
      branchId: user.branchId,
      departmentId: user.departmentId,
      positionId: user.positionId,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      phone: user.phone,
      email: user.email,
      employeeNo: user.employeeNo,
      faceDeviceUserId: user.faceDeviceUserId,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
    };
  }

  private buildAuthTokensResponse(  
    user: User,
    refreshToken?: string,
  ) {
    return {
      tokenType: 'Bearer',
      accessToken: this.tokenService.createAccessToken(this.toAuthPayload(user)),
      refreshToken,
      expiresIn: this.tokenService.getAccessTokenExpiresInSeconds(),
      user: this.toPublicUser(user),
    };
  }
}
