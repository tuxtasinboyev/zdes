import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/congif/prisma/prisma.service';
import { trimToNull } from '../../common/utils/helpers';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { TerminalQueryDto } from './dto/terminal-query.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';

@Injectable()
export class TerminalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTerminalDto) {
    const companyId = await this.ensureCompanyExists(dto.companyId);
    const branchId = await this.resolveBranchId(companyId, dto.branchId);
    const name = this.normalizeRequired(dto.name, 'Terminal name is required');
    const serialNumber = this.normalizeRequired(dto.serialNumber, 'Serial number is required');

    await this.ensureSerialNumberUnique(serialNumber);

    return this.prisma.terminal.create({
      data: {
        companyId,
        branchId,
        name,
        serialNumber,
        ipAddress: trimToNull(dto.ipAddress),
        port: dto.port,
        type: dto.type,
        status: dto.status,
        connectionConfig: dto.connectionConfig as Prisma.InputJsonValue | undefined,
        lastSyncAt: dto.lastSyncAt ? new Date(dto.lastSyncAt) : undefined,
      },
    });
  }

  async findAll(query: TerminalQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const search = trimToNull(query.search);

    const where: Prisma.TerminalWhereInput = {
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { serialNumber: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.terminal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.terminal.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async findOne(id: string) {
    return this.findTerminalByIdOrThrow(id);
  }

  async update(id: string, dto: UpdateTerminalDto) {
    const existing = await this.findTerminalByIdOrThrow(id);
    const companyId =
      dto.companyId !== undefined ? await this.ensureCompanyExists(dto.companyId) : existing.companyId;
    const branchId =
      dto.branchId !== undefined
        ? await this.resolveBranchId(companyId, dto.branchId)
        : await this.resolveBranchId(companyId, existing.branchId);
    const serialNumber =
      dto.serialNumber !== undefined
        ? this.normalizeRequired(dto.serialNumber, 'Serial number is required')
        : existing.serialNumber;

    await this.ensureSerialNumberUnique(serialNumber, id);

    return this.prisma.terminal.update({
      where: { id },
      data: {
        companyId,
        branchId,
        ...(dto.name !== undefined
          ? { name: this.normalizeRequired(dto.name, 'Terminal name is required') }
          : {}),
        serialNumber,
        ...(dto.ipAddress !== undefined ? { ipAddress: trimToNull(dto.ipAddress) } : {}),
        ...(dto.port !== undefined ? { port: dto.port } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.connectionConfig !== undefined
          ? { connectionConfig: dto.connectionConfig as Prisma.InputJsonValue }
          : {}),
        ...(dto.lastSyncAt !== undefined
          ? { lastSyncAt: dto.lastSyncAt ? new Date(dto.lastSyncAt) : null }
          : {}),
      },
    });
  }

  async delete(id: string) {
    await this.findTerminalByIdOrThrow(id);
    await this.prisma.terminal.delete({ where: { id } });
    return { success: true as const, id };
  }

  private async findTerminalByIdOrThrow(id: string) {
    const terminal = await this.prisma.terminal.findUnique({ where: { id } });
    if (!terminal) {
      throw new NotFoundException('Terminal not found');
    }
    return terminal;
  }

  private async ensureCompanyExists(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company.id;
  }

  private async resolveBranchId(companyId: string, branchId?: string | null) {
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

  private async ensureSerialNumberUnique(serialNumber: string, excludedId?: string) {
    const terminal = await this.prisma.terminal.findFirst({
      where: {
        serialNumber,
        ...(excludedId ? { id: { not: excludedId } } : {}),
      },
      select: { id: true },
    });

    if (terminal) {
      throw new ConflictException('Terminal serial number already exists');
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
