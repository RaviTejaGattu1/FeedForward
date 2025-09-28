
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'studio-9995139084-e7afe',
  appId: '1:100357465857:web:455f3e800343365282dd00',
  apiKey: 'AIzaSyB9tM9LRH7EUprFX2RWje_3Uhe5rFFYG2A',
  authDomain: 'studio-9995139084-e7afe.firebaseapp.com',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
