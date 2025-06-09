# Fiscaliza AI 🏙️

O Fiscaliza AI é um aplicativo móvel desenvolvido para a disciplina de Projeto de Dispositivos Móveis (5PDM), com o objetivo de contribuir para a construção de cidades inteligentes através do engajamento cidadão. O aplicativo permite que os usuários reportem problemas urbanos, auxiliando a prefeitura no mapeamento e gestão de questões municipais.

## 🎯 Objetivo

O projeto visa facilitar a comunicação entre cidadãos e a administração pública, permitindo:
- Reportar problemas urbanos (vias, iluminação, limpeza, etc.)
- Visualizar problemas reportados em um mapa interativo
- Acompanhar o status das solicitações
- Contribuir com votos e comentários em problemas existentes
- Gerar métricas para análise da prefeitura

## 🛠️ Tecnologias Utilizadas

- **Framework Principal**: React Native com Expo
- **Navegação**: Expo Router (File-based routing)
- **Gerenciamento de Estado**: Zustand
- **Mapas**: React Native Maps
- **Animações**: React Native Reanimated
- **Localização**: Expo Location
- **Armazenamento**: Async Storage
- **UI/UX**: Material Icons, Expo Blur
- **Linguagem**: TypeScript

## 📱 Funcionalidades Principais

- Mapa interativo com marcadores de problemas
- Sistema de filtros por categoria e status
- Geolocalização do usuário
- Upload de imagens
- Sistema de votação e comentários
- Perfil do usuário e histórico de reportes
- Ranking de usuários mais ativos
- Interface moderna e responsiva

## 🚀 Como Executar o Projeto

1. **Pré-requisitos**
   - Node.js (versão LTS recomendada)
   - npm ou yarn
   - Expo CLI (`npm install -g expo-cli`)
   - Android Studio (para emulador Android) ou Xcode (para iOS)

2. **Instalação**
   ```bash
   # Clone o repositório
   git clone https://github.com/Couks/fiscaliza-ai

   # Entre no diretório
   cd fiscaliza-ai

   # Instale as dependências
   npm install
   ```

3. **Executando o Projeto**
   ```bash
   # Inicie o servidor de desenvolvimento
   npx expo start
   ```

4. **Opções de Execução**
   - Pressione `a` para abrir no emulador Android
   - Pressione `i` para abrir no simulador iOS
   - Escaneie o QR Code com o app Expo Go (disponível na Play Store/App Store)

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "expo": "~53.0.9",
    "expo-router": "~5.0.6",
    "react-native-maps": "1.20.1",
    "react-native-reanimated": "~3.17.4",
    "zustand": "^5.0.5",
    "expo-location": "~18.1.5"
  }
}
```

## 🏗️ Estrutura do Projeto

```
fiscaliza-ai/
├── app/                   # Diretório principal do aplicativo
│   ├── (tabs)/            # Rotas principais (tabs)
│   ├── _layout.tsx        # Layout principal
│   └── ...                # Outras telas
├── assets/                # Recursos estáticos
├── components/            # Componentes reutilizáveis
├── stores/                # Gerenciamento de estado (Zustand)
└── types/                 # Definições de tipos TypeScript
```

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- Matheus Castro - Desenvolvimento inicial
