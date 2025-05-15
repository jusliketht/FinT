import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: () => null,
      secretOrKey: 'dummy-secret',
    });
  }

  async validate() {
    return { id: 1, username: 'dummy' };
  }
} 