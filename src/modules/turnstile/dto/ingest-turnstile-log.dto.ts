import { TerminalEventType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class IngestTurnstileLogDto {
  @ApiProperty({
    example: 'TRN-001',
  })
  @IsString()
  @MinLength(1)
  terminalSerialNumber!: string;

  @ApiProperty({
    example: '1001',
  })
  @IsString()
  @MinLength(1)
  deviceUserId!: string;

  @ApiProperty({
    example: '2026-06-06T08:30:00.000Z',
  })
  @IsISO8601()
  eventTime!: string;

  @ApiProperty({
    enum: ['check_in', 'check_out', 'unknown'],
  })
  @IsEnum(TerminalEventType)
  eventType!: TerminalEventType;

  @ApiPropertyOptional({
    type: Object,
  })
  @IsOptional()
  @IsObject()
  rawPayload?: Record<string, unknown> | null;
}
