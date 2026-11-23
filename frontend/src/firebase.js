import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDa2y7_N8LGXbFBG3N3zbae2snjdryPzUw',
  authDomain: 'contador-puntos-test.firebaseapp.com',
  projectId: 'contador-puntos-test',
  storageBucket: 'contador-puntos-test.firebasestorage.app',
  messagingSenderId: '611999546858',
  appId: '1:611999546858:web:cca50a70941c0751cac693',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);