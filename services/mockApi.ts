import { mockProblems, mockStats, mockUsers, Problem, User } from '@/data/mockData';

// Simula delay de rede
const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Simulação de resposta da API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Funções de autenticação
export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<User>> {
    await delay();
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Remove password do retorno por segurança
      const { password: _, ...userWithoutPassword } = user;
      return {
        success: true,
        data: userWithoutPassword as User,
      };
    }
    
    return {
      success: false,
      error: 'Email ou senha incorretos',
    };
  },

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    await delay(300);
    
    const user = mockUsers.find(u => u.id === userId);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return {
        success: true,
        data: userWithoutPassword as User,
      };
    }
    
    return {
      success: false,
      error: 'Usuário não encontrado',
    };
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    await delay();
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      const { password: _, ...userWithoutPassword } = mockUsers[userIndex];
      
      return {
        success: true,
        data: userWithoutPassword as User,
      };
    }
    
    return {
      success: false,
      error: 'Usuário não encontrado',
    };
  },
};

// Funções de problemas
export const problemsApi = {
  async getProblems(filters?: {
    status?: string;
    category?: string;
    userId?: string;
  }): Promise<ApiResponse<Problem[]>> {
    await delay();
    
    let filteredProblems = [...mockProblems];
    
    if (filters?.status && filters.status !== 'all') {
      filteredProblems = filteredProblems.filter(p => p.status === filters.status);
    }
    
    if (filters?.category && filters.category !== 'all') {
      filteredProblems = filteredProblems.filter(p => p.category === filters.category);
    }
    
    if (filters?.userId) {
      filteredProblems = filteredProblems.filter(p => p.reportedBy === filters.userId);
    }
    
    // Ordenar por data mais recente
    filteredProblems.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
    
    return {
      success: true,
      data: filteredProblems,
    };
  },

  async getProblemById(problemId: string): Promise<ApiResponse<Problem>> {
    await delay(300);
    
    const problem = mockProblems.find(p => p.id === problemId);
    
    if (problem) {
      return {
        success: true,
        data: problem,
      };
    }
    
    return {
      success: false,
      error: 'Problema não encontrado',
    };
  },

  async createProblem(problemData: Omit<Problem, 'id' | 'reportedAt' | 'votes' | 'comments'>): Promise<ApiResponse<Problem>> {
    await delay();
    
    const newProblem: Problem = {
      ...problemData,
      id: (mockProblems.length + 1).toString(),
      reportedAt: new Date().toISOString(),
      votes: 1,
      comments: [],
    };
    
    mockProblems.unshift(newProblem);
    
    return {
      success: true,
      data: newProblem,
    };
  },

  async updateProblem(problemId: string, updates: Partial<Problem>): Promise<ApiResponse<Problem>> {
    await delay();
    
    const problemIndex = mockProblems.findIndex(p => p.id === problemId);
    
    if (problemIndex !== -1) {
      mockProblems[problemIndex] = { ...mockProblems[problemIndex], ...updates };
      
      return {
        success: true,
        data: mockProblems[problemIndex],
      };
    }
    
    return {
      success: false,
      error: 'Problema não encontrado',
    };
  },

  async voteProblem(problemId: string, userId: string): Promise<ApiResponse<{ votes: number }>> {
    await delay(200);
    
    const problemIndex = mockProblems.findIndex(p => p.id === problemId);
    
    if (problemIndex !== -1) {
      mockProblems[problemIndex].votes += 1;
      
      return {
        success: true,
        data: { votes: mockProblems[problemIndex].votes },
      };
    }
    
    return {
      success: false,
      error: 'Problema não encontrado',
    };
  },

  async addComment(problemId: string, userId: string, text: string): Promise<ApiResponse<Problem>> {
    await delay(300);
    
    const problemIndex = mockProblems.findIndex(p => p.id === problemId);
    const user = mockUsers.find(u => u.id === userId);
    
    if (problemIndex !== -1 && user) {
      const newComment = {
        id: Date.now().toString(),
        text,
        userId,
        userName: user.name,
        createdAt: new Date().toISOString(),
      };
      
      mockProblems[problemIndex].comments.push(newComment);
      
      return {
        success: true,
        data: mockProblems[problemIndex],
      };
    }
    
    return {
      success: false,
      error: 'Problema ou usuário não encontrado',
    };
  },
};

// Funções de estatísticas
export const statsApi = {
  async getGlobalStats(): Promise<ApiResponse<typeof mockStats>> {
    await delay(400);
    
    const currentStats = {
      totalProblems: mockProblems.length,
      resolvedProblems: mockProblems.filter(p => p.status === 'resolved').length,
      pendingProblems: mockProblems.filter(p => p.status === 'pending').length,
      inProgressProblems: mockProblems.filter(p => p.status === 'in_progress').length,
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter(u => u.points > 0).length,
    };
    
    return {
      success: true,
      data: currentStats,
    };
  },

  async getUserStats(userId: string): Promise<ApiResponse<{
    problemsReported: number;
    problemsResolved: number;
    totalVotes: number;
    totalComments: number;
  }>> {
    await delay(300);
    
    const userProblems = mockProblems.filter(p => p.reportedBy === userId);
    const resolvedProblems = userProblems.filter(p => p.status === 'resolved');
    const totalVotes = userProblems.reduce((sum, p) => sum + p.votes, 0);
    const totalComments = mockProblems.reduce((sum, p) => 
      sum + p.comments.filter(c => c.userId === userId).length, 0
    );
    
    return {
      success: true,
      data: {
        problemsReported: userProblems.length,
        problemsResolved: resolvedProblems.length,
        totalVotes,
        totalComments,
      },
    };
  },


  async getRanking(): Promise<ApiResponse<User[]>> {
    await delay(500);
    
    // Simular ranking baseado em pontos
    const ranking = [...mockUsers]
      .map(user => {
        const userProblems = mockProblems.filter(p => p.reportedBy === user.id);
        const problemsReported = userProblems.length;
        const problemsResolved = userProblems.filter(p => p.status === 'resolved').length;
        const totalVotes = userProblems.reduce((sum, p) => sum + p.votes, 0);
        
        // Calcular eficiência (% de problemas resolvidos)
        const efficiency = problemsReported > 0 ? Math.round((problemsResolved / problemsReported) * 100) : 0;
        
        return {
          ...user,
          problemsReported,
          problemsResolved,
          totalVotes,
          efficiency,
        };
      })
      .sort((a, b) => b.points - a.points)
      .map((user, index) => ({ ...user, ranking: index + 1 }));
    
    return {
      success: true,
      data: ranking,
    };
  },
};

// Função utilitária para simular erros de rede
export const simulateNetworkError = (): ApiResponse<never> => {
  return {
    success: false,
    error: 'Erro de conexão. Verifique sua internet.',
  };
};

// Validação de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Função para simular upload de imagem
export const uploadImage = async (imageUri: string): Promise<ApiResponse<string>> => {
  await delay(1000);
  
  // Simula upload e retorna uma URL fictícia
  const fileName = `image_${Date.now()}.jpg`;
  const uploadedUrl = `https://via.placeholder.com/400x300/FF5722/FFFFFF?text=${fileName}`;
  
  return {
    success: true,
    data: uploadedUrl,
  };
}; 