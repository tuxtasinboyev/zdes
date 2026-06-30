import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/congif/prisma/prisma.service';
import { AppVersionQueryDto } from './dto/app-version-query.dto';
import { CreateAppVersionDto } from './dto/create-app-version.dto';
import { UpdateAppVersionDto } from './dto/update-app-version.dto';

@Injectable()
export class AppVersionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAppVersionDto) {
    return this.prisma.appVersion.create({
      data: {
        android: dto.android as Prisma.InputJsonValue | undefined,
        ios: dto.ios as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async findAll(query: AppVersionQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.appVersion.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.appVersion.count(),
    ]);

    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async findOne(id: string) {
    return this.findAppVersionByIdOrThrow(id);
  }

  async update(id: string, dto: UpdateAppVersionDto) {
    await this.findAppVersionByIdOrThrow(id);

    return this.prisma.appVersion.update({
      where: { id },
      data: {
        ...(dto.android !== undefined ? { android: dto.android as Prisma.InputJsonValue } : {}),
        ...(dto.ios !== undefined ? { ios: dto.ios as Prisma.InputJsonValue } : {}),
      },
    });
  }

  async delete(id: string) {
    await this.findAppVersionByIdOrThrow(id);
    await this.prisma.appVersion.delete({ where: { id } });
    return { success: true as const, id };
  }

  private async findAppVersionByIdOrThrow(id: string) {
    const appVersion = await this.prisma.appVersion.findUnique({ where: { id } });
    if (!appVersion) {
      throw new NotFoundException('App version not found');
    }
    return appVersion;
  }
}
