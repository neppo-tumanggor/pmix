export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'manager';
  emailVerified: boolean;
  lastLogin?: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: Omit<User, 'createdAt' | 'updatedAt'>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: AuthResponse;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: AuthResponse;
}
