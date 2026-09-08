// Shared types for Mixer monorepo

// Product types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
}

// Campaign types
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCampaignDto {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  budget: number;
}

// Customer types
export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  email: string;
  name: string;
  phone?: string;
  address?: string;
}

// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Common types
export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueryFilter {
  [key: string]: any;
}