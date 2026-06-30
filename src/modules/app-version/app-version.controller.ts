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
import { AppVersionQueryDto } from './dto/app-version-query.dto';
import { CreateAppVersionDto } from './dto/create-app-version.dto';
import { UpdateAppVersionDto } from './dto/update-app-version.dto';
import { AppVersionService } from './app-version.service';

@ApiTags('App Versions')
@ApiBearerAuth()
@Roles('superadmin', 'admin')
@Controller('app-versions')
export class AppVersionController {
  constructor(private readonly appVersionService: AppVersionService) {}

  @Post()
  @ApiOperation({ summary: 'Create app version - superadmin, admin' })
  create(@Body() dto: CreateAppVersionDto) {
    return this.appVersionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get app versions - superadmin, admin' })
  findAll(@Query() query: AppVersionQueryDto) {
    return this.appVersionService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get app version by id - superadmin, admin' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appVersionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update app version - superadmin, admin' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAppVersionDto) {
    return this.appVersionService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete app version - superadmin, admin' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.appVersionService.delete(id);
  }
}
