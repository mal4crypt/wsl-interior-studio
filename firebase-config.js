// Firebase Configuration

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCelAVlCt8rGTROwpUOh8viOEYqsJI4vrs",
  authDomain: "wsl-interiors.firebaseapp.com",
  projectId: "wsl-interiors",
  storageBucket: "wsl-interiors.firebasestorage.app",
  messagingSenderId: "626511180358",
  appId: "1:626511180358:web:499c86d89adddd9db39047",
  measurementId: "G-MCZKXWC2C8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
