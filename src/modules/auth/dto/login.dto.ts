import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  login!: string;

  @ApiProperty({
    example: '1234',
  })
  @IsString()
  @MinLength(1)
  password!: string;

  @ApiPropertyOptional({
    example: 'web',
  })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @ApiPropertyOptional({
    example: 'Chrome on Windows',
  })
  @IsOptional()
  @IsString()
  deviceName?: string;
}
