import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/congif/prisma/prisma.service';
import { trimToNull } from '../../common/utils/helpers';
import { BranchQueryDto } from './dto/branch-query.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { ToggleBranchStatusDto } from './dto/toggle-branch-status.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBranchDto) {
    const companyId = await this.ensureCompanyExists(dto.companyId);
    const normalizedName = this.normalizeRequiredName(dto.name);
    await this.ensureNameIsUnique(companyId, normalizedName);

    return this.prisma.branch.create({
      data: {
        companyId,
        name: normalizedName,
        address: trimToNull(dto.address),
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        radius: dto.radius ?? 100,
      },
    });
  }

  async findAll(query: BranchQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const search = trimToNull(query.search);

    const where: Prisma.BranchWhereInput = {
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { address: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.branch.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.branch.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: string) {
    return this.findBranchByIdOrThrow(id);
  }

  async update(id: string, dto: UpdateBranchDto) {
    const existing = await this.findBranchByIdOrThrow(id);
    const companyId = dto.companyId
      ? await this.ensureCompanyExists(dto.companyId)
      : existing.companyId;
    const normalizedName = dto.name ? this.normalizeRequiredName(dto.name) : existing.name;

    await this.ensureNameIsUnique(companyId, normalizedName, id);

    return this.prisma.branch.update({
      where: { id },
      data: {
        companyId,
        name: normalizedName,
        ...(dto.address !== undefined ? { address: trimToNull(dto.address) } : {}),
        ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
        ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
        ...(dto.radius !== undefined ? { radius: dto.radius } : {}),
      },
    });
  }

  async toggleStatus(id: string, dto: ToggleBranchStatusDto) {
    const branch = await this.findBranchByIdOrThrow(id);
    const nextIsActive = dto.isActive ?? !branch.isActive;

    return this.prisma.branch.update({
      where: { id },
      data: { isActive: nextIsActive },
    });
  }

  async delete(id: string) {
    await this.findBranchByIdOrThrow(id);
    await this.prisma.branch.delete({ where: { id } });
    return { success: true as const, id };
  }

  private async findBranchByIdOrThrow(id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  private async ensureCompanyExists(companyId: string): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company.id;
  }

  private async ensureNameIsUnique(
    companyId: string,
    name: string,
    excludedId?: string,
  ): Promise<void> {
    const existing = await this.prisma.branch.findFirst({
      where: { companyId, name, ...(excludedId ? { id: { not: excludedId } } : {}) },
    });
    if (existing) throw new ConflictException('Branch name already exists in this company');
  }

  private normalizeRequiredName(name: string): string {
    const normalized = trimToNull(name);
    if (!normalized) throw new ConflictException('Branch name is required');
    return normalized;
  }
}
