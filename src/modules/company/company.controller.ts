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
import { CompanyQueryDto } from './dto/company-query.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ToggleCompanyStatusDto } from './dto/toggle-company-status.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyService } from './company.service';

@ApiTags('Companies')
@ApiBearerAuth()
@Roles('superadmin')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Create company - superadmin' })
  create(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get companies - superadmin' })
  findAll(@Query() query: CompanyQueryDto) {
    return this.companyService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by id - superadmin' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company - superadmin' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(id, dto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle company status - superadmin' })
  toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleCompanyStatusDto,
  ) {
    return this.companyService.toggleStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company - superadmin' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.companyService.delete(id);
  }
}
