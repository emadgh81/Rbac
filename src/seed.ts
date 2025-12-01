import { DataSource } from 'typeorm';
import dataSource from './data.source';
import { Permission } from './permissions/entities/permission.entity';
import { Role } from './roles/entities/role.entity';
import { User } from './users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const ds: DataSource = await dataSource.initialize();

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

  const permissionRepo = ds.getRepository(Permission);
  const roleRepo = ds.getRepository(Role);
  const userRepo = ds.getRepository(User);

  const permissions: Permission[] = [];

  for (const name of permissionsList) {
    let perm = await permissionRepo.findOne({ where: { name } });

    if (!perm) {
      perm = permissionRepo.create({ name });
      await permissionRepo.save(perm);
      console.log(`Created permission: ${name}`);
    }

    permissions.push(perm);
  }

  let adminRole = await roleRepo.findOne({
    where: { name: 'Admin' },
    relations: ['permissions'],
  });

  if (!adminRole) {
    adminRole = roleRepo.create({
      name: 'Admin',
      permissions: permissions,
    });
    await roleRepo.save(adminRole);
    console.log('Admin role created with all permissions');
  } else {
    adminRole.permissions = permissions;
    await roleRepo.save(adminRole);
    console.log('Admin role updated with all permissions');
  }

  const adminEmail = 'admin@example.com';

  let adminUser = await userRepo.findOne({
    where: { email: adminEmail },
    relations: ['roles'],
  });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    adminUser = userRepo.create({
      fname: 'Super',
      lname: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      roles: [adminRole],
    });

    await userRepo.save(adminUser);

    console.log('Admin user created');
  } else {
    if (!adminUser.roles.find((r) => r.name === 'Admin')) {
      adminUser.roles.push(adminRole);
      await userRepo.save(adminUser);
    }
    console.log('Admin user already exists, role ensured');
  }

  console.log('========== RBAC SEED COMPLETED ==========');
  process.exit(0);
}

seed();
