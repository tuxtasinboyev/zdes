import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateRawAttendanceLogDto } from './dto/create-raw-attendance-log.dto';
import { RawAttendanceLogQueryDto } from './dto/raw-attendance-log-query.dto';
import { UpdateRawAttendanceLogDto } from './dto/update-raw-attendance-log.dto';
import { RawAttendanceLogService } from './raw-attendance-log.service';

@ApiTags('Raw Attendance Logs')
@ApiBearerAuth()
@Roles('superadmin', 'admin', 'manager')
@Controller('raw-attendance-logs')
export class RawAttendanceLogController {
  constructor(private readonly rawAttendanceLogService: RawAttendanceLogService) {}

  @Post()
  @ApiOperation({ summary: 'Create raw attendance log - superadmin, admin, manager' })
  create(@Body() dto: CreateRawAttendanceLogDto) {
    return this.rawAttendanceLogService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get raw attendance logs - superadmin, admin, manager' })
  findAll(@Query() query: RawAttendanceLogQueryDto) {
    return this.rawAttendanceLogService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get raw attendance log by id - superadmin, admin, manager' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rawAttendanceLogService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update raw attendance log - superadmin, admin, manager' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRawAttendanceLogDto) {
    return this.rawAttendanceLogService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete raw attendance log - superadmin, admin, manager' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.rawAttendanceLogService.delete(id);
  }
}
