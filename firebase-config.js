import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// import {
//   getFirestore
// } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQEGSz_SPJzbAwkdaRICtphmLIytRmgOQ",
  authDomain: "ngphanhh46.firebaseapp.com",
  projectId: "ngphanhh46",
  storageBucket: "ngphanhh46.firebasestorage.app",
  messagingSenderId: "716934184707",
  appId: "1:716934184707:web:bc3f2d69b184f25578b336"
};
export default firebaseConfig;

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

