import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async updateProfile(userId: string, data: { name: string; email: string }) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check email uniqueness
    const existing = await this.usersRepository.findOne({ where: { email: data.email } });
    if (existing && existing.id !== userId) {
      throw new BadRequestException('Email already in use');
    }

    user.name = data.name;
    user.email = data.email;
    const saved = await this.usersRepository.save(user);
    const { passwordHash, ...profile } = saved;
    return { user: profile };
  }

  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(data.newPassword, 10);
    await this.usersRepository.save(user);
    return { success: true };
  }
}
