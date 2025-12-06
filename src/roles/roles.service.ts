import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  IRoleRepository,
  RoleRepositoryInterface,
} from './repository/roles.repository';
import {
  IUserRepository,
  UserRepositoryInterface,
} from 'src/users/repository/user.repository';

@Injectable()
export class RolesService {
  constructor(
    @Inject(IRoleRepository)
    private readonly roleRepo: RoleRepositoryInterface,
    @Inject(IUserRepository)
    private readonly userRepo: UserRepositoryInterface,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    const exists = await this.roleRepo.findByName(createRoleDto.name);
    if (exists) throw new ConflictException(`Role already exists`);
    return this.roleRepo.createAndSave(createRoleDto);
  }

  async findAll() {
    return this.roleRepo.findAll();
  }

  async findById(id: number) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new NotFoundException(`Role not found`);
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new NotFoundException(`Role not found`);
    if (updateRoleDto.name) role.name = updateRoleDto.name;
    return this.roleRepo.save(role);
  }

  async remove(id: number) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new NotFoundException(`Role not found`);
    await this.roleRepo.remove(role);
    return { deleted: true };
  }

  async assignRoleToUser(roleId: number, userId: number) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException(`User not found`);

    const role = await this.roleRepo.findById(roleId);
    if (!role) throw new NotFoundException(`Role not found`);

    user.roles = [...(user.roles || []), role];
    await this.userRepo.save(user);
    return user;
  }
}
