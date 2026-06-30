import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/congif/prisma/prisma.service';
import { trimToNull } from '../../common/utils/helpers';
import type { AccessTokenPayload } from '../auth/interfaces/access-token-payload.interface';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { HolidayQueryDto } from './dto/holiday-query.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidayService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateHolidayDto, actor: AccessTokenPayload) {
    const companyId = await this.ensureCompanyExists(dto.companyId);
    const branchId = await this.resolveBranchId(companyId, dto.branchId);
    const normalizedName = this.normalizeRequiredName(dto.name);
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    this.ensureDateRange(startDate, endDate, 'Holiday end date must be after start date');

    return this.prisma.holiday.create({
      data: {
        companyId,
        branchId,
        name: normalizedName,
        startDate,
        endDate,
        affectsSalary: dto.affectsSalary ?? false,
        note: trimToNull(dto.note),
        createdById: actor.sub,
        updatedById: actor.sub,
      },
    });
  }

  async findAll(query: HolidayQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const search = trimToNull(query.search);

    const where: Prisma.HolidayWhereInput = {
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.affectsSalary !== undefined ? { affectsSalary: query.affectsSalary } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      ...this.buildDateOverlapFilter(query.dateFrom, query.dateTo),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.holiday.findMany({
        where,
        orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.holiday.count({ where }),
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
    return this.findHolidayByIdOrThrow(id);
  }

  async update(id: string, dto: UpdateHolidayDto, actor: AccessTokenPayload) {
    const existing = await this.findHolidayByIdOrThrow(id);
    const companyId =
      dto.companyId !== undefined
        ? await this.ensureCompanyExists(dto.companyId)
        : existing.companyId;
    const branchId =
      dto.branchId !== undefined
        ? await this.resolveBranchId(companyId, dto.branchId)
        : await this.resolveBranchId(companyId, existing.branchId);
    const name = dto.name ? this.normalizeRequiredName(dto.name) : existing.name;
    const startDate = dto.startDate ? new Date(dto.startDate) : existing.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : existing.endDate;

    this.ensureDateRange(startDate, endDate, 'Holiday end date must be after start date');

    return this.prisma.holiday.update({
      where: { id },
      data: {
        companyId,
        branchId,
        name,
        startDate,
        endDate,
        ...(dto.affectsSalary !== undefined ? { affectsSalary: dto.affectsSalary } : {}),
        ...(dto.note !== undefined ? { note: trimToNull(dto.note) } : {}),
        updatedById: actor.sub,
      },
    });
  }

  async delete(id: string) {
    await this.findHolidayByIdOrThrow(id);

    await this.prisma.holiday.delete({
      where: { id },
    });

    return {
      success: true as const,
      id,
    };
  }

  private async findHolidayByIdOrThrow(id: string) {
    const holiday = await this.prisma.holiday.findUnique({
      where: { id },
    });

    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }

    return holiday;
  }

  private async ensureCompanyExists(companyId: string): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company.id;
  }

  private async resolveBranchId(
    companyId: string,
    branchId?: string | null,
  ): Promise<string | null> {
    if (branchId == null) {
      return null;
    }

    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true, companyId: true },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    if (branch.companyId !== companyId) {
      throw new ConflictException('Branch does not belong to the selected company');
    }

    return branch.id;
  }

  private normalizeRequiredName(name: string): string {
    const normalized = trimToNull(name);

    if (!normalized) {
      throw new ConflictException('Holiday name is required');
    }

    return normalized;
  }

  private ensureDateRange(startDate: Date, endDate: Date, message: string): void {
    if (endDate < startDate) {
      throw new BadRequestException(message);
    }
  }

  private buildDateOverlapFilter(
    dateFrom?: string,
    dateTo?: string,
  ): Prisma.HolidayWhereInput {
    if (!dateFrom && !dateTo) {
      return {};
    }

    const fromDate = dateFrom ? new Date(dateFrom) : undefined;
    const toDate = dateTo ? new Date(dateTo) : undefined;

    return {
      AND: [
        ...(toDate ? [{ startDate: { lte: toDate } }] : []),
        ...(fromDate ? [{ endDate: { gte: fromDate } }] : []),
      ],
    };
  }
}
