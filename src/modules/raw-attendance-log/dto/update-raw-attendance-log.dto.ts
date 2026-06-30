import { PartialType } from '@nestjs/swagger';
import { CreateRawAttendanceLogDto } from './create-raw-attendance-log.dto';

export class UpdateRawAttendanceLogDto extends PartialType(CreateRawAttendanceLogDto) {}
