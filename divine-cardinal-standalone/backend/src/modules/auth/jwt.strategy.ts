import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'kalvix_nexus_secret_key_change_me_in_production_12345678',
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    console.log('User found in DB:', user ? user.id : 'null');
    if (!user) {
      throw new UnauthorizedException();
    }
    const { passwordHash, ...safeUser } = user;
    return { ...safeUser, requiresPasswordSetup: !passwordHash };
  }
}
