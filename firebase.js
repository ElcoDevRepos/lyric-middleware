const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "md-care-forms.firebaseapp.com",
    projectId: "md-care-forms",
    storageBucket: "md-care-forms.appspot.com",
    messagingSenderId: "245494812776",
    appId: "1:245494812776:web:47d9f4c1a2b46ee2c16bdd",
    measurementId: "G-ZZ57DS7FWW"
};

const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

module.exports = { firestore };