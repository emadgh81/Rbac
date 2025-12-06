import { Injectable } from '@nestjs/common';
import { Permission } from '../entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export const IPermissionsRepository = 'IPermissionsRepository';

export interface PermissionsRepositoryInterface {
  findAll(): Promise<Permission[]>;
  findById(id: number): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  createAndSave(permissionLike: Partial<Permission>): Promise<Permission>;
  save(permission: Permission): Promise<Permission>;
  remove(permission: Permission): Promise<void>;
}

@Injectable()
export class PermissionsRepository implements PermissionsRepositoryInterface {
  constructor(
    @InjectRepository(Permission) private readonly repo: Repository<Permission>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByName(name: string) {
    return this.repo.findOne({ where: { name } });
  }

  createAndSave(permissionLike: Partial<Permission>) {
    const permission = this.repo.create(permissionLike);
    return this.repo.save(permission);
  }

  save(permission: Permission) {
    return this.repo.save(permission);
  }

  async remove(permission: Permission) {
    await this.repo.remove(permission);
  }
}
