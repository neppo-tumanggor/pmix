import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AUTH_CONFIG } from '../constants/auth.config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: AUTH_CONFIG.JWT.SECRET,
    });
  }

  /**
   * Validate JWT payload and return user
   * @param payload - JWT payload
   * @returns User object
   * @throws UnauthorizedException if user not found
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // In a real app, you would fetch the user from database here
    // and check if they still exist and are not deleted
    // For now, we just return the payload
    return payload;
  }
}
