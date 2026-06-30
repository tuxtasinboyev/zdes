import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateRefreshTokenDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;

  @ApiProperty({
    example: 'hashed-refresh-token',
  })
  @IsString()
  @MinLength(1)
  token!: string;

  @ApiProperty({
    example: '2026-06-28T10:00:00.000Z',
  })
  @IsDateString()
  expiresAt!: string;

  @ApiPropertyOptional({
    example: 'mobile',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceType?: string;

  @ApiPropertyOptional({
    example: 'Samsung A55',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceName?: string;

  @ApiPropertyOptional({
    example: 'Mozilla/5.0',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    example: '127.0.0.1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ipAddress?: string;

  @ApiPropertyOptional({
    example: '2026-06-08T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  lastUsedAt?: string;
}
