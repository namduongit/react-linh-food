// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_Lk40-hzuCxSgMHNBXr0cw4HcT65QNyU",
  authDomain: "linh-food.firebaseapp.com",
  projectId: "linh-food",
  storageBucket: "linh-food.firebasestorage.app",
  messagingSenderId: "845685820639",
  appId: "1:845685820639:web:60b011bf95d664addaad6a",
  measurementId: "G-03NYKQZDQ8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Lưu ảnh
const projectStorage = firebase.storage();
// Lưu cơ sơ dữ liệu
const projectFirestore = firebase.firestore();
// Đăng nhập thông qua ứng dụng (Google, Facebook, ...)
const projectAuth = firebase.auth();

export { projectStorage, projectFirestore, projectAuth };