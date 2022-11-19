// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyDkVv0a11_Eqd5okHFvoCog5_lBqWfnSZo",
  authDomain: "inst-clone-react-8a913.firebaseapp.com",
  projectId: "inst-clone-react-8a913",
  storageBucket: "inst-clone-react-8a913.appspot.com",
  messagingSenderId: "890949521269",
  appId: "1:890949521269:web:943d67adc559310a388d3c",
  measurementId: "G-JVKVV63FSF"
});

// Initialize Firebase

const db = firebase.firestore();

const realtime_db = getDatabase(firebaseApp);

export {db, realtime_db};