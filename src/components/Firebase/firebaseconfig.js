// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
const { getFirestore, setDoc, doc } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyCtToE2goCQ8jZyZjEb4Tng7cPeG36iNiA",
    authDomain: "dukebookingsytem.firebaseapp.com",
    projectId: "dukebookingsytem",
    storageBucket: "https://dukebookingsytem-default-rtdb.firebaseio.com/",
    messagingSenderId: "71140441384",
    appId: "1:71140441384:ios:29ca2f3588abf33b47241d"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export const db = getFirestore(app); // Ensure Firestore is initialized correctly
export default app;
export { storage };