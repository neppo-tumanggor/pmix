import { User } from './user.interface';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: Omit<User, 'createdAt' | 'updatedAt'>;
}

export interface LoginResponse {
  success: boolean;
  data: AuthResponse;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
  };
}
