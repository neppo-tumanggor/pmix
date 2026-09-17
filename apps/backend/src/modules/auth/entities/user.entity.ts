import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { generateUuid } from '../../../shared/utils/uuid.util';
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
  @PrimaryColumn({ type: 'varchar', length: 36 })
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

  @Column({ name: 'email_verification_token', type: 'varchar', length: 255, nullable: true })
  emailVerificationToken: string | null;

  @Column({ name: 'email_verification_expires', type: 'datetime', nullable: true })
  emailVerificationExpires: Date | null;

  @Column({ name: 'password_reset_token', type: 'varchar', length: 255, nullable: true, unique: true })
  passwordResetToken: string | null;

  @Column({ name: 'password_reset_expires', type: 'datetime', nullable: true })
  passwordResetExpires: Date | null;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'datetime', nullable: true })
  lockedUntil: Date | null;

  @Column({ name: 'tenant_id', type: 'varchar', length: 255, nullable: true })
  tenantId: string | null;

  @Column({ default: 'active' })
  status: string;

  @Column({ name: 'last_login', type: 'datetime', nullable: true })
  lastLogin: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => PasswordHistory, (history) => history.user)
  passwordHistory: PasswordHistory[];

  // Auto-generate UUID before insert
  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = generateUuid();
    }
  }
}
