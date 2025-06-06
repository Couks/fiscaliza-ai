import { User } from '@/data/mockData';
import { authApi } from '@/services/firebaseApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  // Estado
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Ações
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Ação de login
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login(email, password);
          
          if (response.success && response.data) {
            set({ 
              user: response.data, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
            return { success: true };
          } else {
            set({ 
              error: response.error || 'Erro no login', 
              isLoading: false 
            });
            return { 
              success: false, 
              error: response.error || 'Erro no login' 
            };
          }
        } catch {
          const errorMessage = 'Erro de conexão. Tente novamente.';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          return { 
            success: false, 
            error: errorMessage 
          };
        }
      },

      // Ação de logout
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
      },

      // Atualizar dados do usuário
      updateUser: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true });
        
        try {
          const response = await authApi.updateUser(user.id, updates);
          
          if (response.success && response.data) {
            set({ 
              user: response.data, 
              isLoading: false 
            });
          } else {
            set({ 
              error: response.error || 'Erro ao atualizar usuário', 
              isLoading: false 
            });
          }
        } catch {
          set({ 
            error: 'Erro de conexão ao atualizar usuário', 
            isLoading: false 
          });
        }
      },

      // Recarregar dados do usuário
      refreshUser: async () => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true });
        
        try {
          const response = await authApi.getUserById(user.id);
          
          if (response.success && response.data) {
            set({ 
              user: response.data, 
              isLoading: false 
            });
          } else {
            set({ 
              error: response.error || 'Erro ao recarregar usuário', 
              isLoading: false 
            });
          }
        } catch {
          set({ 
            error: 'Erro de conexão ao recarregar usuário', 
            isLoading: false 
          });
        }
      },

      // Limpar erro
      clearError: () => {
        set({ error: null });
      },

      // Definir loading
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage', // Nome da chave no AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      // Apenas persistir os dados essenciais
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
); 