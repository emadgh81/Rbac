import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/roles/entities/role.entity';
import {
  IPermissionsRepository,
  PermissionsRepository,
} from './repository/permissions.repository';
import {
  IRoleRepository,
  RoleRepository,
} from 'src/roles/repository/roles.repository';
import { Permission } from './entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    {
      provide: IPermissionsRepository,
      useClass: PermissionsRepository,
    },
    {
      provide: IRoleRepository,
      useClass: RoleRepository,
    },
  ],
  exports: [IPermissionsRepository],
})
export class PermissionsModule {}
