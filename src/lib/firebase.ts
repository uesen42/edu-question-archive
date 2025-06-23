
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyA5H5967YVi9encqZKJYk5SSIOfdeYNLpE",
  authDomain: "questiondatabase-eeae3.firebaseapp.com",
  projectId: "questiondatabase-eeae3",
  storageBucket: "questiondatabase-eeae3.firebasestorage.app",
  messagingSenderId: "555551979909",
  appId: "1:555551979909:web:920acbbf4a077e1c9fecec",
  measurementId: "G-536BV1LV27"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerini export et
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
