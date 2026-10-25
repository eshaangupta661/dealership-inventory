import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SafeUser, UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<SafeUser> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      return await this.usersService.create(dto.email, passwordHash);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: await this.jwtService.signAsync({ sub: user.id, role: user.role }),
    };
  }

  async getCurrentUser(id: number): Promise<SafeUser> {
    const user = await this.usersService.findSafeById(id);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }
}
