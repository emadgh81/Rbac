import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import {
  IPermissionsRepository,
  PermissionsRepositoryInterface,
} from './repository/permissions.repository';
import {
  IRoleRepository,
  RoleRepositoryInterface,
} from 'src/roles/repository/roles.repository';

@Injectable()
export class PermissionsService {
  constructor(
    @Inject(IPermissionsRepository)
    private readonly permissionRepo: PermissionsRepositoryInterface,
    @Inject(IRoleRepository) private readonly roleRepo: RoleRepositoryInterface,
  ) {}
  async create(createPermissionDto: CreatePermissionDto) {
    const exists = await this.permissionRepo.findByName(
      createPermissionDto.name,
    );
    if (exists) throw new ConflictException(`Permission already exists`);
    return this.permissionRepo.createAndSave(createPermissionDto);
  }

  async findAll() {
    return this.permissionRepo.findAll();
  }

  async findById(id: number) {
    const permission = await this.permissionRepo.findById(id);
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionRepo.findById(id);
    if (!permission) throw new NotFoundException('Permission not found');
    if (updatePermissionDto.name) permission.name = updatePermissionDto.name;
    return this.permissionRepo.save(permission);
  }

  async remove(id: number) {
    const permission = await this.permissionRepo.findById(id);
    if (!permission) throw new NotFoundException('Permission not found');
    await this.permissionRepo.remove(permission);
  }

  async assignPermissionToRole(permissionId: number, roleId: number) {
    const permission = await this.permissionRepo.findById(permissionId);
    if (!permission) throw new NotFoundException('Permission not found');

    const role = await this.roleRepo.findById(roleId);
    if (!role) throw new NotFoundException('Role not found');

    role.permissions = [...(role.permissions || []), permission];
    await this.roleRepo.save(role);
    return role;
  }
}
