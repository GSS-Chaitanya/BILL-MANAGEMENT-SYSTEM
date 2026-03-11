// Firebase configuration & initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCGFKuETtCCGOuSoGfrz0SSeB_3rHxNKXc",
    authDomain: "bill-management-system-8c219.firebaseapp.com",
    projectId: "bill-management-system-8c219",
    storageBucket: "bill-management-system-8c219.firebasestorage.app",
    messagingSenderId: "427010885776",
    appId: "1:427010885776:web:9e626923e4cebbd2f13015",
    measurementId: "G-S20YSYFCGT"
};

const app = initializeApp(firebaseConfig);
export const fireAuth = getAuth(app);
export const fireDB = getFirestore(app);
