import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AUTH_CONFIG } from '../constants/auth.config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;

  constructor(private readonly mailerService: MailerService) {
    this.fromEmail = process.env.SMTP_FROM || 'noreply@mixer.com';
  }

  /**
   * Send email verification email
   * @param email - Recipient email
   * @param token - Verification token
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationLink = `${process.env.APP_URL}/verify-email?token=${token}`;
    
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify your email - Mixer',
        template: 'verification',
        context: {
          name: email,
          verificationLink,
          expiresIn: '24 hours',
        },
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset email
   * @param email - Recipient email
   * @param token - Reset token
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;
    
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset your password - Mixer',
        template: 'password-reset',
        context: {
          name: email,
          resetLink,
          expiresIn: '1 hour',
        },
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send welcome email
   * @param email - Recipient email
   */
  async sendWelcomeEmail(email: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Mixer!',
        template: 'welcome',
        context: {
          name: email,
          loginLink: `${process.env.APP_URL}/login`,
        },
      });

      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      // Don't throw error for welcome email
    }
  }

  /**
   * Send password changed notification email
   * @param email - Recipient email
   */
  async sendPasswordChangedEmail(email: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Your password has been changed',
        template: 'password-changed',
        context: {
          name: email,
          supportEmail: 'support@mixer.com',
        },
      });

      this.logger.log(`Password changed email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password changed email to ${email}:`, error);
      // Don't throw error for notification email
    }
  }
}
