const { initializeApp } = require("firebase/app");
const { getFirestore, setDoc, doc } = require("firebase/firestore");

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCtToE2goCQ8jZyZjEb4Tng7cPeG36iNiA",
    authDomain: "dukebookingsytem.firebaseapp.com",
    projectId: "dukebookingsytem",
    storageBucket: "https://dukebookingsytem-default-rtdb.firebaseio.com/",
    messagingSenderId: "71140441384",
    appId: "1:71140441384:ios:29ca2f3588abf33b47241d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to Initialize Firestore
const initializeDatabase = async () => {
    try {
        await setDoc(doc(db, "plans", "free"), { name: "Free", staffLimit: 0, features: ["basic invoicing"] });
        await setDoc(doc(db, "plans", "pro"), { name: "Pro", staffLimit: 5, features: ["unlimited invoices", "client portal"] });
        await setDoc(doc(db, "plans", "business"), { name: "Business", staffLimit: 20, features: ["payroll", "staff management"] });
        await setDoc(doc(db, "plans", "enterprise"), { name: "Enterprise", staffLimit: 100, features: ["white-label", "API access"] });

        console.log("Firestore initialized successfully!");
    } catch (error) {
        console.error("Error initializing Firestore:", error);
    }
};

// Run the function
initializeDatabase();