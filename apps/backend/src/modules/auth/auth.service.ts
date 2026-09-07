import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { AuthResponse, LoginResponse, RegisterResponse } from './interfaces/auth-response.interface';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { SessionService } from './services/session.service';
import { AccountLockoutService } from './services/account-lockout.service';
import { AUTH_CONFIG } from './constants/auth.config';
import { AuthErrorCodes } from './constants/error-codes.enum';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken) private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly sessionService: SessionService,
    private readonly accountLockoutService: AccountLockoutService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });
    if (!user || user.deletedAt) return null;
    this.accountLockoutService.verifyNotLocked(user);
    const isPasswordValid = await this.passwordService.verify(password, user.password);
    if (!isPasswordValid) {
      await this.accountLockoutService.recordFailedAttempt(user.id);
      return null;
    }
    await this.accountLockoutService.resetFailedAttempts(user.id);
    return user;
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    const { email, password, name } = registerDto;
    const existingUser = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser && !existingUser.deletedAt) {
      throw new ConflictException('Email already exists', AuthErrorCodes.EMAIL_EXISTS);
    }
    const hashedPassword = await this.passwordService.hash(password);
    const user = this.userRepository.create({
      email: email.toLowerCase().trim(), password: hashedPassword,
      name: name.trim(), role: UserRole.USER, emailVerified: false,
    });
    const savedUser = await this.userRepository.save(user);
    const verificationToken = this.generateSecureToken();
    savedUser.emailVerificationToken = await this.passwordService.hash(verificationToken);
    savedUser.emailVerificationExpires = new Date(Date.now() + AUTH_CONFIG.EMAIL.VERIFICATION_EXPIRY);
    await this.userRepository.save(savedUser);
    try {
      await this.emailService.sendVerificationEmail(savedUser.email, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }
    return { success: true, message: 'Registration successful. Please verify your email.', data: { userId: savedUser.id } };
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials', AuthErrorCodes.INVALID_CREDENTIALS);
    }
    this.accountLockoutService.verifyNotLocked(user);
    const isPasswordValid = await this.passwordService.verify(password, user.password);
    if (!isPasswordValid) {
      await this.accountLockoutService.recordFailedAttempt(user.id);
      throw new UnauthorizedException('Invalid credentials', AuthErrorCodes.INVALID_CREDENTIALS);
    }
    if (!user.emailVerified) {
      throw new ForbiddenException('Please verify your email before logging in', AuthErrorCodes.EMAIL_NOT_VERIFIED);
    }
    await this.accountLockoutService.resetFailedAttempts(user.id);
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);
    const hashedRefreshToken = await this.passwordService.hash(refreshToken);
    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: hashedRefreshToken, userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), revoked: false,
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);
    await this.sessionService.create({
      userId: user.id, ipAddress, userAgent, refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    user.lastLogin = new Date();
    await this.userRepository.save(user);
    const authResponse: AuthResponse = {
      accessToken, refreshToken, expiresIn: 900,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified, lastLogin: user.lastLogin },
    };
    return { success: true, data: authResponse };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<LoginResponse> {
    const { refreshToken } = refreshTokenDto;
    let payload: JwtPayload;
    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token', AuthErrorCodes.INVALID_REFRESH_TOKEN);
    }
    const allTokens = await this.refreshTokenRepository.find({ where: { revoked: false } });
    const storedToken = allTokens.find((t) => this.passwordService.verify(refreshToken, t.token));
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token', AuthErrorCodes.INVALID_REFRESH_TOKEN);
    }
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found', AuthErrorCodes.USER_NOT_FOUND);
    }
    storedToken.revoked = true;
    await this.refreshTokenRepository.save(storedToken);
    await this.sessionService.deleteByRefreshToken(refreshToken);
    const accessToken = this.tokenService.generateAccessToken(user);
    const newRefreshToken = this.tokenService.generateRefreshToken(user);
    const hashedNewRefreshToken = await this.passwordService.hash(newRefreshToken);
    const newRefreshTokenEntity = this.refreshTokenRepository.create({
      token: hashedNewRefreshToken, userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), revoked: false,
    });
    await this.refreshTokenRepository.save(newRefreshTokenEntity);
    await this.sessionService.create({
      userId: user.id, refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    const authResponse: AuthResponse = {
      accessToken, refreshToken: newRefreshToken, expiresIn: 900,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified },
    };
    return { success: true, data: authResponse };
  }

  async logout(refreshToken: string): Promise<void> {
    const allTokens = await this.refreshTokenRepository.find({ where: { revoked: false } });
    const storedToken = allTokens.find((t) => this.passwordService.verify(refreshToken, t.token));
    if (storedToken) {
      storedToken.revoked = true;
      await this.refreshTokenRepository.save(storedToken);
    }
    await this.sessionService.deleteByRefreshToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.update({ userId, revoked: false }, { revoked: true });
    await this.sessionService.deleteAllByUserId(userId);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;
    const user = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });
    if (!user || user.deletedAt) return;
    const resetToken = this.generateSecureToken();
    user.passwordResetToken = await this.passwordService.hash(resetToken);
    user.passwordResetExpires = new Date(Date.now() + AUTH_CONFIG.EMAIL.PASSWORD_RESET_EXPIRY);
    await this.userRepository.save(user);
    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, password } = resetPasswordDto;
    const allUsers = await this.userRepository.find({ where: { deletedAt: null } });
    const user = allUsers.find((u) => {
      if (!u.passwordResetToken || !u.passwordResetExpires) return false;
      return this.passwordService.verify(token, u.passwordResetToken);
    });
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token', AuthErrorCodes.INVALID_RESET_TOKEN);
    }
    await this.passwordService.validateStrength(password);
    const isPasswordUsed = await this.passwordService.isPasswordUsed(user.id, password);
    if (isPasswordUsed) {
      throw new BadRequestException('Password was used before', AuthErrorCodes.PASSWORD_REUSED);
    }
    const hashedPassword = await this.passwordService.hash(password);
    await this.passwordService.saveToHistory(user.id, user.password);
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);
    await this.logoutAll(user.id);
    try {
      await this.emailService.sendPasswordChangedEmail(user.email);
    } catch (error) {
      console.error('Failed to send password changed email:', error);
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    const { token } = verifyEmailDto;
    const allUsers = await this.userRepository.find({ where: { emailVerified: false, deletedAt: null } });
    const user = allUsers.find((u) => {
      if (!u.emailVerificationToken || !u.emailVerificationExpires) return false;
      return this.passwordService.verify(token, u.emailVerificationToken);
    });
    if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Invalid or expired verification token', 'INVALID_VERIFICATION_TOKEN');
    }
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await this.userRepository.save(user);
    try {
      await this.emailService.sendWelcomeEmail(user.email);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  async resendVerificationEmail(resendVerificationDto: ResendVerificationDto): Promise<void> {
    const { email } = resendVerificationDto;
    const user = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found', AuthErrorCodes.USER_NOT_FOUND);
    }
    if (user.emailVerified) {
      throw new BadRequestException('Email already verified', AuthErrorCodes.EMAIL_ALREADY_VERIFIED);
    }
    const verificationToken = this.generateSecureToken();
    user.emailVerificationToken = await this.passwordService.hash(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + AUTH_CONFIG.EMAIL.VERIFICATION_EXPIRY);
    await this.userRepository.save(user);
    try {
      await this.emailService.sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found', AuthErrorCodes.USER_NOT_FOUND);
    }
    const isCurrentPasswordValid = await this.passwordService.verify(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect', AuthErrorCodes.INCORRECT_PASSWORD);
    }
    await this.passwordService.validateStrength(newPassword);
    const isPasswordUsed = await this.passwordService.isPasswordUsed(userId, newPassword);
    if (isPasswordUsed) {
      throw new BadRequestException('Password was used before', AuthErrorCodes.PASSWORD_REUSED);
    }
    await this.passwordService.saveToHistory(userId, user.password);
    user.password = await this.passwordService.hash(newPassword);
    await this.userRepository.save(user);
    await this.logoutAll(userId);
    try {
      await this.emailService.sendPasswordChangedEmail(user.email);
    } catch (error) {
      console.error('Failed to send password changed email:', error);
    }
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found', AuthErrorCodes.USER_NOT_FOUND);
    }
    const { password, emailVerificationToken, passwordResetToken, ...profile } = user;
    return profile as User;
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
