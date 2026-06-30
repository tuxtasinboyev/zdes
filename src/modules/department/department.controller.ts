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
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentQueryDto } from './dto/department-query.dto';
import { ToggleDepartmentStatusDto } from './dto/toggle-department-status.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentService } from './department.service';

@ApiTags('Departments')
@ApiBearerAuth()
@Roles('superadmin')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create department - superadmin' })
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get departments - superadmin' })
  findAll(@Query() query: DepartmentQueryDto) {
    return this.departmentService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by id - superadmin' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update department - superadmin' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentService.update(id, dto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle department status - superadmin' })
  toggleStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ToggleDepartmentStatusDto) {
    return this.departmentService.toggleStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department - superadmin' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.delete(id);
  }
}
