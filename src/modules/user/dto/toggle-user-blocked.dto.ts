import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ToggleUserBlockedDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;
}
