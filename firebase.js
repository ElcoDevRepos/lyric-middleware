const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const admin = require('firebase-admin');
var serviceAccount = require("../md-care-forms-firebase-adminsdk-bfjv8-b479df0440.json");

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "md-care-forms.firebaseapp.com",
    projectId: "md-care-forms",
    storageBucket: "md-care-forms.appspot.com",
    messagingSenderId: "245494812776",
    appId: "1:245494812776:web:47d9f4c1a2b46ee2c16bdd",
    measurementId: "G-ZZ57DS7FWW",
};

admin.initializeApp({...firebaseConfig,
    credential: admin.credential.cert(serviceAccount)
});
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

module.exports = { firestore, admin };