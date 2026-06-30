import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ToggleBranchStatusDto {
  @ApiPropertyOptional({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
