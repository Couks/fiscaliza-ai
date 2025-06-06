import { statsApi } from '@/services/firebaseApi';
import { create } from 'zustand';

interface GlobalStats {
  totalProblems: number;
  resolvedProblems: number;
  pendingProblems: number;
  inProgressProblems: number;
  totalUsers: number;
  activeUsers: number;
}

interface UserStats {
  problemsReported: number;
  problemsResolved: number;
  totalVotes: number;
  totalComments: number;
}

interface StatsState {
  // Estado
  globalStats: GlobalStats | null;
  userStats: UserStats | null;
  ranking: any[] | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
  
  // Ações
  loadGlobalStats: () => Promise<void>;
  loadUserStats: (userId: string) => Promise<void>;
  loadRanking: () => Promise<void>;
  refreshAllStats: (userId?: string) => Promise<void>;
  clearError: () => void;
  
  // Notificação de novo report - atualiza estatísticas
  notifyNewReport: (userId: string) => void;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  // Estado inicial
  globalStats: null,
  userStats: null,
  ranking: null,
  isLoading: false,
  error: null,
  lastUpdated: 0,

  // Carregar estatísticas globais
  loadGlobalStats: async () => {
    try {
      const response = await statsApi.getGlobalStats();
      
      if (response.success && response.data) {
        set({ 
          globalStats: response.data
          // Removido lastUpdated - só atualiza quando há novo report
        });
      } else {
        set({ 
          error: response.error || 'Erro ao carregar estatísticas globais'
        });
      }
    } catch (error) {
      set({ 
        error: 'Erro de conexão ao carregar estatísticas globais'
      });
    }
  },

  // Carregar estatísticas do usuário
  loadUserStats: async (userId: string) => {
    try {
      const response = await statsApi.getUserStats(userId);
      
      if (response.success && response.data) {
        set({ 
          userStats: response.data
          // Removido lastUpdated - só atualiza quando há novo report
        });
      } else {
        set({ 
          error: response.error || 'Erro ao carregar estatísticas do usuário'
        });
      }
    } catch (error) {
      set({ 
        error: 'Erro de conexão ao carregar estatísticas do usuário'
      });
    }
  },

  // Carregar ranking
  loadRanking: async () => {
    try {
      const response = await statsApi.getRanking();
      
      if (response.success && response.data) {
        set({ 
          ranking: response.data
          // Removido lastUpdated - só atualiza quando há novo report
        });
      } else {
        set({ 
          error: response.error || 'Erro ao carregar ranking'
        });
      }
    } catch (error) {
      set({ 
        error: 'Erro de conexão ao carregar ranking'
      });
    }
  },

  // Recarregar todas as estatísticas
  refreshAllStats: async (userId?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await Promise.all([
        get().loadGlobalStats(),
        userId ? get().loadUserStats(userId) : Promise.resolve(),
        get().loadRanking()
      ]);
    } catch (error) {
      console.error('Erro ao recarregar estatísticas:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Notificar sobre novo report - atualiza estatísticas incrementalmente
  notifyNewReport: (userId: string) => {
    const { globalStats, userStats } = get();
    
    // Atualizar estatísticas globais
    if (globalStats) {
      set({
        globalStats: {
          ...globalStats,
          totalProblems: globalStats.totalProblems + 1,
          pendingProblems: globalStats.pendingProblems + 1
        }
      });
    }
    
    // Atualizar estatísticas do usuário se for o mesmo usuário
    if (userStats) {
      set({
        userStats: {
          ...userStats,
          problemsReported: userStats.problemsReported + 1
        }
      });
    }
    
    set({ lastUpdated: Date.now() });
  },

  // Limpar erro
  clearError: () => {
    set({ error: null });
  },
})); 