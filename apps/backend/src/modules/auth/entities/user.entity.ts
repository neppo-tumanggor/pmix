import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { Session } from './session.entity';
import { PasswordHistory } from './password-history.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verification_token', length: 255, nullable: true })
  emailVerificationToken: string;

  @Column({ name: 'email_verification_expires', type: 'timestamp', nullable: true })
  emailVerificationExpires: Date;

  @Column({ name: 'password_reset_token', length: 255, nullable: true, unique: true })
  passwordResetToken: string;

  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil: Date;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => PasswordHistory, (history) => history.user)
  passwordHistory: PasswordHistory[];
}
