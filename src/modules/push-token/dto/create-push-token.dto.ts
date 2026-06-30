import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreatePushTokenDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;

  @ApiProperty({
    example: 'ExponentPushToken[xxxx]',
  })
  @IsString()
  @MinLength(1)
  token!: string;

  @ApiPropertyOptional({
    example: 'android',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  platform?: string;

  @ApiPropertyOptional({
    example: 'device-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceId?: string;

  @ApiPropertyOptional({
    example: 'Samsung A55',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceName?: string;

  @ApiPropertyOptional({
    example: '2026-06-08T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  lastSeenAt?: string;
}
