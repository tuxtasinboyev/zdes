import { Module } from '@nestjs/common';
import { RawAttendanceLogController } from './raw-attendance-log.controller';
import { RawAttendanceLogService } from './raw-attendance-log.service';

@Module({
  controllers: [RawAttendanceLogController],
  providers: [RawAttendanceLogService],
})
export class RawAttendanceLogModule {}
