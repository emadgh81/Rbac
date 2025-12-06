import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,

    @InjectRepository(Role)
    private roleRepo: Repository<Role>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async run() {
    console.log('========== RBAC SEED STARTED ==========');

    const permissionsList = [
      'create_user',
      'view_users',
      'view_user',
      'update_user',
      'delete_user',

      'create_role',
      'view_roles',
      'view_role',
      'update_role',
      'delete_role',
      'assign_role',

      'create_permission',
      'view_permissions',
      'view_permission',
      'update_permission',
      'delete_permission',
      'assign_permission',
    ];

    const permissions = [] as Permission[];

    for (const name of permissionsList) {
      let perm = await this.permissionRepo.findOne({ where: { name } });

      if (!perm) {
        perm = this.permissionRepo.create({ name });
        await this.permissionRepo.save(perm);
        console.log(`Created permission: ${name}`);
      }

      permissions.push(perm);
    }

    let adminRole = await this.roleRepo.findOne({
      where: { name: 'Admin' },
      relations: ['permissions'],
    });

    if (!adminRole) {
      adminRole = this.roleRepo.create({
        name: 'Admin',
        permissions,
      });
      await this.roleRepo.save(adminRole);
      console.log('Admin role created');
    } else {
      adminRole.permissions = permissions;
      await this.roleRepo.save(adminRole);
      console.log('Admin role updated');
    }

    const adminEmail = 'admin@example.com';

    let adminUser = await this.userRepo.findOne({
      where: { email: adminEmail },
      relations: ['roles'],
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);

      adminUser = this.userRepo.create({
        fname: 'Super',
        lname: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        roles: [adminRole],
      });

      await this.userRepo.save(adminUser);
      console.log('Admin user created');
    } else {
      if (!adminUser.roles.find((r) => r.name === 'Admin')) {
        adminUser.roles.push(adminRole);
        await this.userRepo.save(adminUser);
      }
      console.log('Admin user already exists, role ensured');
    }

    console.log('========== RBAC SEED COMPLETED ==========');
  }
}
