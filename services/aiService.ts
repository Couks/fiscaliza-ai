import { GoogleGenAI } from '@google/genai';
import * as FileSystem from 'expo-file-system';

interface AIAnalysisInput {
  description: string;
  imageUri?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface AIAnalysisOutput {
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedCategory: 'road' | 'lighting' | 'cleaning' | 'others';
  suggestedPriority: 'low' | 'medium' | 'high';
  confidence: number;
  imageAnalysis?: string;
}

// Mapeamento de categorias do formulário para as categorias do sistema
const CATEGORY_MAPPING: { [key: string]: 'road' | 'lighting' | 'cleaning' | 'others' } = {
  'lighting': 'lighting',
  'pothole': 'road',
  'road': 'road',
  'buraco': 'road',
  'via': 'road',
  'rua': 'road',
  'asfalto': 'road',
  'trash': 'cleaning',
  'lixo': 'cleaning',
  'cleaning': 'cleaning',
  'limpeza': 'cleaning',
  'sujeira': 'cleaning',
  'traffic': 'others',
  'trânsito': 'others',
  'transito': 'others',
  'water': 'others',
  'água': 'others',
  'esgoto': 'others',
  'others': 'others',
};

// Palavras-chave para determinar prioridade
const HIGH_PRIORITY_KEYWORDS = [
  'perigoso', 'urgente', 'risco', 'acidente', 'grave', 'sério', 'emergência',
  'emergencia', 'crítico', 'critico', 'imediato', 'vazamento', 'grande',
  'enorme', 'bloqueado', 'bloqueando', 'impedindo', 'trânsito', 'transito'
];

const MEDIUM_PRIORITY_KEYWORDS = [
  'problema', 'incomodo', 'incômodo', 'atrapalha', 'dificulta', 'ruim',
  'médio', 'medio', 'moderado', 'atenção', 'atencao'
];

// CONFIGURAÇÃO CORRETA para Google AI Studio baseada na documentação oficial
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
let genAI: GoogleGenAI | null = null;

// Inicializar Gemini conforme documentação oficial do @google/genai
if (GEMINI_API_KEY) {
  try {
    // Sintaxe correta baseada na documentação oficial
    genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log('Google AI Studio inicializado corretamente');
  } catch (error) {
    console.warn('Erro ao inicializar Google AI Studio:', error);
  }
}

// Análise com Google AI Studio usando sintaxe oficial do @google/genai
export const analyzeWithGemini = async (input: AIAnalysisInput): Promise<AIAnalysisOutput> => {
  if (!genAI) {
    console.warn('Google AI Studio não está configurado, usando análise local');
    return analyzeWithAI(input);
  }

  try {
    console.log('Iniciando análise com Google AI Studio...');
    
    // Prompt base
    const basePrompt = `
Você é um especialista em análise de problemas urbanos. Analise a seguinte informação e forneça uma resposta em JSON válido.

DESCRIÇÃO ORIGINAL: "${input.description}"
LOCALIZAÇÃO: ${input.location ? `${input.location.latitude}, ${input.location.longitude}` : 'Não informada'}

INSTRUÇÕES:
1. Analise a descrição e a imagem (se fornecida) para identificar o problema urbano
2. Melhore a descrição original, tornando-a mais clara e técnica (mantenha em português)
3. Categorize corretamente o problema
4. Determine a prioridade baseada na gravidade e risco
5. Gere um título conciso e descritivo

CATEGORIAS VÁLIDAS:
- "road": problemas em vias, buracos, asfalto, calçadas
- "lighting": iluminação pública, postes, lâmpadas  
- "cleaning": lixo, limpeza urbana, mato, entulho
- "others": trânsito, água, esgoto, outros problemas

PRIORIDADES VÁLIDAS:
- "low": sem risco imediato, problema estético ou menor
- "medium": problema que causa incômodo ou requer atenção
- "high": situação de risco, emergência ou que impede o trânsito

RESPONDA APENAS COM JSON VÁLIDO NO FORMATO:
{
  "suggestedTitle": "título descritivo de até 60 caracteres",
  "suggestedDescription": "descrição melhorada e mais técnica",
  "suggestedCategory": "uma das categorias válidas",
  "suggestedPriority": "uma das prioridades válidas",
  "confidence": 0.85,
  "imageAnalysis": "descrição do que foi observado na imagem (se houver)"
}`;

    // Preparar conteúdo para o Gemini usando sintaxe do @google/genai
    let contents: any[] = [basePrompt];

    // Adicionar imagem se fornecida
    if (input.imageUri) {
      try {
        const base64Image = await imageToBase64(input.imageUri);
        // Formato correto para imagem conforme @google/genai
        contents.push({
          inlineData: {
            data: base64Image,
            mimeType: "image/jpeg"
          }
        });
        console.log('Imagem adicionada à análise do Gemini');
      } catch (error) {
        console.warn('Erro ao processar imagem, continuando sem ela:', error);
      }
    }

    // Sintaxe correta conforme documentação oficial do @google/genai
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: contents
    });

    const text = response.text;

    // Verificar se a resposta tem conteúdo
    if (!text) {
      console.error('Google AI Studio retornou resposta vazia');
      return analyzeWithAI(input);
    }

    console.log('Resposta recebida do Google AI Studio com sucesso');

    // Processar resposta JSON
    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsedResult = JSON.parse(cleanedText);
      
      // Validar e retornar resposta estruturada
      return {
        suggestedTitle: parsedResult.suggestedTitle || 'Problema reportado',
        suggestedDescription: parsedResult.suggestedDescription || input.description,
        suggestedCategory: parsedResult.suggestedCategory || 'others',
        suggestedPriority: parsedResult.suggestedPriority || 'medium',
        confidence: Math.min(Math.max(parsedResult.confidence || 0.7, 0), 1),
        imageAnalysis: parsedResult.imageAnalysis || undefined
      };
    } catch (parseError) {
      console.error('Erro ao processar JSON do Google AI Studio:', parseError);
      console.log('Resposta bruta:', text);
      
      // Fallback para análise local
      return analyzeWithAI(input);
    }

  } catch (error) {
    console.error('Erro na chamada do Google AI Studio:', error);
    // Fallback para análise local em caso de erro
    return analyzeWithAI(input);
  }
};

// Simula uma análise de IA local (fallback)
export const analyzeWithAI = async (input: AIAnalysisInput): Promise<AIAnalysisOutput> => {
  // Simula delay de processamento
  await new Promise(resolve => setTimeout(resolve, 2000));

  const { description, imageUri, location } = input;
  const descriptionLower = description.toLowerCase();

  // Análise de categoria baseada em palavras-chave
  let suggestedCategory: 'road' | 'lighting' | 'cleaning' | 'others' = 'others';
  let categoryConfidence = 0.5;

  for (const [keyword, category] of Object.entries(CATEGORY_MAPPING)) {
    if (descriptionLower.includes(keyword)) {
      suggestedCategory = category;
      categoryConfidence = 0.8;
      break;
    }
  }

  // Análise específica por tipo de problema
  if (descriptionLower.includes('luz') || descriptionLower.includes('lâmpada') || 
      descriptionLower.includes('lampada') || descriptionLower.includes('poste') ||
      descriptionLower.includes('iluminação') || descriptionLower.includes('iluminacao') ||
      descriptionLower.includes('escuro') || descriptionLower.includes('apagada')) {
    suggestedCategory = 'lighting';
    categoryConfidence = 0.9;
  } else if (descriptionLower.includes('buraco') || descriptionLower.includes('asfalto') ||
             descriptionLower.includes('rua') || descriptionLower.includes('via') ||
             descriptionLower.includes('calçada') || descriptionLower.includes('calcada') ||
             descriptionLower.includes('pavimento') || descriptionLower.includes('estrada')) {
    suggestedCategory = 'road';
    categoryConfidence = 0.9;
  } else if (descriptionLower.includes('lixo') || descriptionLower.includes('sujeira') ||
             descriptionLower.includes('limpeza') || descriptionLower.includes('entulho') ||
             descriptionLower.includes('mato') || descriptionLower.includes('grama')) {
    suggestedCategory = 'cleaning';
    categoryConfidence = 0.9;
  }

  // Análise de prioridade baseada em palavras-chave
  let suggestedPriority: 'low' | 'medium' | 'high' = 'medium';
  
  const hasHighPriorityKeywords = HIGH_PRIORITY_KEYWORDS.some(keyword => 
    descriptionLower.includes(keyword)
  );
  
  const hasMediumPriorityKeywords = MEDIUM_PRIORITY_KEYWORDS.some(keyword => 
    descriptionLower.includes(keyword)
  );

  if (hasHighPriorityKeywords) {
    suggestedPriority = 'high';
  } else if (hasMediumPriorityKeywords) {
    suggestedPriority = 'medium';
  } else {
    suggestedPriority = 'low';
  }

  // Geração de título baseado na categoria e descrição
  let suggestedTitle = 'Problema reportado';
  
  const firstSentence = description.split('.')[0].split('!')[0].split('?')[0];
  const words = firstSentence.trim().split(' ');
  
  if (words.length > 0) {
    // Capitaliza a primeira letra e limita a 60 caracteres
    const title = firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
    suggestedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  }

  // Melhoria da descrição original
  let suggestedDescription = description;
  if (description.length < 50) {
    // Expandir descrições muito curtas baseado na categoria
    if (suggestedCategory === 'lighting') {
      suggestedDescription = `${description}. Problema relacionado à iluminação pública que pode comprometer a segurança do local.`;
    } else if (suggestedCategory === 'road') {
      suggestedDescription = `${description}. Dano na via pública que pode causar riscos para pedestres e veículos.`;
    } else if (suggestedCategory === 'cleaning') {
      suggestedDescription = `${description}. Problema de limpeza urbana que afeta a qualidade do ambiente.`;
    }
  }

  // Títulos específicos por categoria
  if (suggestedCategory === 'lighting') {
    if (descriptionLower.includes('apagada') || descriptionLower.includes('queimada')) {
      suggestedTitle = 'Lâmpada apagada na via';
    } else if (descriptionLower.includes('poste')) {
      suggestedTitle = 'Problema na iluminação pública';
    } else {
      suggestedTitle = 'Problema de iluminação';
    }
  } else if (suggestedCategory === 'road') {
    if (descriptionLower.includes('buraco')) {
      suggestedTitle = suggestedPriority === 'high' ? 'Buraco perigoso na via' : 'Buraco na via';
    } else if (descriptionLower.includes('asfalto')) {
      suggestedTitle = 'Problema no asfalto';
    } else {
      suggestedTitle = 'Problema na via';
    }
  } else if (suggestedCategory === 'cleaning') {
    if (descriptionLower.includes('lixo')) {
      suggestedTitle = 'Acúmulo de lixo';
    } else if (descriptionLower.includes('mato')) {
      suggestedTitle = 'Mato alto no local';
    } else {
      suggestedTitle = 'Problema de limpeza';
    }
  }

  // Simular análise de imagem
  let imageAnalysis: string | undefined;
  if (imageUri) {
    if (suggestedCategory === 'road') {
      imageAnalysis = 'Imagem mostra danos na via pública que requerem reparo.';
    } else if (suggestedCategory === 'lighting') {
      imageAnalysis = 'Imagem confirma problema na iluminação do local.';
    } else if (suggestedCategory === 'cleaning') {
      imageAnalysis = 'Imagem evidencia acúmulo de material que necessita limpeza.';
    } else {
      imageAnalysis = 'Imagem documenta o problema reportado no local.';
    }
  }

  // Ajusta a confiança final baseada na qualidade da análise
  let finalConfidence = categoryConfidence;
  if (description.length > 20) finalConfidence += 0.1;
  if (imageUri) finalConfidence += 0.15; // Maior peso para imagens
  if (location) finalConfidence += 0.05;
  
  finalConfidence = Math.min(finalConfidence, 1.0);

  return {
    suggestedTitle,
    suggestedDescription,
    suggestedCategory,
    suggestedPriority,
    confidence: finalConfidence,
    imageAnalysis
  };
};

// Função para converter imagem para base64 (para APIs que exigem)
export const imageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Erro ao converter imagem para base64:', error);
    throw error;
  }
};

// Função principal que usa Google AI Studio se disponível, senão fallback para análise local
export const analyzeWithRealAI = async (input: AIAnalysisInput): Promise<AIAnalysisOutput> => {
  if (genAI && GEMINI_API_KEY) {
    console.log('Usando Google AI Studio para análise...');
    return analyzeWithGemini(input);
  } else {
    console.log('Usando análise local (Google AI Studio não configurado)...');
    return analyzeWithAI(input);
  }
}; 