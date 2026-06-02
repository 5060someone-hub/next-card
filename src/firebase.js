import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDEFbYGoloyGN1rF3sANDtjWTZnnR_t_s",
  authDomain: "nextcard-blog.firebaseapp.com",
  projectId: "nextcard-blog",
  storageBucket: "nextcard-blog.firebasestorage.app",
  messagingSenderId: "833957827939",
  appId: "1:833957827939:web:15ccc15703218b17b0af56",
  measurementId: "G-MV1D2PCWSY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
