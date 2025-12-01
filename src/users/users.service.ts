import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUserRepository } from './repository/user.repository';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const exists = await this.userRepo.findByEmail(createUserDto.email);
    if (exists) throw new ConflictException(`Email already exists`);

    const hashed = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userRepo.createAndSave({
      fname: createUserDto.fname,
      lname: createUserDto.lname,
      email: createUserDto.email,
      password: hashed,
    });

    return plainToInstance(User, user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepo.findAll();
    return users.map((u) => plainToInstance(User, u));
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException(`User not found`);
    return plainToInstance(User, user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new NotFoundException(`User not found`);
    return plainToInstance(User, user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException(`User not found`);

    if (updateUserDto.password)
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    if (updateUserDto.fname) user.fname = updateUserDto.fname;
    if (updateUserDto.lname) user.lname = updateUserDto.lname;
    if (updateUserDto.email) user.email = updateUserDto.email;

    const svaed = await this.userRepo.save(user);
    return plainToInstance(User, svaed);
  }

  async remove(id: number) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException(`User not found`);

    await this.userRepo.remove(user);
    return { deleted: true };
  }
}
