import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'NewStrongPass123' })
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  newPassword!: string;
}
