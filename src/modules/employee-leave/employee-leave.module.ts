import { Module } from '@nestjs/common';
import { EmployeeLeaveController } from './employee-leave.controller';
import { EmployeeLeaveService } from './employee-leave.service';

@Module({
  controllers: [EmployeeLeaveController],
  providers: [EmployeeLeaveService],
})
export class EmployeeLeaveModule {}
