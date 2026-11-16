// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase web config. These values identify the project and are safe to publish;
// access is controlled by Firestore Security Rules (see firestore.rules).
// "diamondplan" is the Firebase project's original working name; project IDs can't be renamed.
const firebaseConfig = {
  projectId: 'diamondplan',
  appId: '1:416509485060:web:2106ff5116e0a031821551',
  storageBucket: 'diamondplan.firebasestorage.app',
  apiKey: 'AIzaSyCnZMTR5AM8yf9JaVH6r6jzDZSggN4jAWs',
  authDomain: 'diamondplan.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '416509485060',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
