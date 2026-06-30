import { Module } from '@nestjs/common';
import { AdvanceController } from './advance.controller';
import { AdvanceService } from './advance.service';

@Module({
  controllers: [AdvanceController],
  providers: [AdvanceService],
})
export class AdvanceModule {}
