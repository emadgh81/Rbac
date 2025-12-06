import { Injectable } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export const IRoleRepository = 'IRoleRepository';

export interface RoleRepositoryInterface {
  findAll(): Promise<Role[]>;
  findById(id: number): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  createAndSave(roleLike: Partial<Role>): Promise<Role>;
  save(role: Role): Promise<Role>;
  remove(role: Role): Promise<void>;
}

@Injectable()
export class RoleRepository implements RoleRepositoryInterface {
  constructor(
    @InjectRepository(Role) private readonly repo: Repository<Role>,
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

  createAndSave(roleLike: Partial<Role>) {
    const role = this.repo.create(roleLike);
    return this.repo.save(role);
  }

  save(role: Role) {
    return this.repo.save(role);
  }

  async remove(role: Role) {
    await this.repo.remove(role);
  }
}
