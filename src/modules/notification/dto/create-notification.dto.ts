import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationIcon } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    example: 'Payroll ready',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    example: 'June payroll has been prepared',
  })
  @IsString()
  @MinLength(1)
  message!: string;

  @ApiPropertyOptional({
    enum: NotificationIcon,
    example: NotificationIcon.money,
  })
  @IsOptional()
  @IsEnum(NotificationIcon)
  icon?: NotificationIcon;

  @ApiPropertyOptional({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
