import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Session } from './entities/session.entity';
import { PasswordHistory } from './entities/password-history.entity';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { SessionService } from './services/session.service';
import { AccountLockoutService } from './services/account-lockout.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AUTH_CONFIG } from './constants/auth.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, Session, PasswordHistory]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || AUTH_CONFIG.JWT.SECRET,
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRY') || AUTH_CONFIG.JWT.EXPIRY,
        },
      }),
      inject: [ConfigService],
      global: true,
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST') || 'smtp.gmail.com',
          port: parseInt(configService.get('SMTP_PORT') || '587', 10),
          secure: false,
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get('SMTP_FROM') || 'noreply@mixer.com',
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ttl: parseInt(configService.get('AUTH_THROTTLE_TTL') || '900000', 10),
        limit: parseInt(configService.get('AUTH_THROTTLE_LIMIT') || '5', 10),
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    EmailService,
    SessionService,
    AccountLockoutService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    PasswordService,
    TokenService,
  ],
})
export class AuthModule {}
