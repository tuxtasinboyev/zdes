import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class CreateAppVersionDto {
  @ApiPropertyOptional({
    example: { latest: '1.0.0', minRequired: '1.0.0' },
  })
  @IsOptional()
  @IsObject()
  android?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: { latest: '1.0.0', minRequired: '1.0.0' },
  })
  @IsOptional()
  @IsObject()
  ios?: Record<string, unknown>;
}
