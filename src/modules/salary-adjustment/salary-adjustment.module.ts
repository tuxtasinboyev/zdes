import { Module } from '@nestjs/common';
import { SalaryAdjustmentController } from './salary-adjustment.controller';
import { SalaryAdjustmentService } from './salary-adjustment.service';

@Module({
  controllers: [SalaryAdjustmentController],
  providers: [SalaryAdjustmentService],
})
export class SalaryAdjustmentModule {}
