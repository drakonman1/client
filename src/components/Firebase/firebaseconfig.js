// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCtToE2goCQ8jZyZjEb4Tng7cPeG36iNiA",
    authDomain: "dukebookingsytem.firebaseapp.com",
    projectId: "dukebookingsytem",
    storageBucket: "https://dukebookingsytem-default-rtdb.firebaseio.com/",
    messagingSenderId: "71140441384",
    appId: "1:71140441384:ios:29ca2f3588abf33b47241d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Ensure Firestore is initialized correctly
export default app;