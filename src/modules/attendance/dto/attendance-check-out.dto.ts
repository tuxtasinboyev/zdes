import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class AttendanceCheckOutDto {
  @ApiProperty()
  @IsUUID()
  employeeId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  terminalId?: string;

  @ApiProperty({
    description: 'Raw base64 string or data URI image',
  })
  @IsString()
  @MinLength(10)
  imageBase64!: string;

  @ApiPropertyOptional({ example: 'image/jpeg' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contentType?: string;

  @ApiPropertyOptional({ example: '2026-06-08T18:10:00.000Z' })
  @IsOptional()
  @IsISO8601()
  eventTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
