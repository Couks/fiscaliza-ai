// Tipos de dados
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  level: number;
  points: number;
  ranking: number;
  badges: Badge[];
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  progress: number;
  earnedAt?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: 'road' | 'lighting' | 'cleaning' | 'others';
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  images: string[];
  reportedBy: string; // userId
  reportedAt: string;
  resolvedAt?: string;
  votes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
}

// Dados mockados
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    password: '123456',
    avatar: 'https://videos.openai.com/vg-assets/assets%2Ftask_01jwwzbzctetdtyv1dhtwvmhx7%2F1749024148_img_1.webp?st=2025-06-05T02%3A40%3A00Z&se=2025-06-11T03%3A40%3A00Z&sks=b&skt=2025-06-05T02%3A40%3A00Z&ske=2025-06-11T03%3A40%3A00Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=aa5ddad1-c91a-4f0a-9aca-e20682cc8969&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=EkuDElonD7iO2%2B1Cw2odkWoThdQo6Ucb%2B2LFBeF%2B7tE%3D&az=oaivgprodscus',
    level: 5,
    points: 1250,
    ranking: 47,
    badges: [
      {
        id: '1',
        name: 'Herói da Limpeza',
        description: 'Reportou 10 problemas de limpeza',
        icon: 'cleaning-services',
        color: '#9C27B0',
        earned: true,
        progress: 100,
        earnedAt: '2024-01-10',
      },
      {
        id: '2',
        name: 'Guardião da Cidade',
        description: 'Reportou 25 problemas no total',
        icon: 'security',
        color: '#2196F3',
        earned: true,
        progress: 100,
        earnedAt: '2024-01-15',
      },
      {
        id: '3',
        name: 'Observador de Iluminação',
        description: 'Reportou 5 problemas de iluminação',
        icon: 'lightbulb',
        color: '#FF9800',
        earned: true,
        progress: 100,
        earnedAt: '2024-01-08',
      },
      {
        id: '4',
        name: 'Especialista em Vias',
        description: 'Reporte 15 problemas de vias públicas',
        icon: 'construction',
        color: '#F44336',
        earned: false,
        progress: 73,
      },
      {
        id: '5',
        name: 'Cidadão Exemplar',
        description: 'Reporte 50 problemas no total',
        icon: 'emoji-events',
        color: '#FFD700',
        earned: false,
        progress: 46,
      },
      {
        id: '6',
        name: 'Vigilante Noturno',
        description: 'Reporte problemas durante a madrugada',
        icon: 'nights-stay',
        color: '#673AB7',
        earned: false,
        progress: 0,
      },
    ],
    createdAt: '2023-12-01',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    password: '123456',
    avatar: 'https://avatars.githubusercontent.com/u/49662686?v=4',
    level: 3,
    points: 820,
    ranking: 78,
    badges: [
      {
        id: '1',
        name: 'Herói da Limpeza',
        description: 'Reportou 10 problemas de limpeza',
        icon: 'cleaning-services',
        color: '#9C27B0',
        earned: true,
        progress: 100,
        earnedAt: '2024-01-12',
      },
      {
        id: '3',
        name: 'Observador de Iluminação',
        description: 'Reportou 5 problemas de iluminação',
        icon: 'lightbulb',
        color: '#FF9800',
        earned: false,
        progress: 60,
      },
    ],
    createdAt: '2024-01-05',
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
    password: '123456',
    avatar: 'https://avatars.githubusercontent.com/u/49662686?v=4',
    level: 2,
    points: 450,
    ranking: 156,
    badges: [
      {
        id: '1',
        name: 'Herói da Limpeza',
        description: 'Reportou 10 problemas de limpeza',
        icon: 'cleaning-services',
        color: '#9C27B0',
        earned: false,
        progress: 30,
      },
    ],
    createdAt: '2024-01-18',
  },
];

export const mockProblems: Problem[] = [
  {
    id: '1',
    title: 'Buraco na Estrada do Galeão',
    description: 'Buraco grande na pista causando problemas para veículos. O buraco tem aproximadamente 1 metro de diâmetro e está localizado próximo ao acesso ao Aeroporto Internacional Tom Jobim.',
    category: 'road',
    status: 'pending',
    priority: 'high',
    location: {
      latitude: -22.8088162,
      longitude: -43.1965648,
      address: 'Estrada do Galeão, 1200 - Galeão, Rio de Janeiro - RJ',
    },
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkfiX6VxBp9L3GvGR69wKo7zUQv-l4N9vv-A&s',
      'https://www.conjur.com.br/wp-content/uploads/2024/12/damaged-american-road-surface-with-deep-pothole-ruined-street-urgent-need-repair-scaled.jpg',
    ],
    reportedBy: '1',
    reportedAt: '2024-01-15T14:30:00.000Z',
    votes: 8,
    comments: [
      {
        id: '1',
        text: 'Confirmado! Esse buraco está causando muitos problemas.',
        userId: '2',
        userName: 'Maria Santos',
        createdAt: '2024-01-15T16:45:00.000Z',
      },
      {
        id: '2',
        text: 'Já reportei para a prefeitura também.',
        userId: '3',
        userName: 'Carlos Oliveira',
        createdAt: '2024-01-16T09:20:00.000Z',
      },
    ],
  },
  {
    id: '2',
    title: 'Lâmpada Queimada - Rua Pracinha José Varela',
    description: 'Poste de iluminação não está funcionando na Praça Luís de Camões, deixando a área escura durante a noite e comprometendo a segurança dos pedestres.',
    category: 'lighting',
    status: 'in_progress',
    priority: 'medium',
    location: {
      latitude: -22.818955, 
      longitude: -43.179716,
      address: 'Rua Pracinha José Varela, 203-133 - Pitangueiras, Rio de Janeiro - RJ',
    },
    images: [
      'https://www.clickguarulhos.com.br/wp-content/uploads/2019/07/20190730-lampada-queimada_palmira-rossi_recreio-sao-jorge-1.jpeg',
    ],
    reportedBy: '2',
    reportedAt: '2024-01-14T19:15:00.000Z',
    votes: 5,
    comments: [
      {
        id: '3',
        text: 'A prefeitura já foi notificada e está trabalhando na solução.',
        userId: '1',
        userName: 'João Silva',
        createdAt: '2024-01-15T11:30:00.000Z',
      },
    ],
  },
  {
    id: '3',
    title: 'Lixo Acumulado - Rua Barata Ribeiro',
    description: 'Acúmulo de lixo na calçada da Rua Barata Ribeiro, no Jardim Guanabara. O lixo não foi coletado há vários dias e está atraindo insetos.',
    category: 'cleaning',
    status: 'resolved',
    priority: 'medium',
    location: {
      latitude: -22.810044, 
      longitude: -43.203333,
      address: 'Rua Barata Ribeiro, 456 - Jardim Guanabara, Rio de Janeiro - RJ',
    },
    images: [
      'https://www.correiodopovo.com.br/image/contentid/policy:1.835863:1677755916/lixoALS.jpeg.jpeg?a=2%3A1&$p$a=72124cc',
    ],
    reportedBy: '1',
    reportedAt: '2024-01-13T08:45:00.000Z',
    resolvedAt: '2024-01-14T14:20:00.000Z',
    votes: 12,
    comments: [
      {
        id: '4',
        text: 'Problema resolvido! Obrigado pela limpeza.',
        userId: '2',
        userName: 'Maria Santos',
        createdAt: '2024-01-14T15:00:00.000Z',
      },
    ],
  },
  {
    id: '4',
    title: 'Semáforo com Defeito - Rua Transilvânia',
    description: 'Semáforo do cruzamento da Av. Maestro Júlio Cristóbal com Rua Cambaúba não está funcionando corretamente, criando risco de acidentes no trânsito intenso da região.',
    category: 'others',
    status: 'pending',
    priority: 'high',
    location: {
      latitude: -22.804519,
      longitude: -43.188436,
      address: 'Rua Transilvânia, 287-273 - Jardim Carioca, Rio de Janeiro - RJ',
    },
    images: [
      'data:image/jpeg;base64,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',
    ],
    reportedBy: '3',
    reportedAt: '2024-01-12T16:20:00.000Z',
    votes: 15,
    comments: [
      {
        id: '5',
        text: 'Muito perigoso! Precisa ser consertado urgente.',
        userId: '1',
        userName: 'João Silva',
        createdAt: '2024-01-12T18:30:00.000Z',
      },
      {
        id: '6',
        text: 'Já liguei para o trânsito reportando.',
        userId: '2',
        userName: 'Maria Santos',
        createdAt: '2024-01-13T07:15:00.000Z',
      },
    ],
  },
  {
    id: '5',
    title: 'Calçada Danificada - R. Prof. Hilarião da Rocha',
    description: 'Calçada com buracos e rachaduras na Rua Nelson Rodrigues, em frente ao shopping, dificultando a passagem de pedestres, especialmente idosos e pessoas com mobilidade reduzida.',
    category: 'road',
    status: 'in_progress',
    priority: 'medium',
    location: {
      latitude: -22.796456, 
      longitude: -43.185250,
      address: 'R. Prof. Hilarião da Rocha, 170-350 - Tauá, Rio de Janeiro - RJ',
    },
    images: [
      'https://portal-arquivos.engeplus.com.br/cache/noticia/geral/2012/calcada-danificada-e-responsabilidade-do-morador/calcada-danificada-e-responsabilidade-do-morador-933618.jpg',
    ],
    reportedBy: '2',
    reportedAt: '2024-01-11T10:30:00.000Z',
    votes: 7,
    comments: [],
  },
];

// Estatísticas globais
export const mockStats = {
  totalProblems: mockProblems.length,
  resolvedProblems: mockProblems.filter(p => p.status === 'resolved').length,
  pendingProblems: mockProblems.filter(p => p.status === 'pending').length,
  inProgressProblems: mockProblems.filter(p => p.status === 'in_progress').length,
  totalUsers: mockUsers.length,
  activeUsers: mockUsers.filter(u => u.points > 0).length,
}; 