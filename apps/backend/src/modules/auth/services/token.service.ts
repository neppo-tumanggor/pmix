import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../entities/user.entity';
import { JwtPayload, RefreshTokenPayload } from '../interfaces/jwt-payload.interface';
import { AUTH_CONFIG } from '../constants/auth.config';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generate access token
   * @param user - User object
   * @returns JWT access token
   */
  generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: AUTH_CONFIG.JWT.SECRET,
      expiresIn: AUTH_CONFIG.JWT.EXPIRY,
    });
  }

  /**
   * Generate refresh token
   * @param user - User object
   * @returns JWT refresh token
   */
  generateRefreshToken(user: User): string {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: AUTH_CONFIG.JWT.REFRESH_SECRET,
      expiresIn: AUTH_CONFIG.JWT.REFRESH_EXPIRY,
    });
  }

  /**
   * Verify access token
   * @param token - JWT access token
   * @returns JWT payload
   * @throws UnauthorizedException if token is invalid
   */
  verifyAccessToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: AUTH_CONFIG.JWT.SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token', 'INVALID_TOKEN');
    }
  }

  /**
   * Verify refresh token
   * @param token - JWT refresh token
   * @returns Refresh token payload
   * @throws UnauthorizedException if token is invalid
   */
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(token, {
        secret: AUTH_CONFIG.JWT.REFRESH_SECRET,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type', 'INVALID_REFRESH_TOKEN');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }
  }

  /**
   * Decode token without verification (for debugging)
   * @param token - JWT token
   * @returns Decoded payload
   */
  decodeToken(token: string): JwtPayload | RefreshTokenPayload {
    return this.jwtService.decode(token);
  }
}
