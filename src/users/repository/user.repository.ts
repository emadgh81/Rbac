import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  createAndSave(user: Partial<User>): Promise<User>;
  save(user: User): Promise<User>;
  remove(user: User): Promise<void>;
  findAll(): Promise<User[]>;
}

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
      select: ['id', 'fname', 'lname', 'email', 'password'],
      relations: ['roles'],
    });
  }

  createAndSave(user: Partial<User>) {
    const ent = this.repo.create(user);
    return this.repo.save(ent);
  }

  save(user: User) {
    return this.repo.save(user);
  }

  async remove(user: User) {
    await this.repo.remove(user);
  }

  findAll() {
    return this.repo.find();
  }
}
