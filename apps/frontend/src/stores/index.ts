import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '@/lib/types/auth';

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: (user, token, refreshToken) =>
          set({ 
            user, 
            token, 
            refreshToken,
            isAuthenticated: true, 
            isLoading: false, 
            error: null 
          }),
        logout: () =>
          set({ 
            user: null, 
            token: null, 
            refreshToken: null,
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          }),
        setLoading: (loading) =>
          set({ isLoading: loading }),
        setError: (error) =>
          set({ error, isLoading: false }),
        clearError: () =>
          set({ error: null }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// UI Store
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));

// Product Store
interface ProductState {
  products: any[];
  selectedProduct: any | null;
  loading: boolean;
  error: string | null;
  setProducts: (products: any[]) => void;
  setSelectedProduct: (selectedProduct: any | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  setProducts: (products) => set({ products }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
