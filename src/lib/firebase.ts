import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Only Firestore is used, and it needs nothing but the project ID: access is
// controlled entirely by Firestore Security Rules (see firestore.rules).
// "diamondplan" is the Firebase project's original working name; project IDs can't be renamed.
const firebaseConfig = {
  projectId: 'diamondplan',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
