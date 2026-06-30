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
import { CreatePushTokenDto } from './dto/create-push-token.dto';
import { PushTokenQueryDto } from './dto/push-token-query.dto';
import { UpdatePushTokenDto } from './dto/update-push-token.dto';
import { PushTokenService } from './push-token.service';

@ApiTags('Push Tokens')
@ApiBearerAuth()
@Roles('superadmin', 'admin', 'manager')
@Controller('push-tokens')
export class PushTokenController {
  constructor(private readonly pushTokenService: PushTokenService) {}

  @Post()
  @ApiOperation({ summary: 'Create push token - superadmin, admin, manager' })
  create(@Body() dto: CreatePushTokenDto) {
    return this.pushTokenService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get push tokens - superadmin, admin, manager' })
  findAll(@Query() query: PushTokenQueryDto) {
    return this.pushTokenService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get push token by id - superadmin, admin, manager' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pushTokenService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update push token - superadmin, admin, manager' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePushTokenDto) {
    return this.pushTokenService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete push token - superadmin, admin, manager' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.pushTokenService.delete(id);
  }
}
