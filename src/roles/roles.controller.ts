import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions('create_role')
  @ApiCreatedResponse({ description: 'Create role' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permissions('view_roles')
  @ApiOkResponse({ description: `List all role` })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions('view_role')
  @ApiOkResponse({ description: `Get role By id` })
  findOne(@Param('id') id: string) {
    return this.rolesService.findById(+id);
  }

  @Patch(':id')
  @Permissions('update_role')
  @ApiOkResponse({ description: `Update role` })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @Permissions('delete_role')
  @ApiOkResponse({ description: `Delete role` })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }

  @Post(':roleId/assign/:userId')
  @Permissions('assign_role')
  @ApiOkResponse({ description: `Assign role to user` })
  assignRole(@Param('roleId') roleId: string, @Param('userId') userId: string) {
    return this.rolesService.assignRoleToUser(+roleId, +userId);
  }
}
