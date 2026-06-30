import { ApiPropertyOptional } from '@nestjs/swagger';
import { TerminalStatus, TerminalType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class TerminalQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({
    enum: TerminalType,
  })
  @IsOptional()
  @IsEnum(TerminalType)
  type?: TerminalType;

  @ApiPropertyOptional({
    enum: TerminalStatus,
  })
  @IsOptional()
  @IsEnum(TerminalStatus)
  status?: TerminalStatus;

  @ApiPropertyOptional({
    example: 'TRN-001',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
