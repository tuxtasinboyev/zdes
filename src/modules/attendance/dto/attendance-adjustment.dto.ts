import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdjustmentCategory, AdjustmentType } from '@prisma/client';

export class AttendanceAdjustmentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: AdjustmentType })
  type!: AdjustmentType;

  @ApiProperty({ enum: AdjustmentCategory })
  category!: AdjustmentCategory;

  @ApiProperty({ example: 15000 })
  amount!: number;

  @ApiProperty()
  date!: Date;

  @ApiProperty()
  month!: string;

  @ApiPropertyOptional({ nullable: true })
  reason!: string | null;
}
