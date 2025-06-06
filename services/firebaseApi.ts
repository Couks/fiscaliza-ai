import { firestore, storage } from '@/config/firebase';
import { Comment, mockProblems, mockUsers, Problem, User } from '@/data/mockData';

// Tipos de resposta da API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Simula delay de rede (opcional)
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// 🔥 COLEÇÕES DO FIRESTORE
const COLLECTIONS = {
  PROBLEMS: 'problems',
  USERS: 'users'
};

// 📤 UPLOAD DE IMAGENS
export const uploadImage = async (imageUri: string, problemId: string, index: number): Promise<string> => {
  try {
    const reference = storage().ref(`problems/${problemId}/image_${index}.jpg`);
    await reference.putFile(imageUri);
    const downloadURL = await reference.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    throw error;
  }
};

// 👥 API DE USUÁRIOS
export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<User>> {
    await delay();
    
    try {
      const usersRef = firestore().collection(COLLECTIONS.USERS);
      const snapshot = await usersRef.where('email', '==', email).get();
      
      if (snapshot.empty) {
        return { success: false, error: 'Email ou senha incorretos' };
      }
      
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data() as User;
      
      if (userData.password === password) {
        const { password: _, ...userWithoutPassword } = userData;
        return { success: true, data: userWithoutPassword as User };
      }
      
      return { success: false, error: 'Email ou senha incorretos' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  },

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    await delay(300);
    
    try {
      const userDoc = await firestore().collection(COLLECTIONS.USERS).doc(userId).get();
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const { password: _, ...userWithoutPassword } = userData;
        return { success: true, data: userWithoutPassword as User };
      }
      
      return { success: false, error: 'Usuário não encontrado' };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    await delay();
    
    try {
      const userRef = firestore().collection(COLLECTIONS.USERS).doc(userId);
      await userRef.update(updates);
      
      const updatedDoc = await userRef.get();
      const userData = updatedDoc.data() as User;
      const { password: _, ...userWithoutPassword } = userData;
      
      return { success: true, data: userWithoutPassword as User };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  }
};

// 📋 API DE PROBLEMAS
export const problemsApi = {
  async getProblems(filters?: {
    status?: string;
    category?: string;
    userId?: string;
  }): Promise<ApiResponse<Problem[]>> {
    await delay();
    
    try {
      let query = firestore().collection(COLLECTIONS.PROBLEMS) as any;
      
      // Aplicar filtros
      if (filters?.status && filters.status !== 'all') {
        query = query.where('status', '==', filters.status);
      }
      
      if (filters?.category && filters.category !== 'all') {
        query = query.where('category', '==', filters.category);
      }
      
      if (filters?.userId) {
        query = query.where('reportedBy', '==', filters.userId);
      }
      
      // Ordenar por data mais recente
      query = query.orderBy('reportedAt', 'desc');
      
      const snapshot = await query.get();
      const problems: Problem[] = [];
      
      snapshot.forEach((doc: any) => {
        problems.push({
          id: doc.id,
          ...doc.data()
        } as Problem);
      });
      
      return { success: true, data: problems };
    } catch (error) {
      console.error('Erro ao carregar problemas:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  },

  async getProblemById(problemId: string): Promise<ApiResponse<Problem>> {
    await delay(300);
    
    try {
      const problemDoc = await firestore().collection(COLLECTIONS.PROBLEMS).doc(problemId).get();
      
      if (problemDoc.exists()) {
        const problemData = {
          id: problemDoc.id,
          ...problemDoc.data()
        } as Problem;
        
        return { success: true, data: problemData };
      }
      
      return { success: false, error: 'Problema não encontrado' };
    } catch (error) {
      console.error('Erro ao buscar problema:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  },

  async createProblem(problemData: Omit<Problem, 'id' | 'reportedAt' | 'votes' | 'comments'>): Promise<ApiResponse<Problem>> {
    await delay();
    
    try {
      // Criar documento com ID automático
      const problemRef = firestore().collection(COLLECTIONS.PROBLEMS).doc();
      
      // Upload das imagens se existirem
      let uploadedImages: string[] = [];
      if (problemData.images && problemData.images.length > 0) {
        uploadedImages = await Promise.all(
          problemData.images.map((imageUri, index) => 
            uploadImage(imageUri, problemRef.id, index)
          )
        );
      }
      
      const newProblem: Problem = {
        ...problemData,
        id: problemRef.id,
        reportedAt: new Date().toISOString(),
        votes: 1,
        comments: [],
        images: uploadedImages
      };
      
      // Salvar no Firestore
      await problemRef.set(newProblem);
      
      return { success: true, data: newProblem };
    } catch (error) {
      console.error('Erro ao criar problema:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  },

  async updateProblem(problemId: string, updates: Partial<Problem>): Promise<ApiResponse<Problem>> {
    await delay();
    
    try {
      const problemRef = firestore().collection(COLLECTIONS.PROBLEMS).doc(problemId);
      await problemRef.update(updates);
      
      const updatedDoc = await problemRef.get();
      const problemData = {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Problem;
      
      return { success: true, data: problemData };
    } catch (error) {
      console.error('Erro ao atualizar problema:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  },

  async voteProblem(problemId: string, userId: string): Promise<ApiResponse<{ votes: number }>> {
    await delay(200);
    
    try {
      const problemRef = firestore().collection(COLLECTIONS.PROBLEMS).doc(problemId);
      const problemDoc = await problemRef.get();
      
      if (problemDoc.exists()) {
        const currentVotes = problemDoc.data()?.votes || 0;
        const newVotes = currentVotes + 1;
        
        await problemRef.update({ votes: newVotes });
        
        return { success: true, data: { votes: newVotes } };
      }
      
      return { success: false, error: 'Problema não encontrado' };
    } catch (error) {
      console.error('Erro ao votar:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  },

  async addComment(problemId: string, userId: string, text: string): Promise<ApiResponse<Problem>> {
    await delay(300);
    
    try {
      // Buscar dados do usuário
      const userDoc = await firestore().collection(COLLECTIONS.USERS).doc(userId).get();
      if (!userDoc.exists) {
        return { success: false, error: 'Usuário não encontrado' };
      }
      
      const user = userDoc.data() as User;
      
      // Criar novo comentário
      const newComment: Comment = {
        id: Date.now().toString(),
        text,
        userId,
        userName: user.name,
        createdAt: new Date().toISOString(),
      };
      
      // Atualizar problema
      const problemRef = firestore().collection(COLLECTIONS.PROBLEMS).doc(problemId);
      await problemRef.update({
        comments: firestore.FieldValue.arrayUnion(newComment)
      });
      
      // Retornar problema atualizado
      const updatedDoc = await problemRef.get();
      const problemData = {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Problem;
      
      return { success: true, data: problemData };
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  }
};

// 📊 API DE ESTATÍSTICAS
export const statsApi = {
  async getGlobalStats(): Promise<ApiResponse<any>> {
    await delay(400);
    
    try {
      const problemsSnapshot = await firestore().collection(COLLECTIONS.PROBLEMS).get();
      const usersSnapshot = await firestore().collection(COLLECTIONS.USERS).get();
      
      const totalProblems = problemsSnapshot.size;
      let resolvedProblems = 0;
      let pendingProblems = 0;
      let inProgressProblems = 0;
      
      problemsSnapshot.forEach(doc => {
        const status = doc.data().status;
        if (status === 'resolved') resolvedProblems++;
        else if (status === 'pending') pendingProblems++;
        else if (status === 'in_progress') inProgressProblems++;
      });
      
      const totalUsers = usersSnapshot.size;
      let activeUsers = 0;
      
      usersSnapshot.forEach(doc => {
        const points = doc.data().points || 0;
        if (points > 0) activeUsers++;
      });
      
      const currentStats = {
        totalProblems,
        resolvedProblems,
        pendingProblems,
        inProgressProblems,
        totalUsers,
        activeUsers,
      };
      
      return { success: true, data: currentStats };
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  },

  async getUserStats(userId: string): Promise<ApiResponse<any>> {
    await delay(300);
    
    try {
      const problemsSnapshot = await firestore()
        .collection(COLLECTIONS.PROBLEMS)
        .where('reportedBy', '==', userId)
        .get();
      
      let problemsReported = 0;
      let problemsResolved = 0;
      let totalVotes = 0;
      let totalComments = 0;
      
      problemsSnapshot.forEach(doc => {
        const data = doc.data();
        problemsReported++;
        if (data.status === 'resolved') problemsResolved++;
        totalVotes += data.votes || 0;
        totalComments += data.comments?.length || 0;
      });
      
      return {
        success: true,
        data: {
          problemsReported,
          problemsResolved,
          totalVotes,
          totalComments,
        },
      };
    } catch (error) {
      console.error('Erro ao carregar estatísticas do usuário:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  },

  async getRanking(): Promise<ApiResponse<User[]>> {
    await delay(500);
    
    try {
      const usersSnapshot = await firestore()
        .collection(COLLECTIONS.USERS)
        .orderBy('points', 'desc')
        .get();
      
      const ranking: any[] = [];
      
      for (let i = 0; i < usersSnapshot.docs.length; i++) {
        const userDoc = usersSnapshot.docs[i];
        const userData = userDoc.data() as User;
        
        // Calcular estatísticas do usuário
        const userProblemsSnapshot = await firestore()
          .collection(COLLECTIONS.PROBLEMS)
          .where('reportedBy', '==', userData.id)
          .get();
        
        let problemsReported = 0;
        let problemsResolved = 0;
        let totalVotes = 0;
        
        userProblemsSnapshot.forEach(doc => {
          const data = doc.data();
          problemsReported++;
          if (data.status === 'resolved') problemsResolved++;
          totalVotes += data.votes || 0;
        });
        
        ranking.push({
          ...userData,
          ranking: i + 1,
          problemsReported,
          problemsResolved,
          totalVotes,
        });
      }
      
      return { success: true, data: ranking };
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  }
};

// 🔧 FUNÇÃO PARA INICIALIZAR DADOS (EXECUTAR UMA VEZ)
export const initializeFirebaseData = async () => {
  try {
    console.log('🔥 Inicializando dados no Firebase...');
    
    // Verificar se já existem dados
    const usersSnapshot = await firestore().collection(COLLECTIONS.USERS).get();
    const problemsSnapshot = await firestore().collection(COLLECTIONS.PROBLEMS).get();
    
    if (usersSnapshot.empty) {
      console.log('📥 Carregando usuários iniciais...');
      for (const user of mockUsers) {
        await firestore().collection(COLLECTIONS.USERS).doc(user.id).set(user);
      }
    }
    
    if (problemsSnapshot.empty) {
      console.log('📥 Carregando problemas iniciais...');
      for (const problem of mockProblems) {
        await firestore().collection(COLLECTIONS.PROBLEMS).doc(problem.id).set(problem);
      }
    }
    
    console.log('✅ Dados inicializados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar dados:', error);
  }
};

// Funções utilitárias mantidas para compatibilidade
export const simulateNetworkError = (): ApiResponse<never> => {
  return {
    success: false,
    error: 'Erro de conexão. Verifique sua internet.',
  };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; 