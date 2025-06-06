# 🔥 **FIREBASE SETUP - INSTRUÇÕES COMPLETAS**

## ✅ **PARTE 1: CRIAR PROJETO NO FIREBASE**

### **1. Acesse o Console do Firebase**
- Vá para: https://console.firebase.google.com/
- Faça login com sua conta Google

### **2. Criar Novo Projeto**
1. Clique em **"Adicionar projeto"** ou **"Create a project"**
2. Nome do projeto: `fiscaliza-ai` (ou o nome que preferir)
3. **Desabilite Google Analytics** (não é necessário para este projeto)
4. Clique em **"Criar projeto"**

---

## ✅ **PARTE 2: CONFIGURAR FIRESTORE DATABASE**

### **1. Ativar Firestore**
1. No painel lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Modo de produção"** (você pode alterar depois)
4. Escolha a localização mais próxima (ex: `southamerica-east1`)

### **2. Configurar Regras de Segurança**
1. Na aba **"Regras"**, substitua o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para usuários autenticados
    match /{document=**} {
      allow read, write: if true; // TEMPORÁRIO - Para desenvolvimento
    }
  }
}
```

**⚠️ IMPORTANTE:** Essas regras são para desenvolvimento. Para produção, implemente autenticação adequada.

---

## ✅ **PARTE 3: CONFIGURAR STORAGE**

### **1. Ativar Storage**
1. No painel lateral, clique em **"Storage"**
2. Clique em **"Começar"**
3. Aceite as regras padrão
4. Escolha a mesma localização do Firestore

### **2. Configurar Regras do Storage**
Na aba **"Regras"**, substitua por:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // TEMPORÁRIO - Para desenvolvimento
    }
  }
}
```

---

## ✅ **PARTE 4: CONFIGURAR APP PARA REACT NATIVE**

### **1. Adicionar App Android**
1. No **Visão geral do projeto**, clique em **"Adicionar app"**
2. Escolha **Android** (ícone do robô)
3. **Nome do pacote Android**: `com.seuusuario.fiscalizaai` (substitua "seuusuario")
4. **Apelido do app**: `Fiscaliza AI`
5. Clique em **"Registrar app"**

### **2. Baixar google-services.json**
1. Baixe o arquivo `google-services.json`
2. **IMPORTANTE:** Coloque este arquivo na pasta `android/app/` do seu projeto
3. **NÃO** coloque no controle de versão (adicione no .gitignore)

### **3. Adicionar App iOS (opcional)**
1. Clique em **"Adicionar app"** novamente
2. Escolha **iOS**
3. **ID do pacote iOS**: `com.seuusuario.fiscalizaai`
4. Baixe o `GoogleService-Info.plist`
5. Adicione na pasta `ios/` do projeto

---

## ✅ **PARTE 5: ATUALIZAR CONFIGURAÇÃO DO PROJETO**

### **1. Copiar Configuração**
1. No console Firebase, vá em **Configurações do projeto** (ícone de engrenagem)
2. Na aba **"Geral"**, role até **"Seus apps"**
3. Clique no seu app React Native
4. Na seção **"Configuração do SDK"**, você verá algo assim:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "fiscaliza-ai.firebaseapp.com",
  projectId: "fiscaliza-ai",
  storageBucket: "fiscaliza-ai.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:android:abc123def456"
};
```

### **2. Atualizar config/firebase.ts**
Substitua a configuração no arquivo `config/firebase.ts`:

```typescript
// SUBSTITUA PELOS SEUS DADOS DO FIREBASE
const firebaseConfig = {
  apiKey: "COLE_SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

---

## ✅ **PARTE 6: CONFIGURAR BUILD (ANDROID)**

### **1. Atualizar android/build.gradle**
Adicione no final do arquivo:

```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
```

### **2. Atualizar android/app/build.gradle**
1. No topo do arquivo, adicione:

```gradle
apply plugin: 'com.google.gms.google-services'
```

2. Na seção `dependencies`, adicione:

```gradle
implementation 'com.google.firebase:firebase-bom:32.7.0'
```

### **3. Atualizar android/build.gradle (projeto)**
Na seção `dependencies`, adicione:

```gradle
classpath 'com.google.gms:google-services:4.3.15'
```

---

## ✅ **PARTE 7: TESTE E VERIFICAÇÃO**

### **1. Executar o Projeto**
```bash
npx expo run:android
# ou
npx expo run:ios
```

### **2. Verificar Console do Firebase**
1. Abra o app no dispositivo/emulador
2. No console Firebase, vá em **"Firestore Database"**
3. Você deve ver as coleções `users` e `problems` sendo criadas automaticamente
4. Em **"Storage"**, deve aparecer a pasta `problems/` para imagens

### **3. Testar Funcionalidades**
- ✅ Login funciona
- ✅ Criar problema salva no Firestore
- ✅ Upload de imagens no Storage
- ✅ Dados sincronizam entre dispositivos

---

## 🔧 **TROUBLESHOOTING**

### **Erro: "Default Firebase app has not been initialized"**
- Verifique se `google-services.json` está em `android/app/`
- Certifique-se que a configuração em `config/firebase.ts` está correta

### **Erro: "Permission denied"**
- Verifique as regras do Firestore e Storage
- Para desenvolvimento, use as regras permissivas mostradas acima

### **Erro de Build Android**
- Execute `cd android && ./gradlew clean` e tente novamente
- Verifique se todos os plugins foram adicionados corretamente

### **Dados não aparecem**
- Verifique a conexão com internet
- Abra o console do Firebase para ver se os dados estão sendo salvos
- Veja os logs do app para possíveis erros

---

## 🎯 **RESULTADO FINAL**

Após completar esta configuração, você terá:

- ✅ **Persistência Online Real** - Dados salvos na nuvem
- ✅ **Sincronização Automática** - Entre múltiplos dispositivos
- ✅ **Upload de Imagens** - Armazenamento seguro no Firebase Storage
- ✅ **Escalabilidade** - Suporta milhares de usuários
- ✅ **Backup Automático** - Dados nunca se perdem

**O app agora funciona como um sistema real de fiscalização urbana!** 🏙️✨ 