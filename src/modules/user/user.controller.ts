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
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ToggleUserBlockedDto } from './dto/toggle-user-blocked.dto';
import { ToggleUserStatusDto } from './dto/toggle-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Roles('superadmin')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create user - superadmin' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get users - superadmin' })
  findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id - superadmin' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user - superadmin' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle user status - superadmin' })
  toggleStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ToggleUserStatusDto) {
    return this.userService.toggleStatus(id, dto);
  }

  @Patch(':id/toggle-blocked')
  @ApiOperation({ summary: 'Toggle user blocked state - superadmin' })
  toggleBlocked(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ToggleUserBlockedDto) {
    return this.userService.toggleBlocked(id, dto);
  }

  @Patch(':id/change-password')
  @ApiOperation({ summary: 'Change user password - superadmin' })
  changePassword(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user - superadmin' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.delete(id);
  }
}
