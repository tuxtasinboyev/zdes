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
import { BranchQueryDto } from './dto/branch-query.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { ToggleBranchStatusDto } from './dto/toggle-branch-status.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchService } from './branch.service';

@ApiTags('Branches')
@ApiBearerAuth()
@Roles('superadmin')
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @ApiOperation({ summary: 'Create branch - superadmin' })
  create(@Body() dto: CreateBranchDto) {
    return this.branchService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get branches - superadmin' })
  findAll(@Query() query: BranchQueryDto) {
    return this.branchService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by id - superadmin' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.branchService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update branch - superadmin' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBranchDto) {
    return this.branchService.update(id, dto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle branch status - superadmin' })
  toggleStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ToggleBranchStatusDto) {
    return this.branchService.toggleStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete branch - superadmin' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.branchService.delete(id);
  }
}
