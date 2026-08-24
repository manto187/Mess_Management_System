import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    console.log('Login attempt for:', dto.email);
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    
    if (!user) {
      console.log('User not found in database');
      throw new UnauthorizedException('ای میل یا پاسورڈ غلط ہے');
    }

    console.log('User found, checking password...');
    const valid = await bcrypt.compare(dto.password, user.password);
    
    if (!valid) {
      console.log('Password mismatch');
      throw new UnauthorizedException('ای میل یا پاسورڈ غلط ہے');
    }

    console.log('Login successful!');
    const { password: _, ...safeUser } = user;
    const token = this.signToken(user.id, user.email, user.role);
    
    return { 
      message: 'لاگ ان کامیاب ہوا', 
      data: { user: safeUser, token } 
    };
  }

  async signup(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new UnauthorizedException('یہ ای میل پہلے سے موجود ہے');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        role: 'MUNSHI',
      },
    });

    const { password: _, ...safeUser } = user;
    const token = this.signToken(user.id, user.email, user.role);

    return {
      message: 'اکاؤنٹ کامیابی سے بن گیا',
      data: { user: safeUser, token },
    };
  }

  private signToken(userId: string, email: string, role: string) {
    return this.jwtService.sign({ sub: userId, email, role });
  }
}
