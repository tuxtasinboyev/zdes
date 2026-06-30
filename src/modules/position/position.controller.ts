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
import { CreatePositionDto } from './dto/create-position.dto';
import { PositionQueryDto } from './dto/position-query.dto';
import { TogglePositionStatusDto } from './dto/toggle-position-status.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionService } from './position.service';

@ApiTags('Positions')
@ApiBearerAuth()
@Roles('superadmin')
@Controller('positions')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  @ApiOperation({ summary: 'Create position - superadmin' })
  create(@Body() dto: CreatePositionDto) {
    return this.positionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get positions - superadmin' })
  findAll(@Query() query: PositionQueryDto) {
    return this.positionService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get position by id - superadmin' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update position - superadmin' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePositionDto) {
    return this.positionService.update(id, dto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle position status - superadmin' })
  toggleStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: TogglePositionStatusDto) {
    return this.positionService.toggleStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete position - superadmin' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionService.delete(id);
  }
}
