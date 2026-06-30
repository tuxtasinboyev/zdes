import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignUserDto {
  @ApiProperty({ example: 'uuid-user-id' })
  @IsUUID()
  userId!: string;
}
