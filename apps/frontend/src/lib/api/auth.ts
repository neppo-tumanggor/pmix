import axios from 'axios';
import { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from '@/lib/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1457/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getStoredAuthState = () => {
  if (typeof window === 'undefined') {
    return {} as { token?: string; refreshToken?: string };
  }

  const raw = localStorage.getItem('auth-storage');
  if (!raw) {
    return {} as { token?: string; refreshToken?: string };
  }

  try {
    const authData = JSON.parse(raw);
    return authData?.state ?? authData ?? {};
  } catch (error) {
    console.error('Error parsing auth token:', error);
    return {} as { token?: string; refreshToken?: string };
  }
};

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const { token } = getStoredAuthState();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('[auth interceptor] No token found in auth state');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const authData = getStoredAuthState();
        const refreshToken = authData.refreshToken;

        if (refreshToken) {
          const response = await axios.post<RefreshTokenResponse>(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Update stored token
          const nextAuthData = getStoredAuthState();
          const merged = {
            ...nextAuthData,
            token: accessToken,
            refreshToken: newRefreshToken,
          };

          localStorage.setItem('auth-storage', JSON.stringify({ state: merged }));

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authApi = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default apiClient;
