// Firebase Configuration
// This file initializes Firebase and makes 'db' and 'auth' globally available.

const firebaseConfig = {
    apiKey: "AIzaSyCelAVlCt8rGTROwpUOh8viOEYqsJI4vrs",
    authDomain: "wsl-interiors.firebaseapp.com",
    projectId: "wsl-interiors",
    storageBucket: "wsl-interiors.firebasestorage.app",
    messagingSenderId: "626511180358",
    appId: "1:626511180358:web:499c86d89adddd9db39047",
    measurementId: "G-MCZKXWC2C8"
};

// Global variables for Firestore and Auth
// Defined with 'var' to ensure they are accessible in script.js
var db;
var auth;

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);

        // Initialize services
        db = firebase.firestore();
        auth = firebase.auth();

        console.log('✅ Firebase initialized successfully');

        // Dispatch a custom event to signal that Firebase is ready
        // script.js will listen for this event
        document.dispatchEvent(new CustomEvent('firebaseInitialized'));

    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        alert('Firebase initialization failed. Please check your internet connection and refresh the page.');
    }
} else {
    console.error('❌ Firebase SDK not loaded.');
    alert('Failed to load Firebase. Please check your internet connection and refresh the page.');
}
