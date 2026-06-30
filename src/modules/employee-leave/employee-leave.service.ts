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
import { CreateEmployeeLeaveDto } from './dto/create-employee-leave.dto';
import { EmployeeLeaveQueryDto } from './dto/employee-leave-query.dto';
import { UpdateEmployeeLeaveDto } from './dto/update-employee-leave.dto';

@Injectable()
export class EmployeeLeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmployeeLeaveDto, actor: AccessTokenPayload) {
    const companyId = await this.ensureCompanyExists(dto.companyId);
    const branchId = await this.resolveBranchId(companyId, dto.branchId);
    const employee = await this.ensureEmployeeBelongsToCompany(dto.employeeId, companyId);
    const fromDate = new Date(dto.fromDate);
    const toDate = new Date(dto.toDate);

    this.ensureDateRange(fromDate, toDate, 'Leave end date must be after start date');

    if (branchId && employee.branchId && employee.branchId !== branchId) {
      throw new ConflictException('Employee does not belong to the selected branch');
    }

    const days = this.resolveDays(dto.days, fromDate, toDate);

    return this.prisma.employeeLeave.create({
      data: {
        companyId,
        branchId,
        employeeId: employee.id,
        type: dto.type,
        fromDate,
        toDate,
        days,
        affectsSalary: dto.affectsSalary ?? false,
        reason: trimToNull(dto.reason),
        createdById: actor.sub,
        updatedById: actor.sub,
      },
    });
  }

  async findAll(query: EmployeeLeaveQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const search = trimToNull(query.search);

    const where: Prisma.EmployeeLeaveWhereInput = {
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.affectsSalary !== undefined ? { affectsSalary: query.affectsSalary } : {}),
      ...(search ? { reason: { contains: search, mode: 'insensitive' } } : {}),
      ...this.buildDateOverlapFilter(query.dateFrom, query.dateTo),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.employeeLeave.findMany({
        where,
        orderBy: [{ fromDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.employeeLeave.count({ where }),
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
    return this.findEmployeeLeaveByIdOrThrow(id);
  }

  async update(id: string, dto: UpdateEmployeeLeaveDto, actor: AccessTokenPayload) {
    const existing = await this.findEmployeeLeaveByIdOrThrow(id);
    const companyId =
      dto.companyId !== undefined
        ? await this.ensureCompanyExists(dto.companyId)
        : existing.companyId;
    const branchId =
      dto.branchId !== undefined
        ? await this.resolveBranchId(companyId, dto.branchId)
        : await this.resolveBranchId(companyId, existing.branchId);
    const employee =
      dto.employeeId !== undefined
        ? await this.ensureEmployeeBelongsToCompany(dto.employeeId, companyId)
        : await this.ensureEmployeeBelongsToCompany(existing.employeeId, companyId);
    const fromDate = dto.fromDate ? new Date(dto.fromDate) : existing.fromDate;
    const toDate = dto.toDate ? new Date(dto.toDate) : existing.toDate;

    this.ensureDateRange(fromDate, toDate, 'Leave end date must be after start date');

    if (branchId && employee.branchId && employee.branchId !== branchId) {
      throw new ConflictException('Employee does not belong to the selected branch');
    }

    const days =
      dto.days !== undefined
        ? this.resolveDays(dto.days, fromDate, toDate)
        : dto.fromDate || dto.toDate
          ? this.resolveDays(undefined, fromDate, toDate)
          : existing.days;

    return this.prisma.employeeLeave.update({
      where: { id },
      data: {
        companyId,
        branchId,
        employeeId: employee.id,
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        fromDate,
        toDate,
        days,
        ...(dto.affectsSalary !== undefined ? { affectsSalary: dto.affectsSalary } : {}),
        ...(dto.reason !== undefined ? { reason: trimToNull(dto.reason) } : {}),
        updatedById: actor.sub,
      },
    });
  }

  async delete(id: string) {
    await this.findEmployeeLeaveByIdOrThrow(id);

    await this.prisma.employeeLeave.delete({
      where: { id },
    });

    return {
      success: true as const,
      id,
    };
  }

  private async findEmployeeLeaveByIdOrThrow(id: string) {
    const employeeLeave = await this.prisma.employeeLeave.findUnique({
      where: { id },
    });

    if (!employeeLeave) {
      throw new NotFoundException('Employee leave not found');
    }

    return employeeLeave;
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

  private async ensureEmployeeBelongsToCompany(employeeId: string, companyId: string) {
    const employee = await this.prisma.user.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        companyId: true,
        branchId: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.companyId !== companyId) {
      throw new ConflictException('Employee does not belong to the selected company');
    }

    return employee;
  }

  private ensureDateRange(startDate: Date, endDate: Date, message: string): void {
    if (endDate < startDate) {
      throw new BadRequestException(message);
    }
  }

  private resolveDays(days: number | undefined, fromDate: Date, toDate: Date): number {
    if (days !== undefined) {
      return days;
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((toDate.getTime() - fromDate.getTime()) / millisecondsPerDay) + 1;
  }

  private buildDateOverlapFilter(
    dateFrom?: string,
    dateTo?: string,
  ): Prisma.EmployeeLeaveWhereInput {
    if (!dateFrom && !dateTo) {
      return {};
    }

    const fromDate = dateFrom ? new Date(dateFrom) : undefined;
    const toDate = dateTo ? new Date(dateTo) : undefined;

    return {
      AND: [
        ...(toDate ? [{ fromDate: { lte: toDate } }] : []),
        ...(fromDate ? [{ toDate: { gte: fromDate } }] : []),
      ],
    };
  }
}
