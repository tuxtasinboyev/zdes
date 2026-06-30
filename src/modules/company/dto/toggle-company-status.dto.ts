import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ToggleCompanyStatusDto {
  @ApiPropertyOptional({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
