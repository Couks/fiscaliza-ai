import { FirebaseApp, getApps, initializeApp } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Configuração do Firebase - você vai preencher com seus dados
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "fiscaliza-ai.firebaseapp.com",
  projectId: "fiscaliza-ai",
  storageBucket: "fiscaliza-ai.appspot.com",
  messagingSenderId: "123456789",
  appId: "SUA_APP_ID"
};

// Inicializar Firebase apenas se ainda não foi inicializado
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Exportar instâncias
export { firestore, storage };
export default app; 