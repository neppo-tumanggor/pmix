import { UserRole } from '../entities/user.entity';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}
