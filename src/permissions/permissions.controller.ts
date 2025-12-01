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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@ApiTags('permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Permissions('create_permission')
  @ApiCreatedResponse({ description: 'Create permission' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Permissions('view_permissions')
  @ApiOkResponse({ description: 'List all permission' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @Permissions('view_permission')
  @ApiOkResponse({ description: 'Get permission by id' })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findById(+id);
  }

  @Patch(':id')
  @Permissions('update_permission')
  @ApiOkResponse({ description: 'Update permission' })
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @Permissions('delete_permission')
  @ApiOkResponse({ description: 'Delete permission' })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }

  @Post(':permissionId/assign/:roleId')
  @Permissions('assign_permission')
  @ApiOkResponse({ description: 'Assign permission to role' })
  assignPermission(
    @Param('permissionId') permissionId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.permissionsService.assignPermissionToRole(
      +permissionId,
      +roleId,
    );
  }
}
