// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTD5vYOjxRwzMjlorZY_b4WPvhjZMOgXE",
  authDomain: "ltn-seafood.firebaseapp.com",
  projectId: "ltn-seafood",
  storageBucket: "ltn-seafood.appspot.com",
  messagingSenderId: "609523557488",
  appId: "1:609523557488:web:5e1092838facafda2800b5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const projectStorage = firebase.storage();
const projectFirestore = firebase.firestore();
const projectAuth = firebase.auth();

export { projectStorage, projectFirestore, projectAuth };