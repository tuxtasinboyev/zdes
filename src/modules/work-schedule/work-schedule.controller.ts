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
import { AssignUserDto } from './dto/assign-user.dto';
import { CreateWorkScheduleDto } from './dto/create-work-schedule.dto';
import { ToggleWorkScheduleStatusDto } from './dto/toggle-work-schedule-status.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';
import { WorkScheduleQueryDto } from './dto/work-schedule-query.dto';
import { WorkScheduleService } from './work-schedule.service';

@ApiTags('Work Schedules')
@ApiBearerAuth()
@Roles('superadmin')
@Controller('work-schedules')
export class WorkScheduleController {
  constructor(private readonly workScheduleService: WorkScheduleService) {}

  @Post()
  @ApiOperation({ summary: 'Create work schedule - superadmin' })
  create(@Body() dto: CreateWorkScheduleDto) {
    return this.workScheduleService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get work schedules - superadmin' })
  findAll(@Query() query: WorkScheduleQueryDto) {
    return this.workScheduleService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get work schedule by id - superadmin' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workScheduleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update work schedule - superadmin' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWorkScheduleDto) {
    return this.workScheduleService.update(id, dto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle work schedule status - superadmin' })
  toggleStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ToggleWorkScheduleStatusDto) {
    return this.workScheduleService.toggleStatus(id, dto);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Set work schedule as company default - superadmin' })
  setDefault(@Param('id', ParseUUIDPipe) id: string) {
    return this.workScheduleService.setDefault(id);
  }

  @Patch(':id/assign-user')
  @ApiOperation({ summary: 'Assign work schedule to a user - superadmin' })
  assignUser(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignUserDto) {
    return this.workScheduleService.assignUser(id, dto);
  }

  @Patch(':id/unassign-user')
  @ApiOperation({ summary: 'Remove work schedule from a user - superadmin' })
  unassignUser(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignUserDto) {
    return this.workScheduleService.unassignUser(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete work schedule - superadmin' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.workScheduleService.delete(id);
  }
}
