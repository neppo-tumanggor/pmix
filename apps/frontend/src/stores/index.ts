import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Auth Store
interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        login: (user, token) =>
          set({ user, token, isAuthenticated: true }),
        logout: () =>
          set({ user: null, token: null, isAuthenticated: false }),
      }),
      {
        name: 'auth-storage',
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

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        theme: 'light',
        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'ui-storage',
      }
    )
  )
);

// Product Store
interface ProductState {
  products: any[];
  selectedProduct: any | null;
  loading: boolean;
  error: string | null;
  setProducts: (products: any[]) => void;
  setSelectedProduct: (product: any | null) => void;
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