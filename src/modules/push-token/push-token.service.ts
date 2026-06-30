import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/congif/prisma/prisma.service';
import { trimToNull } from '../../common/utils/helpers';
import { CreatePushTokenDto } from './dto/create-push-token.dto';
import { PushTokenQueryDto } from './dto/push-token-query.dto';
import { UpdatePushTokenDto } from './dto/update-push-token.dto';

@Injectable()
export class PushTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePushTokenDto) {
    const userId = await this.ensureUserExists(dto.userId);
    const token = this.normalizeRequired(dto.token, 'Push token is required');
    await this.ensureUniqueToken(token);

    return this.prisma.pushToken.create({
      data: {
        userId,
        token,
        platform: trimToNull(dto.platform),
        deviceId: trimToNull(dto.deviceId),
        deviceName: trimToNull(dto.deviceName),
        lastSeenAt: dto.lastSeenAt ? new Date(dto.lastSeenAt) : undefined,
      },
    });
  }

  async findAll(query: PushTokenQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const search = trimToNull(query.search);

    const where: Prisma.PushTokenWhereInput = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(trimToNull(query.platform) ? { platform: trimToNull(query.platform) as string } : {}),
      ...(search
        ? {
            OR: [
              { token: { contains: search, mode: 'insensitive' } },
              { deviceName: { contains: search, mode: 'insensitive' } },
              { deviceId: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.pushToken.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pushToken.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async findOne(id: string) {
    return this.findPushTokenByIdOrThrow(id);
  }

  async update(id: string, dto: UpdatePushTokenDto) {
    await this.findPushTokenByIdOrThrow(id);
    const userId = dto.userId !== undefined ? await this.ensureUserExists(dto.userId) : undefined;
    const token =
      dto.token !== undefined ? this.normalizeRequired(dto.token, 'Push token is required') : undefined;

    if (token) {
      await this.ensureUniqueToken(token, id);
    }

    return this.prisma.pushToken.update({
      where: { id },
      data: {
        ...(userId !== undefined ? { userId } : {}),
        ...(token !== undefined ? { token } : {}),
        ...(dto.platform !== undefined ? { platform: trimToNull(dto.platform) } : {}),
        ...(dto.deviceId !== undefined ? { deviceId: trimToNull(dto.deviceId) } : {}),
        ...(dto.deviceName !== undefined ? { deviceName: trimToNull(dto.deviceName) } : {}),
        ...(dto.lastSeenAt !== undefined
          ? { lastSeenAt: dto.lastSeenAt ? new Date(dto.lastSeenAt) : null }
          : {}),
      },
    });
  }

  async delete(id: string) {
    await this.findPushTokenByIdOrThrow(id);
    await this.prisma.pushToken.delete({ where: { id } });
    return { success: true as const, id };
  }

  private async findPushTokenByIdOrThrow(id: string) {
    const pushToken = await this.prisma.pushToken.findUnique({ where: { id } });
    if (!pushToken) {
      throw new NotFoundException('Push token not found');
    }
    return pushToken;
  }

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.id;
  }

  private async ensureUniqueToken(token: string, excludedId?: string) {
    const pushToken = await this.prisma.pushToken.findFirst({
      where: {
        token,
        ...(excludedId ? { id: { not: excludedId } } : {}),
      },
      select: { id: true },
    });

    if (pushToken) {
      throw new ConflictException('Push token already exists');
    }
  }

  private normalizeRequired(value: string, message: string) {
    const normalized = trimToNull(value);
    if (!normalized) {
      throw new ConflictException(message);
    }
    return normalized;
  }
}
