import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { PermissionEnum } from 'src/common/enum/permissions.enum';
import { RoleEnum } from 'src/common/enum/roles.enum';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,

    @InjectRepository(Role)
    private roleRepo: Repository<Role>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    console.log('========== RBAC SEED STARTED ==========');

    const permissions: Permission[] = [];
    for (const name of Object.values(PermissionEnum)) {
      let perm = await this.permissionRepo.findOne({ where: { name } });
      if (!perm) {
        perm = this.permissionRepo.create({ name });
        await this.permissionRepo.save(perm);
        console.log(`Created permission: ${name}`);
      }
      permissions.push(perm);
    }

    let adminRole = await this.roleRepo.findOne({
      where: { name: RoleEnum.ADMIN },
      relations: ['permissions'],
    });

    if (!adminRole) {
      adminRole = this.roleRepo.create({
        name: RoleEnum.ADMIN,
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
      if (!adminUser.roles.find((r) => r.name === (RoleEnum.ADMIN as string))) {
        adminUser.roles.push(adminRole);
        await this.userRepo.save(adminUser);
        console.log('Admin role added to existing user');
      } else {
        console.log('Admin user already exists with role');
      }
    }

    console.log('========== RBAC SEED COMPLETED ==========');
  }
}
