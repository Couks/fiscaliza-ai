import { Problem } from '@/data/mockData';
import { problemsApi } from '@/services/mockApi';
import { create } from 'zustand';

interface ProblemsState {
  // Estado
  problems: Problem[];
  userProblems: Problem[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
  
  // Ações
  loadProblems: (filters?: { status?: string; category?: string; userId?: string }) => Promise<void>;
  loadUserProblems: (userId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  
  // Notificação de novo report
  notifyNewReport: (newProblem: Problem) => void;
}

export const useProblemsStore = create<ProblemsState>((set, get) => ({
  // Estado inicial
  problems: [],
  userProblems: [],
  isLoading: false,
  error: null,
  lastUpdated: 0,

  // Carregar todos os problemas
  loadProblems: async (filters) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await problemsApi.getProblems(filters);
      
      if (response.success && response.data) {
        set({ 
          problems: response.data,
          isLoading: false
          // Removido lastUpdated - só atualiza quando há novo report
        });
      } else {
        set({ 
          error: response.error || 'Erro ao carregar problemas',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: 'Erro de conexão ao carregar problemas',
        isLoading: false 
      });
    }
  },

  // Carregar problemas do usuário
  loadUserProblems: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await problemsApi.getProblems({ userId });
      
      if (response.success && response.data) {
        set({ 
          userProblems: response.data,
          isLoading: false
          // Removido lastUpdated - só atualiza quando há novo report
        });
      } else {
        set({ 
          error: response.error || 'Erro ao carregar problemas do usuário',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: 'Erro de conexão ao carregar problemas do usuário',
        isLoading: false 
      });
    }
  },

  // Recarregar todos os dados
  refreshData: async () => {
    const { loadProblems } = get();
    await loadProblems();
  },

  // Notificar sobre novo report - atualiza listas automaticamente
  notifyNewReport: (newProblem: Problem) => {
    const { problems, userProblems } = get();
    
    // Adicionar o novo problema no início das listas
    set({
      problems: [newProblem, ...problems],
      userProblems: newProblem.reportedBy === userProblems[0]?.reportedBy 
        ? [newProblem, ...userProblems] 
        : userProblems,
      lastUpdated: Date.now()
    });
  },

  // Limpar erro
  clearError: () => {
    set({ error: null });
  },

  // Definir loading
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
})); 