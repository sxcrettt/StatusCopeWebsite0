// Your web app's Firebase configuration
const firebaseConfig = {
    // Replace with your Firebase config
    apiKey: "AIzaSyBXvZIyjUY_ko1t-xQATxawFfNR-Fa5qEY",
    authDomain: "statuscope-10086.firebaseapp.com",
    projectId:"statuscope-10086",
    storageBucket:"statuscope-10086.firebasestorage.app",
    messagingSenderId: "289714922875",
    appId: "1:289714922875:web:65c833189e3044ee20c9de",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore(); 